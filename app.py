import streamlit as st
import os
import pandas as pd
import uuid
from datetime import datetime
import zipfile
import io
from src.logs_manager import log, initialize_log_box
from src.resume_llm_handler import resume_stream
from utils.document_utils import *
import traceback

# # Streamlit app frontend

# Set up the app configuration
st.set_page_config(
    page_title="ResumeGenie",
    page_icon="assets/genie_logo.png",
    layout="wide",
)

# Inject custom CSS for styling
st.markdown(
    """
    <style>
    /* Main container styling */
    .block-container {
        max-width: 75%;
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin: 0 auto;
    }
    
    /* Custom styling for buttons */
    .stButton > button {
        width: 100%;
        border-radius: 6px;
        height: 3rem;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .stButton > button:hover {
        opacity: 0.9;
    }
    
    /* Style for the selected button */
    .selected-button > button {
        background-color: #FF4B4B;
        color: white;
    }
    
    /* Submit button styling */
    .main-submit-button > button {
        background-color: #FF4B4B;
        color: white;
        font-size: 1.1rem;
        height: 3.2rem;
    }
    
    .main-submit-button > button:hover {
        background-color: #E03131;
    }
    
    /* Status styling */
    .status-success {
        color: #0CA678;
        background-color: #D3F9D8;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    .status-error {
        color: #E03131;
        background-color: #FFE3E3;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    /* Step card styling */
    .step-card {
        padding-bottom: 1rem;
    }
    
    /* Input field styling for the selected optimization */
    .optimization-input {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #FF4B4B;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# Helper function to save RFP file
def save_rfp_file(rfp_file):
    """Save the uploaded RFP file to disk and return the path"""
    if rfp_file is None:
        return None

    # Generate a unique filename
    file_id = str(uuid.uuid4())[:8]
    file_extension = os.path.splitext(rfp_file.name)[1]
    temp_file_path = f"temp_rfp_{file_id}{file_extension}"

    # Save the file
    with open(temp_file_path, "wb") as f:
        f.write(rfp_file.getbuffer())

    log(f"Saved RFP file: {temp_file_path}")
    return temp_file_path


# App title with logo
col1, col2 = st.columns([1, 11])
with col1:
    # Add custom CSS for increasing the margin
    st.markdown(
        """
    <style>
        div[data-testid="column"]:nth-child(1) img {
            margin-left: 20px !important; 
            margin-top: 25px !important;
            margin-bottom: 20px !important;
        }
    </style>
    """,
        unsafe_allow_html=True,
    )

    st.image(
        "assets/genie_logo.png",
        width=80,
    )
with col2:
    st.title("ResumeGenie")
    st.markdown("<p>Transform your resume in seconds</p>", unsafe_allow_html=True)

# Horizontal divider
st.markdown(
    "<hr style='margin: 1rem 0; border-color: #e5e7eb;'>", unsafe_allow_html=True
)

# Initialize session state for tracking files if it doesn't exist
if "processed_files" not in st.session_state:
    st.session_state.processed_files = []

# Initialize session state for optimization method if it doesn't exist
if "optimization_method" not in st.session_state:
    st.session_state.optimization_method = "No optimization"

# Initialize session state to track which button is selected
if "selected_button" not in st.session_state:
    st.session_state.selected_button = "No optimization"


# Function to update the selected button
def set_optimization_method(method):
    st.session_state.optimization_method = method
    st.session_state.selected_button = method


with st.form("my-form", clear_on_submit=True):
    # Create a card-like effect for the form

    st.subheader("Step 1: Choose Your Resume Format")
    # Add role selection radio button with better styling
    selected_role = st.radio(
        "Select resume format:",
        options=["Developer", "Business Analyst", "Director"],
        index=0,  # Default to Developer
        horizontal=True,  # Display horizontally for better space usage
    )

    # Add custom role title field with improved styling
    custom_role_title = st.text_input(
        "Enter specific role title (optional):",
        help="E.g., 'Senior Full Stack Developer', 'Data Scientist', 'Project Manager'",
        placeholder="e.g. Senior Full Stack Developer",
    )

    # Create a card-like effect for the optimization section
    st.markdown("<div class='step-card'>", unsafe_allow_html=True)
    st.subheader("Step 2: Choose Optimization Method")
    st.markdown("How would you like to optimize the resume?")

    # Create three columns for the buttons
    col1, col2, col3 = st.columns(3)

    # Apply CSS class conditionally based on selected button
    with col1:
        no_optimization_class = (
            "selected-button"
            if st.session_state.selected_button == "No optimization"
            else ""
        )
        st.markdown(f"<div class='{no_optimization_class}'>", unsafe_allow_html=True)
        no_optimization = st.form_submit_button("📄 No optimization")

        if no_optimization:
            set_optimization_method("No optimization")

    with col2:
        enter_desc_class = (
            "selected-button"
            if st.session_state.selected_button == "Enter job description"
            else ""
        )
        st.markdown(f"<div class='{enter_desc_class}'>", unsafe_allow_html=True)
        enter_desc = st.form_submit_button("✏️ Enter job description")

        if enter_desc:
            set_optimization_method("Enter job description")

    with col3:
        upload_rfp_class = (
            "selected-button"
            if st.session_state.selected_button == "Upload RFP document"
            else ""
        )
        st.markdown(f"<div class='{upload_rfp_class}'>", unsafe_allow_html=True)
        upload_rfp = st.form_submit_button("📎 Upload RFP document")
        # st.markdown("<div class='step-card'>", unsafe_allow_html=True)
        if upload_rfp:
            set_optimization_method("Upload RFP document")

    # Show appropriate input based on selection with improved styling
    job_description = ""
    rfp_file = None
    rfp_file_path = None

    if st.session_state.optimization_method == "Enter job description":
        # st.markdown("<div class='optimization-input'>", unsafe_allow_html=True)
        job_description = st.text_area(
            "Enter job description:",
            height=150,
            help="Paste the job description to tailor the resume with relevant keywords and skills.",
            placeholder="Paste job description here...",
        )
        # st.markdown("</div>", unsafe_allow_html=True)
    elif st.session_state.optimization_method == "Upload RFP document":
        # st.markdown("<div class='optimization-input'>", unsafe_allow_html=True)
        rfp_file = st.file_uploader(
            "Upload RFP document:",
            type=["pdf", "docx"],
            help="Upload an RFP document to automatically generate a job description.",
        )
        # st.markdown("</div>", unsafe_allow_html=True)

    # st.markdown("</div>", unsafe_allow_html=True)

    # Create a card-like effect for the file upload section
    st.markdown("<div class='step-card'>", unsafe_allow_html=True)
    st.subheader("Step 3: Upload Your Resume")

    # Resume file uploader with improved styling
    uploaded_files = st.file_uploader(
        "Upload resume files",
        type=["pdf", "docx"],
        accept_multiple_files=True,
        help="Select one or more resume files to process",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    # Add a styled submit button
    st.markdown("<div class='main-submit-button'>", unsafe_allow_html=True)
    submitted = st.form_submit_button("✨ Generate Optimized Resume")
    st.markdown("</div>", unsafe_allow_html=True)

# Initialize log_box
log_box = st.empty()
initialize_log_box(log_box)

if submitted and uploaded_files:
    # Create a progress bar
    progress_bar = st.progress(0)
    status_text = st.empty()
    total_files = len(uploaded_files)
    file_progress_weight = 0.95 / total_files

    # Log the selected role, custom role title, and optimization method
    log(f"Selected role type: {selected_role}")
    if custom_role_title and custom_role_title.strip():
        log(f"Specific role title: {custom_role_title}")
    else:
        log("No specific role title provided - will use role type")

    # Log optimization method selected
    if st.session_state.optimization_method == "Enter job description":
        log(f"Optimization method: Job description (manual entry)")
        if job_description and job_description.strip():
            log(f"Job description provided: {len(job_description)} characters")
        else:
            log("Warning: Job description option selected but no text provided")
    elif st.session_state.optimization_method == "Upload RFP document":
        log(f"Optimization method: RFP document upload")
        if rfp_file:
            log(f"RFP file uploaded: {rfp_file.name}")
            # Process the RFP file and convert it to a path
            rfp_file_path = save_rfp_file(
                rfp_file
            )  # You would need to implement this function
        else:
            log("Warning: RFP option selected but no file uploaded")
    else:
        log("No optimization method selected - will use standard processing")

    for i, uploaded_file in enumerate(uploaded_files):
        # Update progress
        base_progress = i * file_progress_weight
        progress_bar.progress(base_progress)
        status_text.text(
            f"Processing {uploaded_file.name}... ({i+1}/{len(uploaded_files)})"
        )

        # Generate a unique ID for this file processing
        file_id = str(uuid.uuid4())[:8]

        # Save the uploaded file temporarily
        original_file_name = uploaded_file.name
        log(f"Processing PDF: {original_file_name}")
        temp_file_path = convert_to_pdf(uploaded_file, file_id)

        try:
            # Process the PDF - pass the RFP file path if available
            resume_stream(
                st,
                progress_bar,
                base_progress,
                file_progress_weight,
                temp_file_path,
                selected_role,
                custom_role_title,
                job_description,
                rfp_file_path,  # Pass the RFP file path
            )
            log(f"Processed PDF: {original_file_name}")

            # Rename the updated resume, and delete if it already exists
            new_file_name = (
                os.path.splitext(original_file_name)[0] + f"_updated_{file_id}.docx"
            )
            if os.path.exists(new_file_name):
                os.remove(new_file_name)
                log(f"Deleted existing file: {new_file_name}")
            os.rename("updated_resume.docx", new_file_name)
            log(f"Renamed updated resume to: {new_file_name}")

            # Add to processed files list
            st.session_state.processed_files.append(
                {
                    "id": file_id,
                    "original_name": original_file_name,
                    "output_path": new_file_name,
                    "status": "Success",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "role_type": selected_role,  # Add the role type
                    "role_title": (
                        custom_role_title
                        if custom_role_title and custom_role_title.strip()
                        else selected_role
                    ),  # Add the specific role title or default to role type
                    "job_description_type": st.session_state.optimization_method,  # Store the type of job description used
                    "job_description": (
                        "Yes"
                        if (
                            st.session_state.optimization_method
                            == "Enter job description"
                            and job_description
                            and job_description.strip()
                        )
                        else "No"
                    ),
                    "rfp_used": (
                        "Yes"
                        if (
                            st.session_state.optimization_method
                            == "Upload RFP document"
                            and rfp_file_path
                        )
                        else "No"
                    ),
                }
            )

        except Exception as e:
            # Handle any unexpected errors
            log(f"Error processing {original_file_name}: {str(e)}")
            stack_trace = traceback.format_exc()
            log(f"Stack trace:\n{stack_trace}")

            st.session_state.processed_files.append(
                {
                    "id": file_id,
                    "original_name": original_file_name,
                    "output_path": None,
                    "status": f"Error: {str(e)}",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "role": selected_role,  # Add the role even for failed processes
                    "job_description_type": st.session_state.optimization_method,  # Store the type of job description used
                    "job_description": (
                        "Yes"
                        if (
                            st.session_state.optimization_method
                            == "Enter job description"
                            and job_description
                            and job_description.strip()
                        )
                        else "No"
                    ),
                    "rfp_used": (
                        "Yes"
                        if (
                            st.session_state.optimization_method
                            == "Upload RFP document"
                            and rfp_file_path
                        )
                        else "No"
                    ),
                }
            )

        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    # Clean up RFP file if it exists
    if rfp_file_path and os.path.exists(rfp_file_path):
        os.remove(rfp_file_path)
        log(f"Cleaned up temporary RFP file: {rfp_file_path}")

    # Complete the progress bar
    progress_bar.progress(1.0)
    status_text.text("Processing complete!")
    log("All files processed")

# Display table of processed files with improved styling
if st.session_state.processed_files:
    # st.markdown(
    #     "<div style='border: 1px solid #E5E7EB; border-radius: 6px; padding: 1.2rem; margin-top: 2rem;'>",
    #     unsafe_allow_html=True,
    # )

    st.subheader("📋 Processed Files")
    st.markdown(
        "<p style='margin-bottom: 1rem;'>Your processed resume files are ready for download.</p>",
        unsafe_allow_html=True,
    )

    # Create a styled table
    col1, col2, col3, col4, col5, col6 = st.columns([3, 1.5, 1.5, 1, 2, 1.5])

    # Create styled headers
    with col1:
        st.markdown(
            "<p style='font-weight: 600;'>File Name</p>", unsafe_allow_html=True
        )
    with col2:
        st.markdown(
            "<p style='font-weight: 600;'>Role Title</p>", unsafe_allow_html=True
        )
    with col3:
        st.markdown(
            "<p style='font-weight: 600;'>Optimization</p>", unsafe_allow_html=True
        )
    with col4:
        st.markdown("<p style='font-weight: 600;'>Status</p>", unsafe_allow_html=True)
    with col5:
        st.markdown(
            "<p style='font-weight: 600;'>Timestamp</p>", unsafe_allow_html=True
        )
    with col6:
        st.markdown("<p style='font-weight: 600;'>Actions</p>", unsafe_allow_html=True)

    # Add a divider
    st.markdown(
        "<hr style='margin: 0.5rem 0 1rem 0; border-color: #e5e7eb;'>",
        unsafe_allow_html=True,
    )

    # Create the table with the documents and download buttons
    for i, file in enumerate(st.session_state.processed_files):
        with col1:
            st.write(file["original_name"])
        with col2:
            st.write(file.get("role_title", file.get("role", "N/A")))
        with col3:
            optimization_method = file.get("job_description_type", "No optimization")
            st.write(optimization_method)
        with col4:
            if file["status"] == "Success":
                st.markdown(
                    "<span class='status-success'>✓ Success</span>",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    f"<span class='status-error'>❌ Error</span>",
                    unsafe_allow_html=True,
                )
        with col5:
            st.write(file["timestamp"])
        with col6:
            if file["output_path"] and os.path.exists(file["output_path"]):
                with open(file["output_path"], "rb") as f:
                    st.download_button(
                        label="Download",
                        data=f,
                        file_name=os.path.basename(file["output_path"]),
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        key=f"download_{i}",
                    )
            else:
                st.write("N/A")

    # Add action buttons
    st.markdown(
        "<div style='display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;'>",
        unsafe_allow_html=True,
    )

    # Download All button with improved styling
    successful_files = [
        file
        for file in st.session_state.processed_files
        if file["output_path"] and os.path.exists(file["output_path"])
    ]

    if successful_files:
        # Create a zip file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for file in successful_files:
                zip_file.write(
                    file["output_path"], os.path.basename(file["output_path"])
                )

        zip_buffer.seek(0)

        col1, col2 = st.columns([4, 1])
        with col2:
            st.download_button(
                label="📦 Download All Resumes",
                data=zip_buffer,
                file_name="all_updated_resumes.zip",
                mime="application/zip",
                key="download_all",
                use_container_width=True,
            )

            # Add option to clear the list
            if st.button("🗑️ Clear All", use_container_width=True):
                # Delete the actual files
                for file in st.session_state.processed_files:
                    if file["output_path"] and os.path.exists(file["output_path"]):
                        try:
                            os.remove(file["output_path"])
                            log(f"Deleted file: {file['output_path']}")
                        except Exception as e:
                            log(f"Error deleting file {file['output_path']}: {str(e)}")
                # Clear the list
                st.session_state.processed_files = []
                initialize_log_box(log_box)
                st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
else:
    # Display a placeholder message with improved styling
    st.markdown(
        """
        <div style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 2rem; text-align: center; margin-top: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
            <h3 style="margin-bottom: 0.5rem;">No Resumes Processed Yet</h3>
            <p>Upload your resume files and click "Generate Optimized Resume" to get started.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

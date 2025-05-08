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
    page_icon="C:\\Users\\jata.maccabe\\Documents\\GitHub\\cgi_resume_poc\\assets\\genie_logo.png",
    layout="wide",
)

# Inject custom CSS for 75% width
st.markdown(
    """
    <style>
    .block-container {
        max-width: 75%;
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin: 0 auto;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# App title
st.title("ResumeGenie")

# Initialize session state for tracking files if it doesn't exist
if "processed_files" not in st.session_state:
    st.session_state.processed_files = []

with st.form("my-form", clear_on_submit=True):
    # Add role selection radio button
    selected_role = st.radio(
        "Select resume format:",
        options=["Developer", "Business Analyst", "Director"],
        index=0,  # Default to Developer
        horizontal=True,  # Display horizontally for better space usage
    )

    # Add custom role title field
    custom_role_title = st.text_input(
        "Enter specific role title (optional):",
        help="E.g., 'Senior Full Stack Developer', 'Data Scientist', 'Project Manager'",
    )

    # Add job description text area with clear optional messaging
    job_description = st.text_area(
        "Enter job description (OPTIONAL - for better keyword matching and tailoring):",
        height=150,
        help="Paste the job description to tailor the resume with relevant keywords and skills. This is optional but recommended for better results.",
    )

    uploaded_files = st.file_uploader(
        "Upload PDF or DOCX files", type=["pdf", "docx"], accept_multiple_files=True
    )
    submitted = st.form_submit_button("Submit")

# Initialize log_box
log_box = st.empty()
initialize_log_box(log_box)
if submitted and uploaded_files:
    # Create a progress bar
    progress_bar = st.progress(0)
    status_text = st.empty()
    total_files = len(uploaded_files)
    file_progress_weight = 0.95 / total_files

    # Log the selected role, custom role title, and job description
    log(f"Selected role type: {selected_role}")
    if custom_role_title and custom_role_title.strip():
        log(f"Specific role title: {custom_role_title}")
    else:
        log("No specific role title provided - will use role type")
    if job_description and job_description.strip():
        log(f"Job description provided: {len(job_description)} characters")
    else:
        log("No job description provided - will use standard processing")

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
            # Process the PDF - pass the selected role, custom role title, and job description to the resume_stream function
            resume_stream(
                st,
                progress_bar,
                base_progress,
                file_progress_weight,
                temp_file_path,
                selected_role,
                custom_role_title,
                job_description,  # Pass the job description
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
                    "job_description": (
                        "Yes" if (job_description and job_description.strip()) else "No"
                    ),  # Track if job description was used
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
                    "job_description": (
                        "Yes" if job_description else "No"
                    ),  # Track if job description was used
                }
            )

        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    # Complete the progress bar
    progress_bar.progress(1.0)
    status_text.text("Processing complete!")
    log("All files processed")

# Display table of processed files
if st.session_state.processed_files:
    st.subheader("Processed Files")
    col1, col2, col3, col4, col5, col6 = st.columns(
        [3, 1.5, 1, 2, 2, 1]
    )  # Modified column widths for role title

    with col1:
        st.markdown("**File Name**")

    with col2:
        st.markdown("**Role Title**")  # Changed to Role Title

    with col3:
        st.markdown("**Job Desc**")  # New column for job description

    with col4:
        st.markdown("**Status**")

    with col5:
        st.markdown("**Timestamp**")

    with col6:
        st.markdown("**Actions**")

    # Create the table with the documents and download buttons
    for i, file in enumerate(st.session_state.processed_files):
        with col1:
            st.write(file["original_name"])

        with col2:
            st.write(file.get("role_title", file.get("role", "N/A")))

        with col3:
            st.write(
                file.get("job_description", "No")
            )  # Display if job description was used

        with col4:
            st.write(file["status"])

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

    # Download All button
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

        st.download_button(
            label="Download All Resumes",
            data=zip_buffer,
            file_name="all_updated_resumes.zip",
            mime="application/zip",
            key="download_all",
        )

    # Add option to clear the list
    if st.button("Clear Processed Files"):
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
else:
    st.write("No PDFs processed yet.")

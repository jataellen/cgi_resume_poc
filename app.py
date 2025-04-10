import streamlit as st
import os
import pandas as pd
import uuid
from datetime import datetime
import zipfile
import io
from src.logs_manager import log, initialize_log_box
from src.resume_llm_handler import resume_stream

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
    uploaded_files = st.file_uploader(
        "Choose PDF files", type="pdf", accept_multiple_files=True
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

    for i, uploaded_file in enumerate(uploaded_files):
        # Update progress
        base_progress = i * file_progress_weight
        progress_bar.progress(base_progress)
        # progress = (i) / len(uploaded_files)
        # progress_bar.progress(progress)
        status_text.text(
            f"Processing {uploaded_file.name}... ({i+1}/{len(uploaded_files)})"
        )

        # Generate a unique ID for this file processing
        file_id = str(uuid.uuid4())[:8]

        # Save the uploaded file temporarily
        original_file_name = uploaded_file.name
        temp_file_path = f"temp_{file_id}.pdf"
        with open(temp_file_path, "wb") as f:
            f.write(uploaded_file.read())
        log(f"Uploaded file: {original_file_name}")

        try:
            # Process the PDF
            resume_stream(
                st, progress_bar, base_progress, file_progress_weight, temp_file_path
            )
            # resume_stream(st, progress_bar, temp_file_path)
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
                }
            )

        except Exception as e:
            # Handle any unexpected errors
            log(f"Error processing {original_file_name}: {str(e)}")
            st.session_state.processed_files.append(
                {
                    "id": file_id,
                    "original_name": original_file_name,
                    "output_path": None,
                    "status": f"Error: {str(e)}",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
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
    col1, col2, col3, col4 = st.columns([3, 2, 2, 1])

    with col1:
        st.markdown("**File Name**")  # Header for column 1

    with col2:
        st.markdown("**Status**")  # Header for column 2

    with col3:
        st.markdown("**Timestamp**")  # Header for column 3

    with col4:
        st.markdown("**Actions**")  # Header for column 4

    # Create the table with the documents and download buttons
    for i, file in enumerate(st.session_state.processed_files):
        # col1, col2, col3, col4 = st.columns([3, 2, 2, 1])

        with col1:
            st.write(file["original_name"])

        with col2:
            st.write(file["status"])

        with col3:
            st.write(file["timestamp"])

        with col4:
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

        # Add a separator between rows
        st.markdown("---")

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

import streamlit as st
import os
from src.logs_manager import log, initialize_log_box  # Import initialize_log_box
from src.resume_llm_handler import resume_stream

os.environ["AZURE_OPENAI_API_KEY"] = "EOkfcf05uMhPPi5vtu0OmXUMrpdNc4Ji65zbVs1iZZGbbdGvunPhJQQJ99BBACYeBjFXJ3w3AAABACOGejoY"
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://cgi-resume-openai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21"


# Streamlit app frontend
st.title('ResumeGenie')

with st.form("my-form", clear_on_submit=True):
    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")
    submitted = st.form_submit_button("Submit")


# Initialize log_box
log_box = st.empty()
initialize_log_box(log_box)  # Pass the log_box to the logs module

if submitted and uploaded_file is not None:
    # Save the uploaded file temporarily
    original_file_name = uploaded_file.name
    with open("temp.pdf", "wb") as f:
        f.write(uploaded_file.read())
    log(f"Uploaded file: {original_file_name}")

    # Process the PDF (assuming resume_stream creates updated_resume.docx)
    resume_stream(st, "temp.pdf")
    log("Processed the PDF")

    # Rename the updated resume, and delete if it already exists
    new_file_name = os.path.splitext(original_file_name)[0] + "_updated.docx"
    if os.path.exists(new_file_name):
        os.remove(new_file_name)
        log(f"Deleted existing file: {new_file_name}")
    os.rename("updated_resume.docx", new_file_name)
    log(f"Renamed updated resume to: {new_file_name}")

    # Provide a download link for the updated resume
    with open(new_file_name, "rb") as f:
        st.download_button(label="Download Updated Resume", data=f, file_name=new_file_name, mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    log("Provided download link for updated resume")


else:
    st.write("No PDF uploaded yet.")


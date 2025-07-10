import streamlit as st
import os
import pandas as pd
import uuid
from datetime import datetime
import zipfile
import io
import json
from src.logs_manager import log, initialize_log_box
from src.resume_llm_handler import resume_stream, evaluate_resume
from utils.document_utils import *
from backend.logic_app_trigger import trigger_logic_app
import traceback

# Enhanced import handling for PDF evaluation generator
try:
    from src.pdf_evaluation_generator import generate_evaluation_pdf, convert_evaluation_to_pdf, REPORTLAB_AVAILABLE
except ImportError as e:
    print(f"Warning: Could not import PDF functions: {e}")
    # Create dummy functions as fallback
    def generate_evaluation_pdf(evaluation_data, output_path, resume_name="Resume"):
        json_path = output_path.replace('.pdf', '.json')
        with open(json_path, 'w') as f:
            json.dump(evaluation_data, f, indent=2)
        return json_path
    
    def convert_evaluation_to_pdf(json_file_path, resume_name="Resume"):
        return json_file_path
    
    REPORTLAB_AVAILABLE = False

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
    .block-container {
        max-width: 75%;
        padding-top: 2rem;
        padding-bottom: 2rem;
        margin: 0 auto;
    }
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
    .selected-button > button {
        background-color: #FF4B4B;
        color: white;
    }
    .main-submit-button > button {
        background-color: #FF4B4B;
        color: white;
        font-size: 1.1rem;
        height: 3.2rem;
    }
    .main-submit-button > button:hover {
        background-color: #E03131;
    }
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
    .step-card {
        padding-bottom: 1rem;
    }
    .optimization-input {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #FF4B4B;
    }
    .cgi-experience-checkbox {
        margin-top: 0.75rem;
        margin-bottom: 1.25rem;
        padding: 0.75rem;
        background-color: #F8F9FA;
        border-radius: 6px;
        border-left: 4px solid #4B4BFF;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

def save_rfp_file(rfp_file):
    """Save the uploaded RFP file to disk and return the path"""
    if rfp_file is None:
        return None
    
    file_id = str(uuid.uuid4())[:8]
    file_extension = os.path.splitext(rfp_file.name)[1]
    temp_file_path = f"temp_rfp_{file_id}{file_extension}"
    
    with open(temp_file_path, "wb") as f:
        f.write(rfp_file.getbuffer())
    
    log(f"Saved RFP file: {temp_file_path}")
    return temp_file_path

def run_resume_evaluation(file_path, file_id, resume_name="Resume", selected_format=None, custom_role_title=None, job_description=None):
    """Run the enhanced resume evaluation with comprehensive error handling"""
    try:
        log(f"Starting enhanced evaluation for file: {file_path}")
        
        # Verify file exists
        if not os.path.exists(file_path):
            log(f"Error: Resume file not found: {file_path}")
            return None, {"error": f"File not found: {file_path}"}
        
        # Run enhanced evaluation
        evaluation_results = evaluate_resume(
            file_path=file_path,
            job_description=job_description if job_description and job_description.strip() else None,
            target_role=None  # Force general evaluation
        )
        
        # Validate results
        if not evaluation_results or 'error' in evaluation_results:
            log(f"Evaluation failed or returned error: {evaluation_results}")
            evaluation_results = {
                "overall_score": 0,
                "error": "Evaluation failed",
                "recommendations": ["Manual review required"],
                "priority_fixes": ["Unable to auto-evaluate"]
            }
        
        # Always save JSON backup
        eval_json_path = f"evaluation_{file_id}.json"
        try:
            with open(eval_json_path, 'w', encoding='utf-8') as f:
                json.dump(evaluation_results, f, indent=2, ensure_ascii=False)
            log(f"Evaluation JSON saved: {eval_json_path}")
        except Exception as json_error:
            log(f"Failed to save JSON: {str(json_error)}")
        
        # Try to generate PDF/report
        eval_output_path = f"evaluation_{file_id}.pdf"
        try:
            if REPORTLAB_AVAILABLE:
                report_path = generate_evaluation_pdf(evaluation_results, eval_output_path, resume_name)
            else:
                # Fallback to enhanced text report
                report_path = eval_output_path.replace('.pdf', '.txt')
                from src.pdf_evaluation_generator import generate_enhanced_evaluation_text
                report_path = generate_enhanced_evaluation_text(evaluation_results, report_path, resume_name)
            
            if report_path and os.path.exists(report_path):
                log(f"Evaluation report generated: {report_path}")
                return report_path, evaluation_results
            else:
                log("Report generation failed, returning JSON")
                return eval_json_path, evaluation_results
                
        except Exception as pdf_error:
            log(f"Report generation failed: {str(pdf_error)}")
            return eval_json_path, evaluation_results
            
    except Exception as e:
        log(f"Complete evaluation failure: {str(e)}")
        return None, {"error": str(e), "complete_failure": True}

# App title with logo
col1, col2 = st.columns([1, 11])
with col1:
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
    st.image("assets/genie_logo.png", width=80)

with col2:
    st.title("ResumeGenie")
    st.markdown("<p>Transform your resume in seconds</p>", unsafe_allow_html=True)

# Horizontal divider
st.markdown("<hr style='margin: 1rem 0; border-color: #e5e7eb;'>", unsafe_allow_html=True)

# Initialize session state
if "processed_files" not in st.session_state:
    st.session_state.processed_files = []
if "optimization_method" not in st.session_state:
    st.session_state.optimization_method = "No optimization"
if "selected_button" not in st.session_state:
    st.session_state.selected_button = "No optimization"

def set_optimization_method(method):
    st.session_state.optimization_method = method
    st.session_state.selected_button = method

with st.form("my-form", clear_on_submit=True):
    st.subheader("Step 1: Choose Your Resume Format")
    selected_format = st.radio(
        "Select resume format:",
        options=["Developer", "Business Analyst", "Director"],
        index=0,
        horizontal=True,
    )
    
    custom_role_title = st.text_input(
        "Enter specific role title (optional):",
        help="E.g., 'Senior Full Stack Developer', 'Data Scientist', 'Project Manager'",
        placeholder="e.g. Senior Full Stack Developer",
    )
    
    include_default_cgi = st.checkbox(
        "Include AI-generated CGI experience entry",
        help="Adds a current CGI role with AI-generated responsibilities based on the selected format",
        value=False,
    )
    st.write("*Adds a customized CGI consulting role with relevant experience to your resume.*")
    
    st.markdown("<div class='step-card'>", unsafe_allow_html=True)
    st.subheader("Step 2: Choose Optimization Method")
    st.markdown("How would you like to optimize the resume?")
    
    col1, col2, col3 = st.columns(3)
    
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
        if upload_rfp:
            set_optimization_method("Upload RFP document")
    
    # Show appropriate input based on selection
    job_description = ""
    rfp_file = None
    rfp_file_path = None
    
    if st.session_state.optimization_method == "Enter job description":
        job_description = st.text_area(
            "Enter job description:",
            height=150,
            help="Paste the job description to tailor the resume with relevant keywords and skills.",
            placeholder="Paste job description here...",
        )
    elif st.session_state.optimization_method == "Upload RFP document":
        rfp_file = st.file_uploader(
            "Upload RFP document:",
            type=["pdf", "docx"],
            help="Upload an RFP document to automatically generate a job description.",
        )
    
    st.markdown("<div class='step-card'>", unsafe_allow_html=True)
    st.subheader("Step 3: Upload Your Resume")
    uploaded_files = st.file_uploader(
        "Upload resume files",
        type=["pdf", "docx"],
        accept_multiple_files=True,
        help="Select one or more resume files to process",
    )
    st.markdown("</div>", unsafe_allow_html=True)
    
    st.markdown("<div class='main-submit-button'>", unsafe_allow_html=True)
    submitted = st.form_submit_button("✨ Generate Optimized Resume")
    st.markdown("</div>", unsafe_allow_html=True)

# Initialize log_box
log_box = st.empty()
initialize_log_box(log_box)

if submitted and uploaded_files:
    progress_bar = st.progress(0)
    status_text = st.empty()
    total_files = len(uploaded_files)
    file_progress_weight = 0.95 / total_files
    
    # Log configuration
    log(f"Selected resume format: {selected_format}")
    if custom_role_title and custom_role_title.strip():
        log(f"Specific role title: {custom_role_title}")
    else:
        log("No specific role title provided - will use role type")
    
    if include_default_cgi:
        log("AI-generated CGI experience will be included")
    else:
        log("No AI-generated CGI experience requested")
    
    # Handle RFP file if uploaded
    if st.session_state.optimization_method == "Upload RFP document" and rfp_file:
        log(f"RFP file uploaded: {rfp_file.name}")
        rfp_file_path = save_rfp_file(rfp_file)
    elif st.session_state.optimization_method == "Enter job description":
        if job_description and job_description.strip():
            log(f"Job description provided: {len(job_description)} characters")
        else:
            log("Warning: Job description option selected but no text provided")
    
    # Process each uploaded file
    for i, uploaded_file in enumerate(uploaded_files):
        base_progress = i * file_progress_weight
        progress_bar.progress(base_progress)
        status_text.text(f"Processing {uploaded_file.name}... ({i+1}/{len(uploaded_files)})")
        
        file_id = str(uuid.uuid4())[:8]
        original_file_name = uploaded_file.name
        log(f"Processing file: {original_file_name}")
        
        try:
            # Convert file to PDF
            temp_file_path = convert_to_pdf(uploaded_file, file_id)
            log(f"Successfully converted {original_file_name} to PDF format")
            
            try:
                # Process the resume
                resume_stream(
                    st,
                    progress_bar,
                    base_progress,
                    file_progress_weight,
                    temp_file_path,
                    selected_format,
                    custom_role_title,
                    job_description,
                    rfp_file_path,
                    include_default_cgi,
                )
                log(f"Processed PDF: {original_file_name}")
                
                # Rename the output file
                new_file_name = os.path.splitext(original_file_name)[0] + "_updated.docx"
                if os.path.exists(new_file_name):
                    os.remove(new_file_name)
                    log(f"Deleted existing file: {new_file_name}")
                
                os.rename("updated_resume.docx", new_file_name)
                log(f"Renamed updated resume to: {new_file_name}")
                
                # Run evaluation
                eval_progress = base_progress + (file_progress_weight * 0.8)
                progress_bar.progress(eval_progress)
                status_text.text(f"Evaluating {original_file_name}...")
                
                try:
                    eval_file_path, eval_results = run_resume_evaluation(
                        new_file_name, 
                        file_id, 
                        original_file_name,
                        selected_format,
                        custom_role_title,
                        job_description if job_description and job_description.strip() else None
                    )
                    
                    # Verify the file actually exists
                    if eval_file_path and not os.path.exists(eval_file_path):
                        log(f"Warning: Evaluation file path returned but file doesn't exist: {eval_file_path}")
                        eval_file_path = None
                        
                except Exception as eval_error:
                    log(f"Evaluation failed: {str(eval_error)}")
                    eval_file_path = None
                    eval_results = None

                final_progress = base_progress + file_progress_weight
                progress_bar.progress(final_progress)
                
                # Create file record - SINGLE CREATION POINT
                file_record = {
                    "id": file_id,
                    "original_name": original_file_name,
                    "output_path": new_file_name,
                    "eval_path": eval_file_path if eval_file_path and os.path.exists(eval_file_path) else None,
                    "status": "Success",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "role_type": selected_format,
                    "role_title": (
                        custom_role_title
                        if custom_role_title and custom_role_title.strip()
                        else selected_format
                    ),
                    "job_description_type": st.session_state.optimization_method,
                    "job_description": (
                        "Yes"
                        if (
                            st.session_state.optimization_method == "Enter job description"
                            and job_description and job_description.strip()
                        )
                        else "No"
                    ),
                    "rfp_used": (
                        "Yes"
                        if (
                            st.session_state.optimization_method == "Upload RFP document"
                            and rfp_file_path
                        )
                        else "No"
                    ),
                    "cgi_experience_added": "Yes" if include_default_cgi else "No",
                }
                
                # Add evaluation-specific fields
                if eval_results:
                    file_record["overall_score"] = eval_results.get("overall_score", "N/A")
                    file_record["evaluation_available"] = True
                    file_record["evaluation_error"] = None
                else:
                    file_record["evaluation_available"] = False
                    file_record["evaluation_error"] = "Evaluation failed"
                
                st.session_state.processed_files.append(file_record)
                
            except Exception as resume_error:
                error_message = f"Error processing {original_file_name}: {str(resume_error)}"
                log(error_message)
                stack_trace = traceback.format_exc()
                log(f"Stack trace:\n{stack_trace}")
                
                st.session_state.processed_files.append({
                    "id": file_id,
                    "original_name": original_file_name,
                    "output_path": None,
                    "eval_path": None,
                    "status": f"Error: {str(resume_error)}",
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "role_type": selected_format,
                    "job_description_type": st.session_state.optimization_method,
                    "job_description": (
                        "Yes"
                        if (
                            st.session_state.optimization_method == "Enter job description"
                            and job_description and job_description.strip()
                        )
                        else "No"
                    ),
                    "rfp_used": (
                        "Yes"
                        if (
                            st.session_state.optimization_method == "Upload RFP document"
                            and rfp_file_path
                        )
                        else "No"
                    ),
                    "cgi_experience_added": "Yes" if include_default_cgi else "No",
                    "evaluation_available": False,
                })
            
            # Clean up temporary PDF file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                log(f"Cleaned up temporary PDF file: {temp_file_path}")
                
        except Exception as conversion_error:
            error_message = f"Error converting {original_file_name} to PDF: {str(conversion_error)}"
            log(error_message)
            stack_trace = traceback.format_exc()
            log(f"Stack trace:\n{stack_trace}")
            
            st.session_state.processed_files.append({
                "id": file_id,
                "original_name": original_file_name,
                "output_path": None,
                "eval_path": None,
                "status": f"Conversion Error: {str(conversion_error)}",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "role_type": selected_format,
                "job_description_type": st.session_state.optimization_method,
                "job_description": (
                    "Yes"
                    if (
                        st.session_state.optimization_method == "Enter job description"
                        and job_description and job_description.strip()
                    )
                    else "No"
                ),
                "rfp_used": (
                    "Yes"
                    if (
                        st.session_state.optimization_method == "Upload RFP document"
                        and rfp_file_path
                    )
                    else "No"
                ),
                "cgi_experience_added": "Yes" if include_default_cgi else "No",
                "evaluation_available": False,
            })
    
    # Clean up RFP file if it exists
    if rfp_file_path and os.path.exists(rfp_file_path):
        os.remove(rfp_file_path)
        log(f"Cleaned up temporary RFP file: {rfp_file_path}")
    
    progress_bar.progress(1.0)
    status_text.text("Processing complete!")
    log("All files processed")

# Display table of processed files
if st.session_state.processed_files:
    st.subheader("📋 Processed Files")
    st.markdown(
        "<p style='margin-bottom: 1rem;'>Your processed resume files are ready for download.</p>",
        unsafe_allow_html=True,
    )
    
    col1, col2, col3, col4, col5, col6, col7 = st.columns([3, 1.5, 1.5, 1, 2, 1.2, 1.2])
    
    with col1:
        st.markdown("<p style='font-weight: 600;'>File Name</p>", unsafe_allow_html=True)
    with col2:
        st.markdown("<p style='font-weight: 600;'>Role Title</p>", unsafe_allow_html=True)
    with col3:
        st.markdown("<p style='font-weight: 600;'>Optimization</p>", unsafe_allow_html=True)
    with col4:
        st.markdown("<p style='font-weight: 600;'>Status</p>", unsafe_allow_html=True)
    with col5:
        st.markdown("<p style='font-weight: 600;'>Timestamp</p>", unsafe_allow_html=True)
    with col6:
        st.markdown("<p style='font-weight: 600;'>Actions</p>", unsafe_allow_html=True)
    with col7:
        st.markdown("<p style='font-weight: 600;'>Evaluation</p>", unsafe_allow_html=True)
    
    st.markdown(
        "<hr style='margin: 0.5rem 0 1rem 0; border-color: #e5e7eb;'>",
        unsafe_allow_html=True,
    )
    
    for i, file in enumerate(st.session_state.processed_files):
        with col1:
            st.write(file["original_name"])
        with col2:
            st.write(file.get("role_title", file.get("role_type", "N/A")))
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
                    "<span class='status-error'>❌ Error</span>",
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
        with col7:
            eval_path = file.get("eval_path")
            if eval_path and os.path.exists(eval_path):
                try:
                    with open(eval_path, "rb") as eval_file:
                        file_content = eval_file.read()
                        
                        # Determine MIME type and button label based on file extension
                        if eval_path.endswith('.pdf'):
                            mime_type = "application/pdf"
                            button_label = "📊 PDF"
                        elif eval_path.endswith('.txt'):
                            mime_type = "text/plain"
                            button_label = "📊 TXT"
                        else:
                            mime_type = "application/json"
                            button_label = "📊 JSON"
                            
                        st.download_button(
                            label=button_label,
                            data=file_content,
                            file_name=os.path.basename(eval_path),
                            mime=mime_type,
                            key=f"eval_{i}",
                        )
                except Exception as e:
                    st.write(f"Error: {str(e)[:20]}...")
            else:
                st.write("N/A")
    
    st.markdown(
        "<div style='display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;'>",
        unsafe_allow_html=True,
    )
    
    successful_files = [
        file for file in st.session_state.processed_files
        if file["output_path"] and os.path.exists(file["output_path"])
    ]
    
    if successful_files:
        # Create a zip file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for file in successful_files:
                # Add resume file
                if file["output_path"] and os.path.exists(file["output_path"]):
                    zip_file.write(
                        file["output_path"], 
                        f"resumes/{os.path.basename(file['output_path'])}"
                    )
                
                # Add evaluation file if it exists
                eval_path = file.get("eval_path")
                if eval_path and os.path.exists(eval_path):
                    zip_file.write(
                        eval_path, 
                        f"evaluations/{os.path.basename(eval_path)}"
                    )
        
        zip_buffer.seek(0)
        
        col1, col2 = st.columns([4, 1])
        with col2:
            st.download_button(
                label="📦 Download All",
                data=zip_buffer,
                file_name="resumes_and_evaluations.zip",
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
                    
                    # Also clean up evaluation files
                    if file.get("eval_path") and os.path.exists(file["eval_path"]):
                        try:
                            os.remove(file["eval_path"])
                            log(f"Deleted evaluation file: {file['eval_path']}")
                        except Exception as e:
                            log(f"Error deleting evaluation file {file['eval_path']}: {str(e)}")
                
                # Clear the list
                st.session_state.processed_files = []
                initialize_log_box(log_box)
                st.rerun()
    
    st.markdown("</div>", unsafe_allow_html=True)
else:
    # Display a placeholder message
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
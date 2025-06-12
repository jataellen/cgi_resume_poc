import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
import uuid
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
import traceback
import tempfile
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import jwt
from functools import wraps

# Load environment variables
load_dotenv()

# Add current directory to Python path
sys.path.append('.')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set working directory to the script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Script directory: {script_dir}")
print(f"Current working directory before change: {os.getcwd()}")

# Change to script directory
os.chdir(script_dir)
print(f"Current working directory after change: {os.getcwd()}")

# Check if data directory exists from this location
data_path = os.path.join(script_dir, "data")
if not os.path.exists(data_path):
    # Try parent directory
    parent_dir = os.path.dirname(script_dir)
    data_path = os.path.join(parent_dir, "data")
    if os.path.exists(data_path):
        os.chdir(parent_dir)
        print(f"Found data directory in parent, changed to: {os.getcwd()}")
    else:
        print(f"Data directory not found in {script_dir} or {parent_dir}")
        print("Available directories:")
        try:
            for item in os.listdir(script_dir):
                if os.path.isdir(item):
                    print(f"  - {item}")
        except:
            pass

# Verify required files exist
required_files = [
    'data/experience_schema.json',
    'data/json_schema.json', 
    'data/all_schemas.json',
    'data/prompts.py'
]

missing_files = []
for file_path in required_files:
    if not os.path.exists(file_path):
        missing_files.append(file_path)

if missing_files:
    print("❌ Missing required files:")
    for file_path in missing_files:
        print(f"   - {file_path}")
    print("\nPlease make sure you're running the app from the correct directory")
    print("and that all data files are present.")
    sys.exit(1)

# Import your existing modules after path setup
from src.logs_manager import log, initialize_log_box, log_messages
from src.resume_llm_handler import resume_stream

# Initialize FastAPI app
app = FastAPI(title="ResumeGenie API", version="1.0.0")

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
PORT = int(os.getenv("PORT", "8000"))

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_KEY else None

# Configure CORS for React frontend
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "https://cgi-resumegenie-staging.netlify.app",
    "https://cgi-resumegenie.netlify.app"  # Production URL
]

# Filter out None/empty values
allowed_origins = [origin for origin in allowed_origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for CPU-bound tasks
executor = ThreadPoolExecutor(max_workers=4)

# Store upload sessions
upload_sessions = {}

# Auth dependency

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Verify JWT token from Supabase with graceful fallback"""
    
    # Extract token from authorization header
    token = None
    if authorization:
        token = authorization.split(" ")[1] if " " in authorization else authorization
    
    if token == "mock-token":
        return {"id": "dev-user", "email": "dev@example.com", "mode": "mock"}
    
    # Try Supabase authentication first
    if SUPABASE_URL and SUPABASE_SERVICE_KEY and supabase and token:
        try:
            user = supabase.auth.get_user(token)
            if user and user.user:
                return {**user.user, "mode": "supabase"}
        except Exception as e:
            print(f"Supabase auth failed: {e}")
            # Continue to fallback below
    
    # If no authorization header
    if not authorization:
        # If Supabase is configured but no auth header, require authentication
        if SUPABASE_URL and SUPABASE_SERVICE_KEY and supabase:
            raise HTTPException(status_code=401, detail="Authorization header missing")
        else:
            # Supabase not configured, allow development access
            return {"id": "dev-user", "email": "dev@example.com", "mode": "development"}
    
    # If we get here, authentication failed
    if SUPABASE_URL and SUPABASE_SERVICE_KEY and supabase:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    else:
        # Fallback for development
        return {"id": "dev-user", "email": "dev@example.com", "mode": "fallback"}

# Pydantic models for request/response
class UploadResponse(BaseModel):
    session_id: str
    message: str
    filename: str

class ProcessStatus(BaseModel):
    status: str  # "processing", "completed", "error"
    logs: List[str]
    progress: int  # 0-100
    download_url: Optional[str] = None
    error: Optional[str] = None

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Mock classes for Streamlit compatibility
class MockProgressBar:
    def __init__(self, session_id):
        self.session_id = session_id
        self.current_progress = 0
    
    def progress(self, value):
        # Convert 0-1 range to 0-100
        if value <= 1:
            self.current_progress = int(value * 100)
        else:
            self.current_progress = int(value)
        
        if self.session_id in upload_sessions:
            upload_sessions[self.session_id]["progress"] = min(self.current_progress, 100)

class MockStreamlit:
    def __init__(self):
        pass
    
    def write(self, *args, **kwargs):
        pass
    
    def empty(self):
        return self
    
    def text_area(self, *args, **kwargs):
        pass

class MockLogBox:
    def text_area(self, *args, **kwargs):
        pass

def save_rfp_file(rfp_file, file_id):
    """Save the uploaded RFP file to disk and return the path"""
    if rfp_file is None:
        return None
    
    # Generate a unique filename
    file_extension = os.path.splitext(rfp_file.filename)[1]
    temp_file_path = f"temp_rfp_{file_id}{file_extension}"
    
    # Save the file
    with open(temp_file_path, "wb") as f:
        shutil.copyfileobj(rfp_file.file, f)
    
    log_messages.append(f"Saved RFP file: {temp_file_path}")
    return temp_file_path

# Import the proper convert_to_pdf function from utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.document_utils import convert_to_pdf as convert_to_pdf_utils

def convert_to_pdf(uploaded_file, file_id):
    """
    Convert uploaded file to PDF using the utils function
    Handles PDF, DOCX, and DOC files
    """
    # Create a file-like object that matches what the utils function expects
    class FileWrapper:
        def __init__(self, file_obj, filename):
            self.file_obj = file_obj
            self.name = filename
            self.type = self._get_mime_type(filename)
            
        def _get_mime_type(self, filename):
            ext = os.path.splitext(filename)[1].lower()
            if ext == '.docx':
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            elif ext == '.doc':
                return "application/msword"
            elif ext == '.pdf':
                return "application/pdf"
            return "application/octet-stream"
            
        def getbuffer(self):
            # Read file content and return as bytes
            if hasattr(self.file_obj, 'path'):
                with open(self.file_obj.path, 'rb') as f:
                    return f.read()
            elif hasattr(self.file_obj, 'read'):
                content = self.file_obj.read()
                if hasattr(self.file_obj, 'seek'):
                    self.file_obj.seek(0)  # Reset file pointer
                return content
            else:
                # It's a file path
                with open(self.file_obj, 'rb') as f:
                    return f.read()
                    
        def read(self):
            return self.getbuffer()
    
    # Get filename
    if hasattr(uploaded_file, 'name'):
        filename = uploaded_file.name
    elif hasattr(uploaded_file, 'filename'):
        filename = uploaded_file.filename
    else:
        filename = os.path.basename(str(uploaded_file))
    
    # Create wrapper and call the utils function
    file_wrapper = FileWrapper(uploaded_file, filename)
    
    try:
        # Call the actual convert_to_pdf from utils
        pdf_path = convert_to_pdf_utils(file_wrapper, file_id)
        return pdf_path
    except Exception as e:
        log_messages.append(f"Error converting file: {str(e)}")
        # Fallback to simple save for now
        temp_file_path = f"temp_{file_id}{os.path.splitext(filename)[1]}"
        with open(temp_file_path, 'wb') as f:
            f.write(file_wrapper.getbuffer())
        return temp_file_path

@app.get("/")
async def root():
    return {"message": "ResumeGenie API is running", "working_directory": os.getcwd()}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    """
    Upload a resume file (PDF or DOCX) for processing
    """
    # Validate file type
    if not file.filename.endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and DOC files are allowed")
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    
    # Save uploaded file
    upload_path = f"uploads/{session_id}_{file.filename}"
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Initialize session
    upload_sessions[session_id] = {
        "status": "uploaded",
        "filename": file.filename,
        "upload_path": upload_path,
        "output_path": None,
        "logs": [f"File received: {file.filename}"],
        "progress": 10,
        "created_at": datetime.now(),
        "error": None,
        "user_id": current_user.id if hasattr(current_user, 'id') else current_user.get("id", "unknown") if isinstance(current_user, dict) else "unknown"
    }
    
    # Start processing in background
    asyncio.create_task(process_resume_async(session_id))
    
    return UploadResponse(
        session_id=session_id,
        message="File uploaded successfully. Processing will begin shortly.",
        filename=file.filename
    )

@app.post("/api/upload-complex", response_model=UploadResponse)
async def upload_resume_complex(
    file: UploadFile = File(...),
    format: str = Form("Developer"),
    customRoleTitle: Optional[str] = Form(None),
    includeDefaultCgi: bool = Form(False),
    optimizationMethod: str = Form("none"),
    jobDescription: Optional[str] = Form(None),
    rfpFile: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user)
):
    """
    Upload a resume file with complex processing options
    """
    # Validate file type
    if not file.filename.endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and DOC files are allowed")
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    
    # Save uploaded file
    upload_path = f"uploads/{session_id}_{file.filename}"
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Save RFP file if provided
    rfp_path = None
    if rfpFile and optimizationMethod == "rfp":
        try:
            # Rewind the file to the beginning
            rfpFile.file.seek(0)
            rfp_path = save_rfp_file(rfpFile, session_id)
            if rfp_path:
                session_logs = [f"RFP file uploaded: {rfpFile.filename}"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save RFP file: {str(e)}")
    
    # Initialize session with complex parameters
    upload_sessions[session_id] = {
        "status": "uploaded",
        "filename": file.filename,
        "upload_path": upload_path,
        "output_path": None,
        "logs": [f"File received: {file.filename}"],
        "progress": 10,
        "created_at": datetime.now(),
        "error": None,
        "user_id": current_user.id if hasattr(current_user, 'id') else current_user.get("id", "unknown") if isinstance(current_user, dict) else "unknown",
        # Complex mode parameters
        "selected_format": format,
        "custom_role_title": customRoleTitle if customRoleTitle else "",
        "include_default_cgi": includeDefaultCgi,
        "optimization_method": optimizationMethod,
        "job_description": jobDescription if optimizationMethod == "description" else "",
        "rfp_file_path": rfp_path
    }
    
    # Start processing in background
    asyncio.create_task(process_resume_async_complex(session_id))
    
    return UploadResponse(
        session_id=session_id,
        message="File uploaded successfully. Processing will begin shortly.",
        filename=file.filename
    )

async def process_resume_async(session_id: str):
    """
    Process resume asynchronously
    """
    session = upload_sessions[session_id]
    
    try:
        # Update status
        session["status"] = "processing"
        session["logs"].append("Initializing document processing...")
        session["progress"] = 20
        
        # Clear previous log messages
        log_messages.clear()
        
        # Initialize mock log box
        mock_log_box = MockLogBox()
        initialize_log_box(mock_log_box)
        
        # Get file info
        upload_path = session["upload_path"]
        original_filename = session["filename"]
        
        # Create mock objects for resume_stream
        mock_st = MockStreamlit()
        mock_progress_bar = MockProgressBar(session_id)
        
        # Hardcoded parameters for testing
        selected_format = "Developer"
        custom_role_title = ""
        job_description = ""
        rfp_file_path = None
        include_default_cgi = False
        
        # Convert file to appropriate format
        file_id = session_id[:8]
        
        class TempFile:
            def __init__(self, path, filename):
                self.name = filename
                self.path = path
        
        temp_file = TempFile(upload_path, original_filename)
        
        session["logs"].append("Converting document to processing format...")
        session["progress"] = 30
        
        try:
            temp_file_path = convert_to_pdf(temp_file, file_id)
            session["logs"].append("File prepared successfully")
            session["progress"] = 40
        except Exception as e:
            session["logs"].append(f"Using original file format: {str(e)}")
            temp_file_path = upload_path
            session["progress"] = 40
        
        # Set up progress parameters
        base_progress = 0.4  # 40% done
        file_progress_weight = 0.6  # 60% remaining
        
        session["logs"].append("Processing resume with AI...")
        session["progress"] = 50
        
        # Run the resume processing in thread pool
        loop = asyncio.get_event_loop()
        
        await loop.run_in_executor(
            executor,
            resume_stream,
            mock_st,
            mock_progress_bar,
            base_progress,
            file_progress_weight,
            temp_file_path,
            selected_format,
            custom_role_title,
            job_description,
            rfp_file_path,
            include_default_cgi
        )
        
        # Copy logs from global log_messages to session
        for log_msg in log_messages:
            if log_msg not in session["logs"]:
                session["logs"].append(log_msg)
        
        # Handle output file
        output_filename = os.path.splitext(original_filename)[0] + "_updated.docx"
        temp_output = "updated_resume.docx"
        
        if os.path.exists(temp_output):
            final_output_path = f"outputs/{session_id}_{output_filename}"
            shutil.move(temp_output, final_output_path)
            session["output_path"] = final_output_path
            session["logs"].append("Resume processing completed successfully!")
            session["progress"] = 100
            session["status"] = "completed"
            
            # Clean up temporary files
            if temp_file_path != upload_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                session["logs"].append("Cleaned up temporary files")
        else:
            raise Exception("Output file was not generated")
            
    except Exception as e:
        session["status"] = "error"
        error_msg = f"Processing error: {str(e)}"
        session["logs"].append(error_msg)
        session["error"] = str(e)
        session["progress"] = 0
        
        # Log full traceback for debugging
        traceback_str = traceback.format_exc()
        print(f"Error processing session {session_id}:")
        print(traceback_str)
        session["logs"].append(f"Error details: {str(e)}")

@app.get("/api/status/{session_id}", response_model=ProcessStatus)
async def get_process_status(session_id: str, current_user=Depends(get_current_user)):
    """
    Get the current status of resume processing
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
    # Verify user owns this session
    user_id = current_user.id if hasattr(current_user, 'id') else current_user.get("id") if isinstance(current_user, dict) else None
    if session.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prepare download URL if completed
    download_url = None
    if session["status"] == "completed" and session["output_path"]:
        download_url = f"/api/download/{session_id}"
    
    return ProcessStatus(
        status=session["status"],
        logs=session["logs"],
        progress=session["progress"],
        download_url=download_url,
        error=session.get("error")
    )

@app.get("/api/download/{session_id}")
async def download_resume(session_id: str, current_user=Depends(get_current_user)):
    """
    Download the processed resume
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
    # Verify user owns this session
    user_id = current_user.id if hasattr(current_user, 'id') else current_user.get("id") if isinstance(current_user, dict) else None
    if session.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if session["status"] != "completed" or not session["output_path"]:
        raise HTTPException(status_code=400, detail="Resume processing not completed")
    
    output_path = session["output_path"]
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    # Extract original filename for download
    original_filename = session["filename"]
    download_filename = os.path.splitext(original_filename)[0] + "_updated.docx"
    
    return FileResponse(
        path=output_path,
        filename=download_filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@app.delete("/api/session/{session_id}")
async def cleanup_session(session_id: str, current_user=Depends(get_current_user)):
    """
    Clean up session data and files
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
    # Verify user owns this session
    user_id = current_user.id if hasattr(current_user, 'id') else current_user.get("id") if isinstance(current_user, dict) else None
    if session.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Clean up files
    if session.get("upload_path") and os.path.exists(session["upload_path"]):
        os.remove(session["upload_path"])
    
    if session.get("output_path") and os.path.exists(session["output_path"]):
        os.remove(session["output_path"])
    
    # Remove session
    del upload_sessions[session_id]
    
    return {"message": "Session cleaned up successfully"}

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_sessions": len(upload_sessions),
        "working_directory": os.getcwd(),
        "data_files_exist": {
            "experience_schema": os.path.exists("data/experience_schema.json"),
            "json_schema": os.path.exists("data/json_schema.json"),
            "all_schemas": os.path.exists("data/all_schemas.json"),
            "prompts": os.path.exists("data/prompts.py")
        }
    }

async def process_resume_async_complex(session_id: str):
    """
    Process resume asynchronously with complex parameters
    """
    session = upload_sessions[session_id]
    
    try:
        # Update status
        session["status"] = "processing"
        session["logs"].append("Initializing advanced document processing...")
        session["logs"].append(f"Target format: {session['selected_format']} profile")
        if session['optimization_method'] == 'description':
            session["logs"].append("Applying job description optimization...")
        elif session['optimization_method'] == 'rfp':
            session["logs"].append("Analyzing RFP requirements...")
        session["progress"] = 20
        
        # Clear previous log messages
        log_messages.clear()
        
        # Initialize mock log box
        mock_log_box = MockLogBox()
        initialize_log_box(mock_log_box)
        
        # Get file info
        upload_path = session["upload_path"]
        original_filename = session["filename"]
        
        # Create mock objects for resume_stream
        mock_st = MockStreamlit()
        mock_progress_bar = MockProgressBar(session_id)
        
        # Extract parameters from session
        selected_format = session["selected_format"]
        custom_role_title = session["custom_role_title"]
        job_description = session["job_description"]
        rfp_file_path = session["rfp_file_path"]
        include_default_cgi = session["include_default_cgi"]
        
        # Convert file to appropriate format
        file_id = session_id[:8]
        
        class TempFile:
            def __init__(self, path, filename):
                self.name = filename
                self.path = path
        
        temp_file = TempFile(upload_path, original_filename)
        
        session["logs"].append("Converting document to processing format...")
        session["progress"] = 30
        
        try:
            temp_file_path = convert_to_pdf(temp_file, file_id)
            session["logs"].append("File prepared successfully")
            session["progress"] = 40
        except Exception as e:
            session["logs"].append(f"Using original file format: {str(e)}")
            temp_file_path = upload_path
            session["progress"] = 40
        
        # Set up progress parameters
        base_progress = 0.4  # 40% done
        file_progress_weight = 0.6  # 60% remaining
        
        session["logs"].append("Processing resume with AI...")
        session["progress"] = 50
        
        # Run the resume processing in thread pool
        loop = asyncio.get_event_loop()
        
        await loop.run_in_executor(
            executor,
            resume_stream,
            mock_st,
            mock_progress_bar,
            base_progress,
            file_progress_weight,
            temp_file_path,
            selected_format,
            custom_role_title,
            job_description,
            rfp_file_path,
            include_default_cgi
        )
        
        # Copy logs from global log_messages to session
        for log_msg in log_messages:
            if log_msg not in session["logs"]:
                session["logs"].append(log_msg)
        
        # Handle output file
        output_filename = os.path.splitext(original_filename)[0] + "_updated.docx"
        output_path = f"outputs/{session_id}_{output_filename}"
        
        # Check if output file exists - start with the most common output name
        possible_outputs = [
            "updated_resume.docx",  # This is what the log shows
            f"{file_id}_output.docx",
            f"temp_{file_id}_output.docx",
            "output.docx",
            f"{os.path.splitext(original_filename)[0]}_updated.docx"
        ]
        
        found = False
        for possible_output in possible_outputs:
            if os.path.exists(possible_output):
                shutil.move(possible_output, output_path)
                session["output_path"] = output_path
                session["logs"].append(f"Resume processed successfully: {output_filename}")
                session["status"] = "completed"
                session["progress"] = 100
                found = True
                break
        
        if not found:
            raise Exception("Output file not found after processing")
        
        # Cleanup temp files
        if os.path.exists(temp_file_path) and temp_file_path != upload_path:
            os.remove(temp_file_path)
            
    except Exception as e:
        session["status"] = "error"
        session["error"] = str(e)
        session["logs"].append(f"Error: {str(e)}")
        session["logs"].append(f"Traceback: {traceback.format_exc()}")
        print(f"Error processing resume: {str(e)}")
        print(traceback.format_exc())

# Cleanup old sessions periodically
async def cleanup_old_sessions():
    """
    Clean up sessions older than 1 hour
    """
    while True:
        current_time = datetime.now()
        sessions_to_remove = []
        
        for session_id, session in upload_sessions.items():
            if (current_time - session["created_at"]).seconds > 3600:  # 1 hour
                sessions_to_remove.append(session_id)
        
        for session_id in sessions_to_remove:
            try:
                if session_id in upload_sessions:
                    session = upload_sessions[session_id]
                    # Clean up files
                    if session.get("upload_path") and os.path.exists(session["upload_path"]):
                        os.remove(session["upload_path"])
                    if session.get("output_path") and os.path.exists(session["output_path"]):
                        os.remove(session["output_path"])
                    # Remove session
                    del upload_sessions[session_id]
            except Exception as e:
                print(f"Error cleaning up session {session_id}: {e}")
        
        await asyncio.sleep(300)  # Run every 5 minutes

# Start cleanup task when app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_old_sessions())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)
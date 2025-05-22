import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

import shutil
import uuid
from datetime import datetime
import tempfile
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Import your existing modules
from src.logs_manager import log_messages, log
from src.resume_llm_handler import resume_stream
import streamlit as st  # We'll mock this since we don't need it anymore

# Initialize FastAPI app
app = FastAPI(title="ResumeGenie API", version="1.0.0")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for CPU-bound tasks
executor = ThreadPoolExecutor(max_workers=4)

# Store upload sessions
upload_sessions = {}

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

class ErrorResponse(BaseModel):
    detail: str

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

@app.get("/")
async def root():
    return {"message": "ResumeGenie API is running"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume file (PDF or DOCX) for processing
    """
    # Validate file type
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
    
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
        "logs": [f"Uploaded file: {file.filename}"],
        "progress": 10,
        "created_at": datetime.now()
    }
    
    # Start processing in background
    asyncio.create_task(process_resume_async(session_id))
    
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
        session["logs"].append("Starting resume processing...")
        session["progress"] = 20
        
        # Clear previous log messages
        log_messages.clear()
        
        # Process the resume using existing logic
        upload_path = session["upload_path"]
        original_filename = session["filename"]
        
        # Mock streamlit object (not needed anymore)
        class MockSt:
            def write(self, *args, **kwargs):
                pass
        
        mock_st = MockSt()
        
        # Run CPU-bound task in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(executor, resume_stream, mock_st, upload_path)
        
        # Update progress as logs are generated
        for i, log_msg in enumerate(log_messages):
            session["logs"].append(log_msg)
            session["progress"] = min(20 + (i + 1) * 10, 90)
        
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
        else:
            raise Exception("Output file not generated")
            
    except Exception as e:
        session["status"] = "error"
        session["logs"].append(f"Error: {str(e)}")
        session["error"] = str(e)
        session["progress"] = 0

@app.get("/api/status/{session_id}", response_model=ProcessStatus)
async def get_process_status(session_id: str):
    """
    Get the current status of resume processing
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
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
async def download_resume(session_id: str):
    """
    Download the processed resume
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
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
async def cleanup_session(session_id: str):
    """
    Clean up session data and files
    """
    if session_id not in upload_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = upload_sessions[session_id]
    
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
        "active_sessions": len(upload_sessions)
    }

# Cleanup old sessions periodically (optional)
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
                await cleanup_session(session_id)
            except:
                pass
        
        await asyncio.sleep(300)  # Run every 5 minutes

# Start cleanup task when app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_old_sessions())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
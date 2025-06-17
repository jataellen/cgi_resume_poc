# ResumeGenie Backend

FastAPI backend for the ResumeGenie application with full AI resume processing.

## Setup

1. Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python main.py
   ```

## Railway Deployment

Configure Railway with:
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python main.py`

## Environment Variables

Set these in Railway:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `FRONTEND_URL`: Your frontend domain (e.g., https://yourapp.netlify.app)
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_EMBEDDINGS_ENDPOINT`: Your Azure OpenAI embeddings endpoint
- `PORT`: Will be set automatically by Railway

## Features

✅ **Full AI Resume Processing Restored:**
- Complex resume analysis using Azure OpenAI GPT-4
- RAG-based job description processing
- Experience tailoring and optimization  
- Skills extraction and enhancement
- Multiple resume formats (Developer, Business Analyst, Director)
- RFP document analysis
- CGI experience generation
- Document conversion (PDF/DOCX)

✅ **Authentication:**
- Supabase JWT token verification
- User session management
- Secure file access

✅ **File Processing:**
- PDF and DOCX upload support
- Asynchronous processing with progress tracking
- Secure file storage and cleanup

## Directory Structure

```
backend/
├── main.py                    # FastAPI application (Streamlit removed)
├── requirements.txt           # Full AI dependencies restored
├── .env.example              # Environment template
├── data/                     # Schemas and templates
├── src/                      # Core AI processing modules
├── utils/                    # Document conversion utilities
├── uploads/                  # Temporary upload storage
├── outputs/                  # Processed file storage
├── src_old_with_streamlit/   # Archived (backup)
└── utils_old_with_streamlit/ # Archived (backup)
```

## What Was Changed

- ❌ **Removed:** All Streamlit dependencies and imports
- ✅ **Kept:** Complete AI resume processing pipeline
- ✅ **Kept:** All LangChain, Azure OpenAI, and processing logic
- ✅ **Added:** Clean progress tracking without Streamlit
- ✅ **Added:** Null logger replacement for Streamlit logging

Your full AI-powered resume processing is back! 🎉
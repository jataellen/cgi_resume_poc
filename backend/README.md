# ResumeGenie Backend

FastAPI backend for the ResumeGenie application.

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
- `PORT`: Will be set automatically by Railway

## Directory Structure

```
backend/
├── main.py              # FastAPI application (streamlit-free)
├── requirements.txt     # Minimal Python dependencies  
├── .env.example        # Environment template
├── data/               # Schemas and templates
├── uploads/            # Temporary upload storage
├── outputs/            # Processed file storage
├── src_old_with_streamlit/  # Old modules (archived)
└── utils_old_with_streamlit/ # Old utilities (archived)
```

## Current Status

This is a **simplified version** with all Streamlit dependencies removed:
- ✅ Authentication works with Supabase
- ✅ File upload/download works  
- ⚠️ Resume processing is temporarily simplified (copies file as placeholder)
- ❌ Complex AI resume processing temporarily disabled

The complex resume processing features can be re-enabled by removing Streamlit dependencies from the archived source files.
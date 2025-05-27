# Deployment Guide

This guide will help you deploy the Resume Genie application using Supabase (auth), Railway (backend), and Netlify (frontend).

## Prerequisites

1. Accounts on:
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
   - [Netlify](https://netlify.com)
2. Git repository with your code

## Step 1: Set up Supabase

1. Create a new Supabase project
2. Go to Settings → API
3. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (for frontend)
   - Service Role Key (for backend - keep this secret!)
4. Enable Email Auth in Authentication → Providers

## Step 2: Deploy Backend to Railway

1. Push your code to GitHub
2. Create a new project on Railway
3. Connect your GitHub repository
4. Add environment variables in Railway:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   FRONTEND_URL=https://your-netlify-app.netlify.app
   PORT=8000
   ```
5. Railway will automatically deploy your app
6. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend to Netlify

1. In Netlify, create a new site from Git
2. Connect your GitHub repository
3. Set build settings:
   - Base directory: `resumegenie-frontend`
   - Build command: `npm run build`
   - Publish directory: `resumegenie-frontend/build`
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```
5. Deploy the site
6. Copy your Netlify URL

## Step 4: Update CORS Settings

Go back to Railway and update the `FRONTEND_URL` environment variable with your Netlify URL.

## Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Create an account using Supabase Auth
3. Upload a resume to test the processing

## Local Development

For local development, create `.env` files:

**Backend `.env`:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
FRONTEND_URL=http://localhost:3000
PORT=8000
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Ensure all environment variables are set
- Verify Python dependencies are installed

### Frontend Issues
- Check Netlify deploy logs
- Ensure environment variables are prefixed with `REACT_APP_`
- Clear browser cache and cookies

### Auth Issues
- Verify Supabase keys are correct
- Check that email auth is enabled in Supabase
- Ensure CORS is properly configured

### API Connection Issues
- Verify backend URL in frontend env vars
- Check that backend is running
- Test API health endpoint: `https://your-backend.railway.app/api/health`
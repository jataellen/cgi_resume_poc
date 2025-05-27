import React, { useState, useEffect, useRef } from 'react';
import {
  CssBaseline, Box, Typography, Button, Paper, CircularProgress, LinearProgress
} from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';
import appStyles from './styles/appStyles';
import uploadProgressStyles from './styles/uploadProgressStyles';
import uploadCompletedStyles from './styles/uploadCompletedStyles';
import apiService, { setAuthInstance } from './services/apiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';

function AppContent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  
  const statusIntervalRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  const pollStatus = async (sessionId) => {
    try {
      const status = await apiService.getStatus(sessionId);
      
      // Update state
      setLogs(status.logs);
      setProgress(status.progress);
      
      if (status.status === 'completed') {
        setIsUploading(false);
        setIsCompleted(true);
        // Download URL is available at status.downloadUrl
        
        // Stop polling
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      } else if (status.status === 'error') {
        setIsUploading(false);
        setError(status.error || 'An error occurred during processing');
        
        // Stop polling
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setError(err.message);
      setIsUploading(false);
      
      // Stop polling
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setIsCompleted(false);
    setError(null);
    setLogs([]);
    setProgress(0);

    try {
      // Upload file
      const uploadResult = await apiService.uploadResume(file);
      setSessionId(uploadResult.sessionId);
      
      // Start polling for status
      statusIntervalRef.current = setInterval(() => {
        pollStatus(uploadResult.sessionId);
      }, 1000); // Poll every second
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setIsUploading(false);
    }
  };

  const handleCancel = async () => {
    // Stop polling
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }

    // Clean up session if exists
    if (sessionId) {
      try {
        await apiService.cleanupSession(sessionId);
      } catch (err) {
        console.error('Error cleaning up session:', err);
      }
    }

    // Reset state
    setIsUploading(false);
    setLogs([]);
    setSelectedFile(null);
    setSessionId(null);
    setProgress(0);
    setError(null);
  };

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      const blob = await apiService.downloadResume(sessionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name.replace(/\.(pdf|docx)$/i, '_updated.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message);
    }
  };

  const handleReset = async () => {
    // Clean up session if exists
    if (sessionId) {
      try {
        await apiService.cleanupSession(sessionId);
      } catch (err) {
        console.error('Error cleaning up session:', err);
      }
    }

    // Reset state
    setIsCompleted(false);
    setSelectedFile(null);
    setLogs([]);
    setSessionId(null);
    setProgress(0);
    setError(null);
    // Reset complete
  };

  return (
    <Box sx={appStyles.rootBox}>
      <CssBaseline />
      <TopBar />
      <SideBar />
      <Box component="main" sx={appStyles.mainBox}>
        <Typography variant="h2" sx={appStyles.heading}>
          Welcome to ResumeGenie
        </Typography>
        <Typography variant="body2" sx={appStyles.subText}>
          Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file and let AI help craft the CGI's template resume.
        </Typography>

        {error && (
          <Paper elevation={0} sx={{ ...appStyles.uploadCard, backgroundColor: '#ffebee', mb: 2 }}>
            <Typography color="error" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          </Paper>
        )}

        {!isUploading && !isCompleted && (
          <Paper elevation={0} sx={appStyles.uploadCard}>
            <Box sx={appStyles.uploadIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
                file_upload
              </span>
            </Box>
            <Typography variant="body1" sx={appStyles.uploadText}>
              Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file
            </Typography>
            <Button component="label" variant="contained" color="primary" sx={appStyles.uploadButton}>
              Upload file
              <input 
                type="file" 
                hidden 
                onChange={handleUpload} 
                accept=".pdf,.docx"
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={appStyles.uploadedFileName}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Paper>
        )}

        {isUploading && (
          <>
            <Paper elevation={0} sx={uploadProgressStyles.uploadingCard}>
              <CircularProgress sx={uploadProgressStyles.progressCircle} />
              <Typography sx={uploadProgressStyles.uploadingText}>
                Processing resume file… {progress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ width: '100%', mt: 2, mb: 2 }}
              />
              <Button onClick={handleCancel} {...uploadProgressStyles.cancelButton}>
                Cancel
              </Button>
            </Paper>

            <Paper elevation={0} sx={uploadProgressStyles.logsCard}>
              <Typography sx={uploadProgressStyles.logsTitle}>Processing logs</Typography>
              <Box sx={uploadProgressStyles.logsInnerBox}>
                {logs.map((log, idx) => (
                  <Box key={idx} sx={uploadProgressStyles.logItem}>
                    <CircularProgress size={16} sx={{ color: '#5236AB' }} />
                    <span>{log}</span>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}

        {isCompleted && (
          <>
            <Paper elevation={0} sx={uploadProgressStyles.uploadingCard}>
              <Box sx={uploadCompletedStyles.successIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
                  check_circle
                </span>
              </Box>
              <Typography sx={uploadCompletedStyles.successText}>
                Your resume is processed successfully!
              </Typography>
              <Box sx={uploadCompletedStyles.buttonRow}>
                <Button
                  variant="text"
                  sx={uploadCompletedStyles.uploadNewButton}
                  onClick={handleReset}
                >
                  Upload a new file
                </Button>

                <Button
                  variant="contained"
                  sx={uploadCompletedStyles.downloadButton}
                  onClick={handleDownload}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', mr: 1 }}>
                    download
                  </span>
                  Download crafted file
                </Button>
              </Box>
            </Paper>

            <Paper elevation={0} sx={uploadProgressStyles.logsCard}>
              <Typography sx={uploadProgressStyles.logsTitle}>Processing logs</Typography>
              <Box sx={uploadProgressStyles.logsInnerBox}>
                {logs.map((log, idx) => (
                  <Box key={idx} sx={uploadProgressStyles.logItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4CAF50' }}>
                      check_circle
                    </span>
                    <span style={{ ml: 1 }}>{log}</span>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}

      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
}

function AppWrapper() {
  const auth = useAuth();
  const { user, loading, isSupabaseConfigured } = auth;

  // Set auth instance for API service
  React.useEffect(() => {
    setAuthInstance(auth);
  }, [auth]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If Supabase is configured and user is not authenticated, show auth screen
  if (isSupabaseConfigured && !user) {
    return <Auth />;
  }

  // Otherwise show the main app
  return <AppContent />;
}

export default App;
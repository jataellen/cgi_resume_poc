import React, { useState, useEffect, useRef } from 'react';
import {
  CssBaseline, Box, Typography, Button, Paper, CircularProgress, LinearProgress,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, TextField, Checkbox,
  FormControlLabel, ToggleButtonGroup, ToggleButton
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Complex mode states
  const [selectedFormat, setSelectedFormat] = useState('Developer');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [includeDefaultCgi, setIncludeDefaultCgi] = useState(false);
  const [optimizationMethod, setOptimizationMethod] = useState('none');
  const [jobDescription, setJobDescription] = useState('');
  const [rfpFile, setRfpFile] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  
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

  const handleComplexUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setIsCompleted(false);
    setError(null);
    setLogs([]);
    setProgress(0);
    setProcessedFiles([]);

    try {
      // Process files sequentially for now
      const results = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setLogs(prev => [...prev, `Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`]);
        
        // Prepare form data with all parameters
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', selectedFormat === 'Custom' ? customRoleTitle : selectedFormat);
        formData.append('includeDefaultCgi', includeDefaultCgi);
        formData.append('optimizationMethod', optimizationMethod);
        
        if (optimizationMethod === 'description') {
          formData.append('jobDescription', jobDescription);
        } else if (optimizationMethod === 'rfp' && rfpFile) {
          formData.append('rfpFile', rfpFile);
        }

        try {
          // Upload file with complex parameters
          const uploadResult = await apiService.uploadResumeComplex(formData);
          
          // Wait for processing to complete
          const result = await pollAndWaitForCompletion(uploadResult.sessionId);
          
          results.push({
            originalName: file.name,
            status: result.status,
            downloadUrl: result.downloadUrl,
            error: result.error,
            sessionId: uploadResult.sessionId
          });
          
          // Update progress
          setProgress(((i + 1) / selectedFiles.length) * 100);
          
        } catch (err) {
          results.push({
            originalName: file.name,
            status: 'error',
            error: err.message
          });
        }
      }
      
      setProcessedFiles(results);
      setIsCompleted(true);
      setIsUploading(false);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setIsUploading(false);
    }
  };

  const pollAndWaitForCompletion = async (sessionId) => {
    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        try {
          const status = await apiService.getStatus(sessionId);
          
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(intervalId);
            resolve(status);
          }
        } catch (err) {
          clearInterval(intervalId);
          resolve({ status: 'error', error: err.message });
        }
      }, 1000);
    });
  };

  const handleDownloadSingle = async (sessionId, originalName) => {
    try {
      const blob = await apiService.downloadResume(sessionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName.replace(/\.(pdf|docx)$/i, '_updated.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message);
    }
  };

  const handleDownloadAll = async () => {
    // For now, download files one by one
    // In a production app, you might want to create a zip file on the backend
    const successfulFiles = processedFiles.filter(f => f.status === 'completed');
    
    for (const file of successfulFiles) {
      await handleDownloadSingle(file.sessionId, file.originalName);
      // Add a small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
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
    setSelectedFiles([]);
    setLogs([]);
    setSessionId(null);
    setProgress(0);
    setError(null);
    setProcessedFiles([]);
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

        <Paper elevation={0} sx={{ bgcolor: 'background.paper', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
            <Tab label="Simple Mode" />
            <Tab label="Advanced Mode" />
          </Tabs>
        </Paper>

        {!isUploading && !isCompleted && (
          <>
            {tabValue === 0 ? (
              // Simple Mode
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
            ) : (
              // Advanced Mode
              <Paper elevation={0} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Step 1: Choose Resume Format</Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Format</InputLabel>
                    <Select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      label="Select Format"
                    >
                      <MenuItem value="Developer">Developer</MenuItem>
                      <MenuItem value="Manager">Manager</MenuItem>
                      <MenuItem value="Director">Director</MenuItem>
                      <MenuItem value="Custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {selectedFormat === 'Custom' && (
                    <TextField
                      fullWidth
                      label="Custom Role Title"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeDefaultCgi}
                        onChange={(e) => setIncludeDefaultCgi(e.target.checked)}
                      />
                    }
                    label="Include AI-generated CGI experience entry"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Step 2: Choose Optimization Method</Typography>
                  <ToggleButtonGroup
                    value={optimizationMethod}
                    exclusive
                    onChange={(e, newMethod) => newMethod && setOptimizationMethod(newMethod)}
                    sx={{ mb: 2 }}
                    fullWidth
                  >
                    <ToggleButton value="none">📄 No optimization</ToggleButton>
                    <ToggleButton value="description">✏️ Enter job description</ToggleButton>
                    <ToggleButton value="rfp">📎 Upload RFP document</ToggleButton>
                  </ToggleButtonGroup>
                  
                  {optimizationMethod === 'description' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Job Description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description here..."
                    />
                  )}
                  
                  {optimizationMethod === 'rfp' && (
                    <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
                      <input
                        type="file"
                        id="rfp-upload"
                        hidden
                        accept=".pdf,.docx"
                        onChange={(e) => setRfpFile(e.target.files[0])}
                      />
                      <label htmlFor="rfp-upload">
                        <Button component="span" variant="outlined">
                          Upload RFP Document
                        </Button>
                      </label>
                      {rfpFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Selected: {rfpFile.name}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Step 3: Upload Your Resumes</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You can select multiple resume files to process at once
                  </Typography>
                  <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#666' }}>
                        file_upload
                      </span>
                    </Box>
                    <Button component="label" variant="contained" color="primary">
                      Select Resume Files
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                        accept=".pdf,.docx"
                      />
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
                        </Typography>
                        {selectedFiles.map((file, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            • {file.name}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 3 }}
                    onClick={handleComplexUpload}
                    disabled={selectedFiles.length === 0}
                  >
                    ✨ Generate Optimized Resume
                  </Button>
                </Box>
              </Paper>
            )}
          </>
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
            {/* Simple mode completion or Complex mode with single file */}
            {(tabValue === 0 || processedFiles.length === 0) ? (
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
            ) : (
              /* Complex mode with multiple files - show table */
              <>
                <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={uploadCompletedStyles.successIcon}>
                      <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
                        check_circle
                      </span>
                    </Box>
                    <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                      Processing Complete!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {processedFiles.filter(f => f.status === 'completed').length} of {processedFiles.length} files processed successfully
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2 }}>📋 Processed Files</Typography>
                  
                  {/* Table Header */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                    gap: 2, 
                    p: 2, 
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    mb: 1
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold">File Name</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">Role</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">Optimization</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">Status</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">Action</Typography>
                  </Box>

                  {/* Table Rows */}
                  {processedFiles.map((file, index) => (
                    <Box key={index} sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                      gap: 2, 
                      p: 2, 
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}>
                      <Typography variant="body2" noWrap>{file.originalName}</Typography>
                      <Typography variant="body2">{selectedFormat}</Typography>
                      <Typography variant="body2">
                        {optimizationMethod === 'none' ? 'None' : 
                         optimizationMethod === 'description' ? 'Job Desc' : 'RFP'}
                      </Typography>
                      <Box>
                        {file.status === 'completed' ? (
                          <Typography variant="body2" color="success.main">✓ Success</Typography>
                        ) : (
                          <Typography variant="body2" color="error.main">✗ Failed</Typography>
                        )}
                      </Box>
                      <Box>
                        {file.status === 'completed' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownloadSingle(file.sessionId, file.originalName)}
                          >
                            Download
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">N/A</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleReset}
                      sx={{ mr: 2 }}
                    >
                      Process New Files
                    </Button>
                    {processedFiles.filter(f => f.status === 'completed').length > 1 && (
                      <Button
                        variant="outlined"
                        onClick={handleDownloadAll}
                      >
                        Download All
                      </Button>
                    )}
                  </Box>
                </Paper>
              </>
            )}
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
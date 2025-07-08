import React, { useState, useEffect, useRef } from 'react';
import { CssBaseline, Box, Typography, CircularProgress, Zoom, Fade, CardContent } from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';
import apiService, { setAuthInstance } from './services/apiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import { StyledCard, cgiColors } from './components/ui/StyledComponents';
import ProcessingStatus from './components/ui/ProcessingStatus';
import CompletionScreen from './components/ui/CompletionScreen';
import SimpleMode from './pages/SimpleMode';
import AdvancedMode from './pages/AdvancedMode';
import Results from './pages/Results';


function AppWrapper() {
  const auth = useAuth();
  const { user, loading, isSupabaseConfigured, authMode } = auth;
  
  // Set auth instance for API service
  useEffect(() => {
    setAuthInstance(auth);
  }, [auth]);
  
  const [selectedMode, setSelectedMode] = useState('Simple Mode');
  const [processedFiles, setProcessedFiles] = useState([]);
  const [error, setError] = useState(null);
  
  // Simple mode states
  const [simpleState, setSimpleState] = useState({
    selectedFile: null,
    isUploading: false,
    isCompleted: false,
    logs: [],
    progress: 0,
    sessionId: null
  });
  
  // Advanced mode states
  const [advancedState, setAdvancedState] = useState({
    selectedFiles: [],
    isUploading: false,
    isCompleted: false,
    logs: [],
    progress: 0,
    sessionIds: [],
    selectedFormat: 'Developer',
    customRoleTitle: '',
    includeDefaultCgi: false,
    optimizationMethod: 'none',
    jobDescription: '',
    rfpFile: null,
    currentStep: 0,
    customExperiences: []
  });
  
  const simpleStatusIntervalRef = useRef(null);
  const advancedStatusIntervalRef = useRef(null);

  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS
  useEffect(() => {
    return () => {
      if (simpleStatusIntervalRef.current) {
        clearInterval(simpleStatusIntervalRef.current);
      }
      if (advancedStatusIntervalRef.current) {
        clearInterval(advancedStatusIntervalRef.current);
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress sx={{ color: cgiColors.primary }} />
        <Typography sx={{ color: cgiColors.gray }}>
          {authMode === 'checking' ? 'Initializing authentication...' : 'Loading ResumeGenie...'}
        </Typography>
      </Box>
    );
  }

  // Show auth screen if no user (works for both Supabase and mock modes)
   if (!user) {
    return <Auth />;
  }

  const pollSimpleStatus = async (sessionId, fileName) => {
    try {
      const status = await apiService.getStatus(sessionId);
      
      setSimpleState(prev => ({
        ...prev,
        logs: status.logs,
        progress: status.progress
      }));
      
      if (status.status === 'completed') {
        setSimpleState(prev => ({
          ...prev,
          isUploading: false,
          isCompleted: true
        }));
        
        // Add to processed files - FIXED TO PREVENT DUPLICATES
        const newFile = {
          id: sessionId,
          name: fileName || 'Unknown',
          status: 'completed',
          downloadUrl: status.downloadUrl,
          processedAt: new Date().toISOString(),
          uploadType: 'Simple'
        };
        setProcessedFiles(prev => prev.some(f => f.id === sessionId) ? prev : [...prev, newFile]);
        
        if (simpleStatusIntervalRef.current) {
          clearInterval(simpleStatusIntervalRef.current);
          simpleStatusIntervalRef.current = null;
        }
      } else if (status.status === 'error') {
        setSimpleState(prev => ({
          ...prev,
          isUploading: false
        }));
        setError(status.error || 'An error occurred during processing');
        
        if (simpleStatusIntervalRef.current) {
          clearInterval(simpleStatusIntervalRef.current);
          simpleStatusIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setError(err.message);
      setSimpleState(prev => ({
        ...prev,
        isUploading: false
      }));
      
      if (simpleStatusIntervalRef.current) {
        clearInterval(simpleStatusIntervalRef.current);
        simpleStatusIntervalRef.current = null;
      }
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    setSimpleState(prev => ({
      ...prev,
      selectedFile: file,
      isUploading: true,
      isCompleted: false,
      logs: [],
      progress: 0
    }));
    setError(null);

    try {
      const uploadResult = await apiService.uploadResume(file);
      setSimpleState(prev => ({
        ...prev,
        sessionId: uploadResult.sessionId
      }));
      
      simpleStatusIntervalRef.current = setInterval(() => {
        pollSimpleStatus(uploadResult.sessionId, file.name);
      }, 1000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setSimpleState(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  const handleAdvancedUpload = async () => {
    if (advancedState.selectedFiles.length === 0) return;

    setAdvancedState(prev => ({
      ...prev,
      isUploading: true,
      isCompleted: false,
      logs: [],
      progress: 0
    }));
    setError(null);

    try {
      const results = [];
      
      for (let i = 0; i < advancedState.selectedFiles.length; i++) {
        const file = advancedState.selectedFiles[i];
        setAdvancedState(prev => ({
          ...prev,
          logs: [...prev.logs, `Processing file ${i + 1}/${advancedState.selectedFiles.length}: ${file.name}`]
        }));
        
        try {
          // Create FormData with all advanced parameters
          const formData = new FormData();
          formData.append('file', file);
          formData.append('selectedFormat', advancedState.selectedFormat);
          formData.append('customRoleTitle', advancedState.customRoleTitle);
          formData.append('includeDefaultCgi', advancedState.includeDefaultCgi);
          formData.append('optimizationMethod', advancedState.optimizationMethod);
          formData.append('jobDescription', advancedState.jobDescription);
          if (advancedState.rfpFile) {
            formData.append('rfpFile', advancedState.rfpFile);
          }
          // Add custom experiences as JSON
          if (advancedState.customExperiences.length > 0) {
            formData.append('customExperiences', JSON.stringify(advancedState.customExperiences));
          }
          
          const uploadResult = await apiService.uploadResumeComplex(formData);
          
          const result = await new Promise((resolve) => {
            const intervalId = setInterval(async () => {
              try {
                const status = await apiService.getStatus(uploadResult.sessionId);
                
                if (status.logs && status.logs.length > 0) {
                  setAdvancedState(prev => {
                    const newLogs = [...prev.logs];
                    status.logs.forEach(log => {
                      if (!newLogs.includes(log) && !log.includes(file.name)) {
                        newLogs.push(log);
                      }
                    });
                    return {
                      ...prev,
                      logs: newLogs
                    };
                  });
                }
                
                const fileProgress = (i / advancedState.selectedFiles.length) * 100 + (status.progress / advancedState.selectedFiles.length);
                setAdvancedState(prev => ({
                  ...prev,
                  progress: fileProgress
                }));
                
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
          
          results.push({
            originalName: file.name,
            status: result.status,
            downloadUrl: result.downloadUrl,
            error: result.error,
            sessionId: uploadResult.sessionId
          });
          
        } catch (err) {
          results.push({
            originalName: file.name,
            status: 'error',
            error: err.message
          });
        }
      }
      
      // Add all processed files to the processedFiles list - PREVENT DUPLICATES
      const newProcessedFiles = results.map(result => ({
        id: result.sessionId || Math.random().toString(36).substr(2, 9),
        name: result.originalName,
        status: result.status,
        downloadUrl: result.downloadUrl,
        error: result.error,
        processedAt: new Date().toISOString(),
        uploadType: 'Advanced'
      }));
      
      // Filter out duplicates
      setProcessedFiles(prev => {
        const existingIds = new Set(prev.map(file => file.id));
        const uniqueNewFiles = newProcessedFiles.filter(file => !existingIds.has(file.id));
        return [...prev, ...uniqueNewFiles];
      });
      
      setAdvancedState(prev => ({
        ...prev,
        isCompleted: true,
        isUploading: false
      }));
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setAdvancedState(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  const handleDownload = async () => {
    if (!simpleState.sessionId) return;

    try {
      const blob = await apiService.downloadResume(simpleState.sessionId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = simpleState.selectedFile.name.replace(/\.(pdf|docx)$/i, '_updated.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message);
    }
  };

  const handleSimpleReset = () => {
    setSimpleState({
      selectedFile: null,
      isUploading: false,
      isCompleted: false,
      logs: [],
      progress: 0,
      sessionId: null
    });
    setError(null);
    
    if (selectedMode === 'Results') {
      setSelectedMode('Simple Mode');
    }
  };
  
  const handleAdvancedReset = () => {
    setAdvancedState({
      selectedFiles: [],
      isUploading: false,
      isCompleted: false,
      logs: [],
      progress: 0,
      sessionIds: [],
      selectedFormat: 'Developer',
      customRoleTitle: '',
      includeDefaultCgi: false,
      optimizationMethod: 'none',
      jobDescription: '',
      rfpFile: null,
      currentStep: 0,
      customExperiences: []
    });
    setError(null);
    
    if (selectedMode === 'Results') {
      setSelectedMode('Advanced Mode');
    }
  };


  return (
    <Box sx={{ 
      display: 'flex', 
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      <CssBaseline />
      <TopBar />
      <SideBar 
        selectedMode={selectedMode}
        onModeChange={(mode) => setSelectedMode(mode)}
      />
      
      <Box component="main" sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        pt: { xs: 8, sm: 11 }, // Account for top bar
        pb: 3,
        px: 3,
        minHeight: '100vh',
        overflow: 'auto'
      }}>
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: '1200px', 
            textAlign: 'center',
            mb: 4
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 2, 
                color: cgiColors.primary,
                fontWeight: 700,
                background: cgiColors.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome to ResumeGenie
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                color: cgiColors.gray,
                fontWeight: 400
              }}
            >
              {selectedMode === 'Simple Mode' 
                ? <>Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file and let AI help craft the CGI's template resume.</>
                : selectedMode === 'Advanced Mode'
                ? <>Advanced mode: Customize role format, add job descriptions, and process multiple resumes at once.</>
                : <>View and download your processed resume files.</>
              }
            </Typography>
            
            {/* Show auth mode indicator for development */}
            {authMode === 'mock' && (
              <Typography variant="caption" sx={{ 
                color: cgiColors.secondary, 
                backgroundColor: cgiColors.lightGray,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Running in {authMode} mode
              </Typography>
            )}
          </Box>
        </Fade>

        {error && (
          <Zoom in={true}>
            <StyledCard sx={{ 
              mb: 3, 
              borderLeft: `4px solid ${cgiColors.error}`, 
              width: '100%', 
              maxWidth: '1000px'
            }}>
              <CardContent>
                <Typography color="error" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </CardContent>
            </StyledCard>
          </Zoom>
        )}

        {selectedMode === 'Results' && (
          <Results 
            processedFiles={processedFiles} 
            setError={setError} 
          />
        )}

        {selectedMode === 'Simple Mode' && (
          <SimpleMode
            simpleState={simpleState}
            onUpload={handleUpload}
            error={error}
          />
        )}

        {selectedMode === 'Advanced Mode' && (
          <AdvancedMode
            advancedState={advancedState}
            onStateChange={setAdvancedState}
            onUpload={handleAdvancedUpload}
            error={error}
            setError={setError}
          />
        )}

        <ProcessingStatus
          isUploading={((selectedMode === 'Simple Mode' && simpleState.isUploading) || (selectedMode === 'Advanced Mode' && advancedState.isUploading))}
          progress={selectedMode === 'Simple Mode' ? simpleState.progress : advancedState.progress}
          logs={selectedMode === 'Simple Mode' ? simpleState.logs : advancedState.logs}
          mode={selectedMode}
          onCancel={() => {
            if (selectedMode === 'Simple Mode') {
              setSimpleState(prev => ({ ...prev, isUploading: false }));
            } else {
              setAdvancedState(prev => ({ ...prev, isUploading: false }));
            }
          }}
        />

        <CompletionScreen
          isCompleted={((selectedMode === 'Simple Mode' && simpleState.isCompleted) || (selectedMode === 'Advanced Mode' && advancedState.isCompleted))}
          onReset={selectedMode === 'Simple Mode' ? handleSimpleReset : handleAdvancedReset}
          onViewResults={() => setSelectedMode('Results')}
          mode={selectedMode}
        />

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

export default App;
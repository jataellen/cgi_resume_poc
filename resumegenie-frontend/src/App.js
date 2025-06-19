import React, { useState, useEffect, useRef } from 'react';
import {
  CssBaseline, Box, Typography, Button, CircularProgress, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Checkbox,
  FormControlLabel, ToggleButtonGroup, ToggleButton, Card, CardContent,
  Stepper, Step, StepLabel, Chip, Fade, Zoom, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TopBar from './TopBar';
import SideBar from './SideBar';
import apiService, { setAuthInstance } from './services/apiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';

// CGI Theme Colors
const cgiColors = {
  primary: '#5236AB',
  secondary: '#E31937',
  success: '#1AB977',
  warning: '#F1A425',
  error: '#B00020',
  gray: '#333333',
  lightGray: '#F2F1F9',
  white: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #5236AB 0%, #A82465 60%, #E31937 100%)'
};

// Styled Components with CGI Theme
const StyledCard = styled(Card)(({ theme }) => ({
  background: cgiColors.white,
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(82, 54, 171, 0.1)',
  border: `1px solid ${cgiColors.lightGray}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(82, 54, 171, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: cgiColors.gradient,
  color: cgiColors.white,
  borderRadius: '8px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 4px 15px rgba(82, 54, 171, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: cgiColors.gradient,
    boxShadow: '0 6px 20px rgba(82, 54, 171, 0.4)',
    transform: 'translateY(-1px)'
  },
  '&:disabled': {
    background: '#cccccc',
    color: '#666666'
  }
}));

const CGIButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '14px',
  transition: 'all 0.3s ease',
  ...(variant === 'contained' && {
    backgroundColor: cgiColors.primary,
    color: cgiColors.white,
    '&:hover': {
      backgroundColor: '#3A2679',
      boxShadow: '0 4px 15px rgba(82, 54, 171, 0.3)'
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: cgiColors.primary,
    color: cgiColors.primary,
    '&:hover': {
      backgroundColor: cgiColors.lightGray,
      borderColor: cgiColors.primary
    }
  })
}));

const UploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${cgiColors.primary}`,
  borderRadius: '12px',
  padding: '40px 20px',
  textAlign: 'center',
  background: `linear-gradient(135deg, ${cgiColors.lightGray} 0%, ${cgiColors.white} 100%)`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: cgiColors.secondary,
    background: `linear-gradient(135deg, ${cgiColors.white} 0%, ${cgiColors.lightGray} 100%)`,
    transform: 'translateY(-2px)'
  }
}));

const UploadIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  '& .material-symbols-outlined': {
    fontSize: '60px',
    background: cgiColors.gradient,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '400'
  }
}));

const SuccessIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: cgiColors.gradient,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  boxShadow: '0 8px 25px rgba(82, 54, 171, 0.3)',
  '& .material-symbols-outlined': {
    fontSize: '40px',
    color: cgiColors.white
  }
}));

const StepperStyled = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: '#666666' // Grey for completed steps
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: cgiColors.primary
  },
  '& .MuiStepConnector-line': {
    borderColor: cgiColors.lightGray
  },
  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
    borderColor: '#666666' // Grey line for completed connectors
  }
}));

const CGIToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    borderColor: cgiColors.primary,
    color: cgiColors.primary,
    '&.Mui-selected': {
      backgroundColor: cgiColors.primary,
      color: cgiColors.white,
      '&:hover': {
        backgroundColor: '#3A2679'
      }
    },
    '&:hover': {
      backgroundColor: cgiColors.lightGray
    }
  }
}));

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
        
        // Add to processed files
        const newFile = {
          id: sessionId,
          name: fileName || 'Unknown',
          status: 'completed',
          downloadUrl: status.downloadUrl,
          processedAt: new Date().toISOString(),
          uploadType: 'Simple'
        };
        setProcessedFiles(prev => [...prev, newFile]);
        
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
      
      // Add all processed files to the processedFiles list
      const newProcessedFiles = results.map(result => ({
        id: result.sessionId || Math.random().toString(36).substr(2, 9),
        name: result.originalName,
        status: result.status,
        downloadUrl: result.downloadUrl,
        error: result.error,
        processedAt: new Date().toISOString(),
        uploadType: 'Advanced'
      }));
      setProcessedFiles(prev => [...prev, ...newProcessedFiles]);
      
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

  const steps = ['Choose Format', 'Optimization', 'Add Experience', 'Upload Files'];

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
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              width: '100%', 
              maxWidth: '1200px'
            }}>
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: cgiColors.primary, fontWeight: 600 }}>
                      Processed Files
                    </Typography>
                    {processedFiles.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            for (const file of processedFiles) {
                              if (file.downloadUrl && file.status === 'completed') {
                                const blob = await apiService.downloadResume(file.id);
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.name.replace(/\.(pdf|docx?)$/i, '_updated.docx');
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                // Add delay between downloads
                                await new Promise(resolve => setTimeout(resolve, 500));
                              }
                            }
                          } catch (err) {
                            setError('Failed to download files');
                          }
                        }}
                        sx={{
                          background: cgiColors.gradient,
                          color: cgiColors.white,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            background: cgiColors.gradient,
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Download All
                      </Button>
                    )}
                  </Box>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>File Name</TableCell>
                          <TableCell>Upload Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Processed At</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {processedFiles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body1" color="text.secondary">
                                No files processed yet. Upload files in Simple or Advanced mode to see them here.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          processedFiles.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell>{file.name}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={file.uploadType || 'Simple'} 
                                  color={file.uploadType === 'Advanced' ? 'primary' : 'default'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={file.status} 
                                  color={file.status === 'completed' ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{new Date(file.processedAt).toLocaleString()}</TableCell>
                              <TableCell>
                                {file.downloadUrl && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={async () => {
                                      try {
                                        const blob = await apiService.downloadResume(file.id);
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.name.replace(/\.(pdf|docx?)$/i, '_updated.docx');
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      } catch (err) {
                                        setError('Failed to download file');
                                      }
                                    }}
                                  >
                                    Download
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {selectedMode === 'Simple Mode' && !simpleState.isUploading && !simpleState.isCompleted && (
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <StyledCard sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <UploadZone>
                    <UploadIcon>
                      <span className="material-symbols-outlined">file_upload</span>
                    </UploadIcon>
                    <Typography variant="h5" sx={{ mb: 2, color: cgiColors.primary, fontWeight: 600 }}>
                      Upload Resume File
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: cgiColors.gray }}>
                      Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file
                    </Typography>
                    <GradientButton component="label">
                      Choose File
                      <input 
                        type="file" 
                        hidden 
                        onChange={handleUpload} 
                        accept=".pdf,.docx"
                      />
                    </GradientButton>
                    {simpleState.selectedFile && (
                      <Typography variant="body2" sx={{ mt: 2, color: cgiColors.primary, fontWeight: 500 }}>
                        Selected: {simpleState.selectedFile.name}
                      </Typography>
                    )}
                  </UploadZone>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {selectedMode === 'Advanced Mode' && !advancedState.isUploading && !advancedState.isCompleted && (
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <StyledCard sx={{ maxWidth: 1000, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <StepperStyled activeStep={advancedState.currentStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </StepperStyled>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 600 }}>
                      Step 1: Choose Resume Format
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Format</InputLabel>
                      <Select
                        value={advancedState.selectedFormat}
                        onChange={(e) => {
                          setAdvancedState(prev => ({
                            ...prev,
                            selectedFormat: e.target.value,
                            currentStep: prev.currentStep < 0 ? 0 : prev.currentStep
                          }));
                        }}
                        label="Select Format"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: cgiColors.primary
                            }
                          }
                        }}
                      >
                        <MenuItem value="Developer">Developer</MenuItem>
                        <MenuItem value="Business Analyst">Business Analyst</MenuItem>
                        <MenuItem value="Director">Director</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Enter specific role title (optional)"
                      value={advancedState.customRoleTitle}
                      onChange={(e) => setAdvancedState(prev => ({ ...prev, customRoleTitle: e.target.value }))}
                      placeholder="e.g. Senior Full Stack Developer"
                      helperText="E.g., 'Senior Full Stack Developer', 'Data Scientist', 'Project Manager'"
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: cgiColors.primary
                          }
                        }
                      }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={advancedState.includeDefaultCgi}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, includeDefaultCgi: e.target.checked }))}
                          sx={{ color: cgiColors.primary }}
                        />
                      }
                      label="Include AI-generated CGI experience entry"
                    />
                    <Typography variant="caption" display="block" sx={{ ml: 4, mb: 2, color: cgiColors.gray }}>
                      Adds a customized CGI consulting role with relevant experience to your resume.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 600 }}>
                      Step 2: Choose Optimization Method
                    </Typography>
                    <CGIToggleButtonGroup
                      value={advancedState.optimizationMethod}
                      exclusive
                      onChange={(e, newMethod) => {
                        if (newMethod) {
                          setAdvancedState(prev => ({
                            ...prev,
                            optimizationMethod: newMethod,
                            currentStep: prev.currentStep < 1 ? 1 : prev.currentStep
                          }));
                        }
                      }}
                      sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}
                    >
                      <ToggleButton value="none" sx={{ flex: '1 1 200px' }}>
                        📄 No optimization
                      </ToggleButton>
                      <ToggleButton value="description" sx={{ flex: '1 1 200px' }}>
                        ✏️ Enter job description
                      </ToggleButton>
                      <ToggleButton value="rfp" sx={{ flex: '1 1 200px' }}>
                        📎 Upload RFP document
                      </ToggleButton>
                    </CGIToggleButtonGroup>
                    
                    {advancedState.optimizationMethod === 'description' && (
                      <Fade in={true}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Job Description"
                          value={advancedState.jobDescription}
                          onChange={(e) => {
                            setAdvancedState(prev => ({
                              ...prev,
                              jobDescription: e.target.value,
                              currentStep: prev.currentStep < 1 ? 1 : prev.currentStep
                            }));
                          }}
                          placeholder="Paste job description here..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: cgiColors.primary
                              }
                            }
                          }}
                        />
                      </Fade>
                    )}
                    
                    {advancedState.optimizationMethod === 'rfp' && (
                      <Fade in={true}>
                        <UploadZone sx={{ mt: 2 }}>
                          <input
                            type="file"
                            id="rfp-upload"
                            hidden
                            accept=".pdf,.docx,.doc"
                            onChange={(e) => {
                              setAdvancedState(prev => ({
                                ...prev,
                                rfpFile: e.target.files[0],
                                currentStep: prev.currentStep < 1 ? 1 : prev.currentStep
                              }));
                            }}
                          />
                          <label htmlFor="rfp-upload">
                            <CGIButton component="span" variant="outlined">
                              Upload RFP Document
                            </CGIButton>
                          </label>
                          {advancedState.rfpFile && (
                            <Typography variant="body2" sx={{ mt: 1, color: cgiColors.primary }}>
                              Selected: {advancedState.rfpFile.name}
                            </Typography>
                          )}
                        </UploadZone>
                      </Fade>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 600 }}>
                      Step 3: Add Custom Experience (Optional)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3, color: cgiColors.gray }}>
                      Add additional experience entries to be included in your resume
                    </Typography>
                    
                    {advancedState.customExperiences.map((exp, index) => (
                      <StyledCard key={index} sx={{ mb: 2, p: 2, backgroundColor: cgiColors.lightGray }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: cgiColors.primary }}>
                              {exp.position_title || 'Position Title'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: cgiColors.gray }}>
                              {exp.company || 'Company'} | {exp.start_date || 'Start'} - {exp.end_date || 'End'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {exp.description || 'Description'}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setAdvancedState(prev => ({
                                ...prev,
                                customExperiences: prev.customExperiences.filter((_, i) => i !== index)
                              }));
                            }}
                            sx={{ color: cgiColors.error }}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </IconButton>
                        </Box>
                      </StyledCard>
                    ))}
                    
                    <StyledCard sx={{ p: 3, border: `2px dashed ${cgiColors.primary}`, backgroundColor: 'transparent' }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: cgiColors.primary }}>
                        Add New Experience Entry
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                          id="new-company"
                          label="Company/Client"
                          placeholder="e.g., ABC Corporation"
                          variant="outlined"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: cgiColors.primary
                              }
                            }
                          }}
                        />
                        <TextField
                          id="new-position"
                          label="Position Title"
                          placeholder="e.g., Senior Software Engineer"
                          variant="outlined"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: cgiColors.primary
                              }
                            }
                          }}
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <TextField
                            id="new-start-date"
                            label="Start Date"
                            placeholder="MM/YY"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: cgiColors.primary
                                }
                              }
                            }}
                          />
                          <TextField
                            id="new-end-date"
                            label="End Date"
                            placeholder="MM/YY or Present"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: cgiColors.primary
                                }
                              }
                            }}
                          />
                        </Box>
                        <TextField
                          id="new-description"
                          label="Description/Responsibilities"
                          placeholder="Describe your key responsibilities and achievements..."
                          multiline
                          rows={4}
                          variant="outlined"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: cgiColors.primary
                              }
                            }
                          }}
                        />
                        <CGIButton
                          variant="contained"
                          onClick={() => {
                            const company = document.getElementById('new-company').value;
                            const position = document.getElementById('new-position').value;
                            const startDate = document.getElementById('new-start-date').value;
                            const endDate = document.getElementById('new-end-date').value;
                            const description = document.getElementById('new-description').value;
                            
                            if (company && position && startDate && endDate && description) {
                              setAdvancedState(prev => ({
                                ...prev,
                                customExperiences: [...prev.customExperiences, {
                                  company: company,
                                  position_title: position,
                                  start_date: startDate,
                                  end_date: endDate,
                                  description: description
                                }],
                                currentStep: prev.currentStep < 2 ? 2 : prev.currentStep
                              }));
                              
                              // Clear form
                              document.getElementById('new-company').value = '';
                              document.getElementById('new-position').value = '';
                              document.getElementById('new-start-date').value = '';
                              document.getElementById('new-end-date').value = '';
                              document.getElementById('new-description').value = '';
                            } else {
                              setError('Please fill in all experience fields');
                            }
                          }}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          <span className="material-symbols-outlined" style={{ marginRight: '8px', fontSize: '20px' }}>add</span>
                          Add Experience
                        </CGIButton>
                      </Box>
                    </StyledCard>
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 600 }}>
                      Step 4: Upload Your Resumes
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: cgiColors.gray }}>
                      You can select multiple resume files to process at once
                    </Typography>
                    
                    <UploadZone>
                      <UploadIcon>
                        <span className="material-symbols-outlined">file_upload</span>
                      </UploadIcon>
                      <Typography variant="h6" sx={{ mb: 2, color: cgiColors.primary, fontWeight: 600 }}>
                        Select Resume Files
                      </Typography>
                      <GradientButton component="label">
                        Choose Files
                        <input
                          type="file"
                          hidden
                          multiple
                          onChange={(e) => {
                            setAdvancedState(prev => ({
                              ...prev,
                              selectedFiles: Array.from(e.target.files),
                              currentStep: prev.currentStep < 3 ? 3 : prev.currentStep
                            }));
                          }}
                          accept=".pdf,.docx,.doc"
                        />
                      </GradientButton>
                      {advancedState.selectedFiles.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: cgiColors.primary }}>
                            Selected {advancedState.selectedFiles.length} file{advancedState.selectedFiles.length > 1 ? 's' : ''}:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {advancedState.selectedFiles.map((file, index) => (
                              <Chip
                                key={index}
                                label={file.name}
                                sx={{
                                  backgroundColor: cgiColors.lightGray,
                                  color: cgiColors.primary,
                                  fontWeight: 500
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </UploadZone>
                    
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <GradientButton
                        size="large"
                        onClick={handleAdvancedUpload}
                        disabled={advancedState.selectedFiles.length === 0}
                        sx={{ px: 4, py: 1.5, fontSize: '18px' }}
                      >
                        ✨ Generate Optimized Resume
                      </GradientButton>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {((selectedMode === 'Simple Mode' && simpleState.isUploading) || (selectedMode === 'Advanced Mode' && advancedState.isUploading)) && (
          <Fade in={true}>
            <Box sx={{ 
              maxWidth: 800, 
              width: '100%'
            }}>
              <StyledCard sx={{ mb: 3 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <CircularProgress 
                    size={60} 
                    sx={{ 
                      color: cgiColors.primary,
                      mb: 3
                    }} 
                  />
                  <Typography variant="h5" sx={{ mb: 2, color: cgiColors.primary, fontWeight: 600 }}>
                    Processing resume file… {selectedMode === 'Simple Mode' ? simpleState.progress : advancedState.progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedMode === 'Simple Mode' ? simpleState.progress : advancedState.progress} 
                    sx={{ 
                      width: '100%', 
                      height: 8,
                      borderRadius: 4,
                      mb: 3,
                      backgroundColor: cgiColors.lightGray,
                      '& .MuiLinearProgress-bar': {
                        background: cgiColors.gradient
                      }
                    }}
                  />
                  <CGIButton 
                    variant="outlined" 
                    onClick={() => {
                      if (selectedMode === 'Simple Mode') {
                        setSimpleState(prev => ({ ...prev, isUploading: false }));
                      } else {
                        setAdvancedState(prev => ({ ...prev, isUploading: false }));
                      }
                    }}
                  >
                    Cancel
                  </CGIButton>
                </CardContent>
              </StyledCard>

              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: cgiColors.primary, fontWeight: 600 }}>
                    Processing logs
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {(selectedMode === 'Simple Mode' ? simpleState.logs : advancedState.logs).map((log, idx) => {
                      const logs = selectedMode === 'Simple Mode' ? simpleState.logs : advancedState.logs;
                      const isLastLog = idx === logs.length - 1;
                      const isCompleted = !isLastLog;
                      
                      return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {isCompleted ? (
                            <span className="material-symbols-outlined" style={{ 
                              fontSize: '16px', 
                              color: cgiColors.success,
                              marginRight: '8px'
                            }}>
                              check_circle
                            </span>
                          ) : (
                            <CircularProgress size={16} sx={{ color: cgiColors.primary, mr: 1 }} />
                          )}
                          <Typography variant="body2" sx={{ color: cgiColors.gray }}>
                            {log}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
        )}

        {((selectedMode === 'Simple Mode' && simpleState.isCompleted) || (selectedMode === 'Advanced Mode' && advancedState.isCompleted)) && (
          <Fade in={true}>
            <Box sx={{ 
              maxWidth: 800, 
              width: '100%'
            }}>
              <StyledCard sx={{ mb: 3 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <SuccessIcon sx={{ mb: 3 }}>
                    <span className="material-symbols-outlined">check_circle</span>
                  </SuccessIcon>
                  <Typography variant="h4" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 700 }}>
                    Your resume is processed successfully!
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <CGIButton
                      variant="outlined"
                      onClick={selectedMode === 'Simple Mode' ? handleSimpleReset : handleAdvancedReset}
                    >
                      Upload a new file
                    </CGIButton>
                    <GradientButton
                      onClick={() => setSelectedMode('Results')}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <span className="material-symbols-outlined">folder_open</span>
                      View Results
                    </GradientButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
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

export default App;
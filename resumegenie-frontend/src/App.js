import React, { useState, useEffect, useRef } from 'react';
import {
  CssBaseline, Box, Typography, Button, CircularProgress, LinearProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Checkbox,
  FormControlLabel, ToggleButtonGroup, ToggleButton, Card, CardContent,
  Stepper, Step, StepLabel, Chip, Fade, Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TopBar from './TopBar';
import SideBar from './SideBar';
import apiService from './services/apiService';
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
  const { user, loading, isSupabaseConfigured } = auth;
  
  // Set auth instance for API service
  useEffect(() => {
    apiService.setAuthInstance(auth);
  }, [auth]);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('Simple Mode');
  
  // Advanced mode states
  const [selectedFormat, setSelectedFormat] = useState('Developer');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [includeDefaultCgi, setIncludeDefaultCgi] = useState(false);
  const [optimizationMethod, setOptimizationMethod] = useState('none');
  const [jobDescription, setJobDescription] = useState('');
  const [rfpFile, setRfpFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const statusIntervalRef = useRef(null);

  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  // NOW WE CAN DO CONDITIONAL RETURNS
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: cgiColors.primary }} />
      </Box>
    );
  }

  // If Supabase is configured and user is not authenticated, show auth screen
  if (isSupabaseConfigured && !user) {
    return <Auth />;
  }

  const pollStatus = async (sessionId) => {
    try {
      const status = await apiService.getStatus(sessionId);
      
      setLogs(status.logs);
      setProgress(status.progress);
      
      if (status.status === 'completed') {
        setIsUploading(false);
        setIsCompleted(true);
        
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      } else if (status.status === 'error') {
        setIsUploading(false);
        setError(status.error || 'An error occurred during processing');
        
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setError(err.message);
      setIsUploading(false);
      
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
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

    setSelectedFile(file);
    setIsUploading(true);
    setIsCompleted(false);
    setError(null);
    setLogs([]);
    setProgress(0);

    try {
      const uploadResult = await apiService.uploadResume(file);
      setSessionId(uploadResult.sessionId);
      
      statusIntervalRef.current = setInterval(() => {
        pollStatus(uploadResult.sessionId);
      }, 1000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setIsUploading(false);
    }
  };

  const handleAdvancedUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setIsCompleted(false);
    setError(null);
    setLogs([]);
    setProgress(0);

    try {
      const results = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setLogs(prev => [...prev, `Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`]);
        
        try {
          const uploadResult = await apiService.uploadResume(file);
          
          const result = await new Promise((resolve) => {
            const intervalId = setInterval(async () => {
              try {
                const status = await apiService.getStatus(uploadResult.sessionId);
                
                if (status.logs && status.logs.length > 0) {
                  setLogs(prev => {
                    const newLogs = [...prev];
                    status.logs.forEach(log => {
                      if (!newLogs.includes(log) && !log.includes(file.name)) {
                        newLogs.push(log);
                      }
                    });
                    return newLogs;
                  });
                }
                
                const fileProgress = (i / selectedFiles.length) * 100 + (status.progress / selectedFiles.length);
                setProgress(fileProgress);
                
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
      
      setIsCompleted(true);
      setIsUploading(false);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      const blob = await apiService.downloadResume(sessionId);
      
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

  const handleReset = () => {
    setIsCompleted(false);
    setSelectedFile(null);
    setSelectedFiles([]);
    setLogs([]);
    setSessionId(null);
    setProgress(0);
    setError(null);
    setIsUploading(false);
    setCurrentStep(0);
    
    if (selectedMode === 'Results') {
      setSelectedMode('Simple Mode');
    }
  };

  const steps = ['Choose Format', 'Optimization', 'Upload Files'];

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

        {!isUploading && !isCompleted && selectedMode !== 'Results' && (
          <Fade in={true} timeout={1000}>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              {selectedMode === 'Simple Mode' ? (
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
                      {selectedFile && (
                        <Typography variant="body2" sx={{ mt: 2, color: cgiColors.primary, fontWeight: 500 }}>
                          Selected: {selectedFile.name}
                        </Typography>
                      )}
                    </UploadZone>
                  </CardContent>
                </StyledCard>
              ) : (
                <StyledCard sx={{ maxWidth: 1000, width: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <StepperStyled activeStep={currentStep} sx={{ mb: 4 }}>
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
                          value={selectedFormat}
                          onChange={(e) => {
                            setSelectedFormat(e.target.value);
                            // Stay on step 1 (format selection is step 0)
                            if (currentStep < 0) setCurrentStep(0);
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
                        value={customRoleTitle}
                        onChange={(e) => setCustomRoleTitle(e.target.value)}
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
                            checked={includeDefaultCgi}
                            onChange={(e) => setIncludeDefaultCgi(e.target.checked)}
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
                        value={optimizationMethod}
                        exclusive
                        onChange={(e, newMethod) => {
                          if (newMethod) {
                            setOptimizationMethod(newMethod);
                            // Move to step 2 when optimization method is selected
                            if (currentStep < 1) setCurrentStep(1);
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
                      
                      {optimizationMethod === 'description' && (
                        <Fade in={true}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Job Description"
                            value={jobDescription}
                            onChange={(e) => {
                              setJobDescription(e.target.value);
                              // Move to step 2 when typing in job description
                              if (currentStep < 1) setCurrentStep(1);
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
                      
                      {optimizationMethod === 'rfp' && (
                        <Fade in={true}>
                          <UploadZone sx={{ mt: 2 }}>
                            <input
                              type="file"
                              id="rfp-upload"
                              hidden
                              accept=".pdf,.docx,.doc"
                              onChange={(e) => {
                                setRfpFile(e.target.files[0]);
                                // Move to step 2 when RFP file is uploaded
                                if (currentStep < 1) setCurrentStep(1);
                              }}
                            />
                            <label htmlFor="rfp-upload">
                              <CGIButton component="span" variant="outlined">
                                Upload RFP Document
                              </CGIButton>
                            </label>
                            {rfpFile && (
                              <Typography variant="body2" sx={{ mt: 1, color: cgiColors.primary }}>
                                Selected: {rfpFile.name}
                              </Typography>
                            )}
                          </UploadZone>
                        </Fade>
                      )}
                    </Box>
                    
                    <Box>
                      <Typography variant="h5" sx={{ mb: 3, color: cgiColors.primary, fontWeight: 600 }}>
                        Step 3: Upload Your Resumes
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
                              setSelectedFiles(Array.from(e.target.files));
                              // Move to step 3 when files are selected
                              if (currentStep < 2) setCurrentStep(2);
                            }}
                            accept=".pdf,.docx,.doc"
                          />
                        </GradientButton>
                        {selectedFiles.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 2, color: cgiColors.primary }}>
                              Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                              {selectedFiles.map((file, index) => (
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
                          disabled={selectedFiles.length === 0}
                          sx={{ px: 4, py: 1.5, fontSize: '18px' }}
                        >
                          ✨ Generate Optimized Resume
                        </GradientButton>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              )}
            </Box>
          </Fade>
        )}

        {isUploading && (
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
                    Processing resume file… {progress}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
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
                    onClick={() => setIsUploading(false)}
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
                    {logs.map((log, idx) => {
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

        {isCompleted && (
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
                      onClick={handleReset}
                    >
                      Upload a new file
                    </CGIButton>
                    <GradientButton
                      onClick={handleDownload}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <span className="material-symbols-outlined">download</span>
                      Download crafted file
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
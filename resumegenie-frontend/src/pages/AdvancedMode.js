import React from 'react';
import { 
  Box, Typography, CardContent, Fade, FormControl, InputLabel, Select, MenuItem, 
  TextField, Checkbox, FormControlLabel, ToggleButton, Step, StepLabel, Chip, IconButton
} from '@mui/material';
import { 
  StyledCard, GradientButton, UploadZone, UploadIcon, CGIButton, StepperStyled, 
  CGIToggleButtonGroup, cgiColors 
} from '../components/ui/StyledComponents';

const AdvancedMode = ({ 
  advancedState,
  onStateChange,
  onUpload,
  error,
  setError
}) => {
  const { 
    selectedFiles, isUploading, isCompleted, selectedFormat, customRoleTitle,
    includeDefaultCgi, optimizationMethod, jobDescription, rfpFile,
    currentStep, customExperiences
  } = advancedState;

  const steps = ['Choose Format', 'Optimization', 'Add Experience', 'Upload Files'];

  if (isUploading || isCompleted) return null;

  const handleAddExperience = () => {
    const company = document.getElementById('new-company').value;
    const position = document.getElementById('new-position').value;
    const startDate = document.getElementById('new-start-date').value;
    const endDate = document.getElementById('new-end-date').value;
    const description = document.getElementById('new-description').value;
    
    if (company && position && startDate && endDate && description) {
      onStateChange(prev => ({
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
  };

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center'
      }}>
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
                    onStateChange(prev => ({
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
                value={customRoleTitle}
                onChange={(e) => onStateChange(prev => ({ ...prev, customRoleTitle: e.target.value }))}
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
                    onChange={(e) => onStateChange(prev => ({ ...prev, includeDefaultCgi: e.target.checked }))}
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
                    onStateChange(prev => ({
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
              
              {optimizationMethod === 'description' && (
                <Fade in={true}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Job Description"
                    value={jobDescription}
                    onChange={(e) => {
                      onStateChange(prev => ({
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
              
              {optimizationMethod === 'rfp' && (
                <Fade in={true}>
                  <UploadZone sx={{ mt: 2 }}>
                    <input
                      type="file"
                      id="rfp-upload"
                      hidden
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => {
                        onStateChange(prev => ({
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
                    {rfpFile && (
                      <Typography variant="body2" sx={{ mt: 1, color: cgiColors.primary }}>
                        Selected: {rfpFile.name}
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
              
              {customExperiences.map((exp, index) => (
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
                        onStateChange(prev => ({
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
                    onClick={handleAddExperience}
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
                      onStateChange(prev => ({
                        ...prev,
                        selectedFiles: Array.from(e.target.files),
                        currentStep: prev.currentStep < 3 ? 3 : prev.currentStep
                      }));
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
                  onClick={onUpload}
                  disabled={selectedFiles.length === 0}
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
  );
};

export default AdvancedMode;
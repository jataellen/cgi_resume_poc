import React from 'react';
import { Box, Typography, CardContent, Fade } from '@mui/material';
import { StyledCard, GradientButton, UploadZone, UploadIcon, cgiColors } from '../components/ui/StyledComponents';

const SimpleMode = ({ 
  simpleState,
  onUpload,
  error
}) => {
  const { selectedFile, isUploading, isCompleted } = simpleState;

  if (isUploading || isCompleted) return null;

  return (
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
                  onChange={onUpload} 
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
      </Box>
    </Fade>
  );
};

export default SimpleMode;
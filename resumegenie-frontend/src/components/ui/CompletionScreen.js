import React from 'react';
import { Box, Typography, CardContent, Fade } from '@mui/material';
import { StyledCard, CGIButton, GradientButton, SuccessIcon, cgiColors } from './StyledComponents';

const CompletionScreen = ({ 
  isCompleted, 
  onReset, 
  onViewResults,
  mode 
}) => {
  if (!isCompleted) return null;

  return (
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
                onClick={onReset}
              >
                Upload a new file
              </CGIButton>
              <GradientButton
                onClick={onViewResults}
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
  );
};

export default CompletionScreen;
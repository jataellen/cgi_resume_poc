import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress, CardContent, Fade } from '@mui/material';
import { StyledCard, CGIButton, cgiColors } from './StyledComponents';

const ProcessingStatus = ({ 
  isUploading, 
  progress, 
  logs, 
  mode, 
  onCancel 
}) => {
  if (!isUploading) return null;

  return (
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
              onClick={onCancel}
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
  );
};

export default ProcessingStatus;
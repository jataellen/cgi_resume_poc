import { styled } from '@mui/material/styles';
import { Card, Button, Box, ToggleButtonGroup, Stepper } from '@mui/material';

// CGI Theme Colors
export const cgiColors = {
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
export const StyledCard = styled(Card)(({ theme }) => ({
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

export const GradientButton = styled(Button)(({ theme }) => ({
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

export const CGIButton = styled(Button)(({ theme, variant }) => ({
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

export const UploadZone = styled(Box)(({ theme }) => ({
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

export const UploadIcon = styled(Box)(({ theme }) => ({
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

export const SuccessIcon = styled(Box)(({ theme }) => ({
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

export const StepperStyled = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: '#666666'
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: cgiColors.primary
  },
  '& .MuiStepConnector-line': {
    borderColor: cgiColors.lightGray
  },
  '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
    borderColor: '#666666'
  }
}));

export const CGIToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
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
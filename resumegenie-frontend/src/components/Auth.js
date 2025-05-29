import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, TextField, Paper, Typography, Alert, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

// CGI Theme Colors
const cgiColors = {
  primary: '#5236AB',
  secondary: '#E31937',
  white: '#FFFFFF',
  lightGray: '#F2F1F9',
  gradient: 'linear-gradient(135deg, #5236AB 0%, #A82465 60%, #E31937 100%)'
};

const StyledCard = styled(Card)(({ theme }) => ({
  background: cgiColors.white,
  borderRadius: '16px',
  boxShadow: '0 8px 40px rgba(82, 54, 171, 0.15)',
  border: `1px solid ${cgiColors.lightGray}`,
  overflow: 'hidden'
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

const GradientHeader = styled(Box)(({ theme }) => ({
  background: cgiColors.gradient,
  color: cgiColors.white,
  padding: '32px',
  textAlign: 'center'
}));

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}
    >
      <StyledCard sx={{ maxWidth: 450, width: '100%' }}>
        <GradientHeader>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1,color: cgiColors.white }}>
            ResumeGenie
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, color: cgiColors.white }}>
            Transform your resume with AI
          </Typography>
        </GradientHeader>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ color: cgiColors.primary, fontWeight: 600 }}>
            Sign In to Continue
          </Typography>
          
          <Typography variant="body2" align="center" sx={{ mb: 3, color: '#666' }}>
            Access your personalized resume processing dashboard
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&.Mui-focused fieldset': {
                    borderColor: cgiColors.primary,
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: cgiColors.primary
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&.Mui-focused fieldset': {
                    borderColor: cgiColors.primary,
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: cgiColors.primary
                }
              }}
            />
            
            {error && (
              <Alert 
                severity={error.includes('email') ? 'info' : 'error'} 
                sx={{ 
                  mb: 3,
                  borderRadius: '8px',
                  '& .MuiAlert-icon': {
                    color: error.includes('email') ? cgiColors.primary : cgiColors.secondary
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <GradientButton
              type="submit"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </GradientButton>
            
            <Typography variant="body2" align="center" sx={{ color: '#666', mt: 2 }}>
              Need access? Contact your administrator
            </Typography>
          </form>
        </CardContent>
      </StyledCard>
    </Box>
  );
}

export default Auth;
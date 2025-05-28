import React from 'react';
import { AppBar, Toolbar, Typography, Box, Divider, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from './assets/logo.png';
import { useAuth } from './contexts/AuthContext';

// CGI Theme Colors
const cgiColors = {
  primary: '#5236AB',
  secondary: '#E31937', 
  white: '#FFFFFF',
  lightGray: '#F2F1F9',
  gradient: 'linear-gradient(135deg, #5236AB 0%, #A82465 60%, #E31937 100%)'
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: cgiColors.white,
  color: cgiColors.primary,
  boxShadow: '0 2px 20px rgba(82, 54, 171, 0.1)',
  borderBottom: `1px solid ${cgiColors.lightGray}`,
  zIndex: theme.zIndex.drawer + 1
}));

const GradientTitle = styled(Typography)(({ theme }) => ({
  background: cgiColors.gradient,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  fontSize: '1.5rem',
  letterSpacing: '0.5px'
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: cgiColors.primary,
  opacity: 0.3,
  margin: '0 20px',
  height: '30px'
}));

const CGIButton = styled(Button)(({ theme }) => ({
  color: cgiColors.primary,
  borderRadius: '6px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: cgiColors.lightGray
  }
}));

function TopBar() {
  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={logo}
            alt="CGI Logo"
            sx={{
              height: '40px',
              width: 'auto',
              marginRight: '15px'
            }}
          />
          
          <StyledDivider orientation="vertical" flexItem />
          
          <GradientTitle variant="h6">
            RESUMEGENIE
          </GradientTitle>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: cgiColors.primary,
              fontWeight: 500
            }}
          >
            EN
          </Typography>
          <UserMenu />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  
  // If no user is authenticated, show Developer Mode
  if (!user) {
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          color: cgiColors.primary,
          fontWeight: 500,
          padding: '6px 12px',
          backgroundColor: cgiColors.lightGray,
          borderRadius: '6px'
        }}
      >
        Developer Mode
      </Typography>
    );
  }
  
  // If user is authenticated, show user email and sign out button
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: cgiColors.primary,
          fontWeight: 500
        }}
      >
        {user.email}
      </Typography>
      <CGIButton 
        size="small" 
        onClick={signOut}
      >
        Sign Out
      </CGIButton>
    </Box>
  );
}

export default TopBar;
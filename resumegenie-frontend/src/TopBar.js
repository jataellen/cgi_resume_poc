import React from 'react';
import { AppBar, Toolbar, Typography, Box, Divider, Button } from '@mui/material';
import topBarStyles from './styles/topBarStyles'; // Adjust path as necessary
import logo from './assets/logo.png';
import { useAuth } from './contexts/AuthContext';
function TopBar() {
  return (
    <AppBar position="fixed" elevation={2} sx={topBarStyles.appBar}>
      <Toolbar sx={topBarStyles.toolbar}>
        {/* Left Section */}
        <Box sx={topBarStyles.leftSection}>
        <Box
  component="img"
  src={logo}
  alt="CGI Logo"
  sx={topBarStyles.logoImage}
/>

          <Divider orientation="vertical" sx={topBarStyles.divider} />

          <Typography variant="body2" sx={topBarStyles.subtitle}>
            RESUMEGENIE
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={topBarStyles.rightSection}>
          <Typography variant="body2" sx={topBarStyles.rightText}>
            EN
          </Typography>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function UserMenu() {
  const { user, signOut, isSupabaseConfigured } = useAuth();
  
  if (!isSupabaseConfigured || !user) {
    return (
      <Typography variant="body2" sx={topBarStyles.rightText}>
        Developer Mode
      </Typography>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" sx={topBarStyles.rightText}>
        {user.email}
      </Typography>
      <Button 
        size="small" 
        onClick={signOut}
        sx={{ color: 'inherit', textTransform: 'none' }}
      >
        Sign Out
      </Button>
    </Box>
  );
}

export default TopBar;
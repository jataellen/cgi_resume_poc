import React from 'react';
import { AppBar, Toolbar, Typography, Box, Divider } from '@mui/material';
import topBarStyles from './styles/topBarStyles'; // Adjust path as necessary
import logo from './assets/logo.png';
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
          <Typography variant="body2" sx={topBarStyles.rightText}>
            Abhi Patel ▼
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Divider } from '@mui/material';

function TopBar() {
  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#E31937',
        boxShadow: '0px 2px 6px 2px #00000026',
        height: '64px',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: '64px' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* CGI Text */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '40px',
              color: '#E31937', 
              fontFamily: 'Source Sans Pro',
            }}
          >
            CGI
          </Typography>

          {/* Divider */}
          <Divider
            orientation="vertical"
            sx={{
              height: '18px',
              borderWidth: '1px',
              borderColor: '#A8A8A8',
              mx: 1,
            }}
          />

          {/* EXPERIENCE DESIGN SYSTEM Text */}
          <Typography
            variant="body2"
            sx={{
              fontSize: '16px',
              color: '#333333',
              fontFamily: 'Source Sans Pro',
              fontWeight: 400,
            }}
          >
            ResumeGenie
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#333333' }}>
            EN
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#333333' }}>
            Abhi Patel ▼
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;

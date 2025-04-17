import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const TopBar = () => (
  <AppBar
    position="fixed"
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      bgcolor: '#E31937', 
      boxShadow: 'none',
    }}
  >
    <Toolbar>
      <Typography
        variant="h4"
        noWrap
        component="div"
        sx={{
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: 'Source Sans Pro',
          fontSize: '38px',
        }}
      >
        CGI
      </Typography>
    </Toolbar>
  </AppBar>
);

export default TopBar;
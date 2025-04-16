import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const TopBar = () => (
  <AppBar
    position="fixed"
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      bgcolor: '#5236AB', // CGI red background
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
          color: '#FFFFFF', // White font
          fontFamily: 'Source Sans Pro',
          fontSize: '38px', // H1 scale
        }}
      >
        CGI
      </Typography>
    </Toolbar>
  </AppBar>
);

export default TopBar;
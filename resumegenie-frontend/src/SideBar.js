import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar } from '@mui/material';

const drawerWidth = 240;

const SideBar = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#F2F1F9' },
    }}
  >
    <Toolbar />
    <List>
      {['Home', 'Resumes', 'Settings'].map((text) => (
        <ListItem button key={text}>
          <ListItemText primary={text} sx={{ fontFamily: 'Source Sans Pro' }} />
        </ListItem>
      ))}
    </List>
  </Drawer>
);

export default SideBar;
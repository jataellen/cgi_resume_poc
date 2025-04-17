import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const navItems = [
  { text: 'Home', icon: <HomeIcon /> },
  { text: 'Resumes', icon: <DescriptionIcon /> },
  { text: 'Settings', icon: <SettingsIcon /> },
];

function SideBar() {
  const [selectedItem, setSelectedItem] = useState('Home');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#FFF0F0',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflowY: 'auto' ,
        overflowX: 'hidden',
      }}>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => setSelectedItem(item.text)}
              sx={{
                background:
                  selectedItem === item.text
                    ? 'linear-gradient(90deg, #E31937, #5236AB)'
                    : 'transparent',
                color: selectedItem === item.text ? 'white' : 'inherit',
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: 'linear-gradient(90deg, #E31937, #5236AB)',
                  color: 'white',
                },
              }}
            >
              <ListItemIcon sx={{ color: selectedItem === item.text ? 'white' : '#5236AB' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontFamily: 'Source Sans Pro' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SideBar;
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

const drawerWidth = 275;

const navItems = [
  { text: 'CGI’s template', icon: <HomeIcon /> },
  { text: 'Resumes', icon: <DescriptionIcon /> },
];

function SideBar() {
  const [selectedItem, setSelectedItem] = useState('CGI’s template');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#FFFFFF',
          boxShadow: '0px 2px 6px 2px #00000026',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <Box>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => setSelectedItem(item.text)}
              sx={{
                height: '64px',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '16px',
                paddingRight: '24px',
                backgroundColor: selectedItem === item.text ? '#E6E3F3' : '#FFFFFF',
                borderLeft: selectedItem === item.text ? '4px solid' : '4px solid transparent',
                borderImage: selectedItem === item.text
                  ? 'linear-gradient(180deg, #E31937 0%, #5236AB 100%) 1'
                  : 'none',
                color: selectedItem === item.text ? '#333333' : '#333333',
                '&:hover': {
                  backgroundColor: '#E6E3F3',
                  borderLeft: '4px solid',
                  borderImage: 'linear-gradient(180deg, #E31937 0%, #5236AB 100%) 1',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#5236AB',
                  minWidth: '40px', // fix icon alignment
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontFamily: 'Source Sans Pro',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#333333',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SideBar;
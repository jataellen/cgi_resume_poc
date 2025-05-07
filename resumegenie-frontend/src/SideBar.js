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
import sidebarStyles from './styles/sidebarStyles';

const navItems = [
  { text: 'CGI’s template', icon: <HomeIcon /> },
  { text: 'Resumes', icon: <DescriptionIcon /> },
];

function SideBar() {
  const [selectedItem, setSelectedItem] = useState('CGI’s template');

  return (
    <Drawer
      variant="permanent"
      sx={sidebarStyles.drawer}
    >
      <Toolbar />
      <Box>
        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => setSelectedItem(item.text)}
              sx={
                selectedItem === item.text
                  ? sidebarStyles.activeListItem
                  : sidebarStyles.listItem
              }
            >
              <ListItemIcon sx={sidebarStyles.listItemIcon}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
  primary={item.text}
  primaryTypographyProps={{
    ...sidebarStyles.listItemText,
    component: 'h3',
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

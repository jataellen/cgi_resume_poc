import React, { useState, useEffect } from 'react';
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
import TableChartIcon from '@mui/icons-material/TableChart';
import sidebarStyles from './styles/sidebarStyles';

const navItems = [
  { text: 'Simple Mode', icon: <HomeIcon /> },
  { text: 'Advanced Mode', icon: <DescriptionIcon /> },
  { text: 'Results', icon: <TableChartIcon /> },
];

function SideBar({ selectedMode, onModeChange }) {
  const [selectedItem, setSelectedItem] = useState(selectedMode);

  useEffect(() => {
    setSelectedItem(selectedMode);
  }, [selectedMode]);

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
              onClick={() => {
                setSelectedItem(item.text);
                onModeChange(item.text);
              }}
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
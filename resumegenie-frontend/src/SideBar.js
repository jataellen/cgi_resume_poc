import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Box,
  Typography,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import BugReportIcon from '@mui/icons-material/BugReport';

// CGI Theme Colors
const cgiColors = {
  primary: '#5236AB',
  secondary: '#E31937',
  success: '#1AB977',
  white: '#FFFFFF',
  lightGray: '#F2F1F9',
  darkGray: '#333333',
  gradient: 'linear-gradient(135deg, #5236AB 0%, #A82465 60%, #E31937 100%)'
};

const drawerWidth = 320; // Increased from 280

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: cgiColors.white,
    borderRight: `1px solid ${cgiColors.lightGray}`,
    boxShadow: '2px 0 10px rgba(82, 54, 171, 0.08)'
  }
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  margin: '6px 16px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  padding: '12px 16px',
  '&:hover': {
    backgroundColor: cgiColors.lightGray,
    transform: 'translateX(4px)'
  },
  ...(selected && {
    background: cgiColors.gradient,
    color: cgiColors.white,
    boxShadow: '0 4px 15px rgba(82, 54, 171, 0.3)',
    '&:hover': {
      background: cgiColors.gradient,
      transform: 'translateX(4px)'
    },
    '& .MuiListItemIcon-root': {
      color: cgiColors.white
    },
    '& .MuiListItemText-primary': {
      color: cgiColors.white,
      fontWeight: 600
    },
    '& .MuiListItemText-secondary': {
      color: 'rgba(255,255,255,0.8)'
    }
  })
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: cgiColors.primary,
  minWidth: '44px'
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    fontSize: '15px',
    color: cgiColors.darkGray
  },
  '& .MuiListItemText-secondary': {
    fontSize: '12px',
    color: cgiColors.darkGray,
    opacity: 0.8
  }
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  color: cgiColors.primary,
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  margin: '24px 20px 12px',
  opacity: 0.8
}));

const navItems = [
  { 
    text: 'Simple Mode', 
    icon: <HomeIcon />,
    description: 'Quick single file processing'
  },
  { 
    text: 'Advanced Mode', 
    icon: <DescriptionIcon />,
    description: 'Multi-file with customization'
  },
  { 
    text: 'Results', 
    icon: <TableChartIcon />,
    description: 'View processed files'
  },
];

function SideBar({ selectedMode, onModeChange }) {
  const [selectedItem, setSelectedItem] = useState(selectedMode);

  useEffect(() => {
    setSelectedItem(selectedMode);
  }, [selectedMode]);

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <SectionHeader>
          Processing Modes
        </SectionHeader>
        
        <List>
          {navItems.map((item) => (
            <StyledListItem
              key={item.text}
              onClick={() => {
                setSelectedItem(item.text);
                onModeChange(item.text);
              }}
              selected={selectedItem === item.text}
            >
              <StyledListItemIcon>
                {item.icon}
              </StyledListItemIcon>
              
              <Box sx={{ flex: 1 }}>
                <StyledListItemText
                  primary={item.text}
                  secondary={item.description}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: selectedItem === item.text ? cgiColors.white : 'inherit',
                      fontWeight: selectedItem === item.text ? 600 : 500
                    },
                    '& .MuiListItemText-secondary': {
                      color: selectedItem === item.text ? 'rgba(255,255,255,0.8)' : 'inherit'
                    }
                  }}
                />
              </Box>
            </StyledListItem>
          ))}
        </List>

        <Box sx={{ mt: 4, mx: 2 }}>
          <Box sx={{
            background: cgiColors.lightGray,
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            border: `1px solid ${cgiColors.primary}20`
          }}>
            <Typography variant="body2" sx={{ 
              color: cgiColors.primary, 
              fontWeight: 600,
              mb: 2 
            }}>
              Help us improve!
            </Typography>
            <Button
              variant="outlined"
              startIcon={<BugReportIcon />}
              onClick={() => window.open('https://forms.office.com/Pages/DesignPageV2.aspx?origin=NeoPortalPage&subpage=design&id=jMb-uS3JHkaalz0DoPGLggNy9r1fPYlKr5k30PYAjzFUMURDVkxBT1c3NE1MMzVQS0tFQkM4SzY4OS4u&analysis=false', '_blank')}
              sx={{
                borderColor: cgiColors.primary,
                color: cgiColors.primary,
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                '&:hover': {
                  borderColor: cgiColors.primary,
                  backgroundColor: `${cgiColors.primary}10`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Report bugs and issues
            </Button>
          </Box>
        </Box>
      </Box>
    </StyledDrawer>
  );
}

export default SideBar;
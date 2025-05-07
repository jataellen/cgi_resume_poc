const drawerWidth = 275;

const sidebarStyles = {
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: drawerWidth,
      boxSizing: 'border-box',
      bgcolor: '#FFFFFF',
      boxShadow: '0px 2px 6px 2px #00000026',
      borderRight: 'none',
    },
  },
  listItem: {
    height: '64px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '16px',
    paddingRight: '24px',
    backgroundColor: '#FFFFFF',
    borderLeft: '4px solid transparent',
    color: '#333333',
    '&:hover': {
      backgroundColor: '#E6E3F3',
      borderLeft: '4px solid',
      borderImage: 'linear-gradient(180deg, #E31937 0%, #5236AB 100%) 1',
    },
  },
  activeListItem: {
    height: '64px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '16px',
    paddingRight: '24px',
    backgroundColor: '#E6E3F3',
    borderLeft: '4px solid',
    borderImage: 'linear-gradient(180deg, #E31937 0%, #5236AB 100%) 1',
    color: '#333333',
  },
  listItemIcon: {
    color: '#5236AB',
    minWidth: '40px',
  },
  listItemText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333333',
    
  },
};

export default sidebarStyles;
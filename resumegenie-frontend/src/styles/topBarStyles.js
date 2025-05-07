const topBarStyles = {
    appBar: {
      backgroundColor: '#FFFFFF',
      color: '#E31937',
      boxShadow: '0px 2px 6px 2px #00000026',
      height: '64px',
      justifyContent: 'center',
      zIndex: (theme) => theme.zIndex.drawer + 1,
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      height: '64px',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    logoText: {
      fontWeight: 700,
      fontSize: '40px',
      color: '#E31937',
      fontFamily: 'Source Sans Pro',
    },
    divider: {
      height: '18px',
      borderWidth: '1px',
      borderColor: '#A8A8A8',
      mx: 1,
    },
    subtitle: {
      fontSize: '20px',
      color: '#333333',
      fontWeight: 400,

    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    rightText: {
      fontSize: '14px',
      color: '#333333',
    },
    logoImage: {
      height: '40px', 
      width: 'auto',
    },
   
  };
  
  export default topBarStyles;
const uploadProgressStyles = {
    uploadingCard: {
      width: '601px',
      padding: '32px 24px',
      border: '1px solid #5236AB',
      borderTop: '5px solid #5236AB',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
    },
    progressCircle: {
      color: '#5236AB',
    },
    uploadingText: {
      fontSize: '16px',
      color: '#333333',
    },
    cancelButton: {
      variant: 'text',
      sx: {
        fontSize: '14px',
        fontWeight: 500,
        padding: '12px 16px',
        color: '#5236AB',
        textTransform: 'none',
      },
    },
    logsCard: {
        width: '601px',
        height: '307px',
        backgroundColor: '#F6F8F9',
        display: 'flex',
        flexDirection: 'column',
        padding: '0px',
        boxShadow: 'none',
      },
    
      logsTitle: {
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '100%',
        color: '#333333',
        height: '40px',
        padding: '16px 16px 0 16px',
      },
    
      logsInnerBox: {
        flex: 1,
        backgroundColor: '#F2F4F7',
        borderRadius: '0px',
        padding: '16px',
        marginTop: '8px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      },
    
      logItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#333333',
      },
      
      successIcon: {
        fontSize: '64px',
        color: '#28a745',
      },
      
      
  };
  
  export default uploadProgressStyles;
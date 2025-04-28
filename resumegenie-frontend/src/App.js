import React, { useState } from 'react';
import { CssBaseline, Box, Typography, Button, Stack, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TopBar from './TopBar';
import SideBar from './SideBar';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = (e) => {
    setSelectedFile(e.target.files[0]);
    console.log('Uploaded:', e.target.files[0]);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F6F8F9' }}>
      <CssBaseline />
      <TopBar />
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 6,
          mt: 8,
          width: 'calc(100% - 275px)',
          bgcolor: '#F6F8F9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Heading */}
        <Typography variant="h2" sx={{ fontWeight: 600, color: '#333333', mb: 1 }}>
          Welcome to ResumeGenie
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '16px', color: '#333333', mb: 4 }}>
          Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file and let AI help craft the CGI’s template resume.
        </Typography>

        {/* Upload Card */}
        <Paper
          elevation={0}
          sx={{
            width: '601px',
            height: '266px',
            padding: '32px 24px',
            borderTop: '5px solid #5236AB',
            borderRight: '1px solid #5236AB',
            borderBottom: '1px solid #5236AB',
            borderLeft: '1px solid #5236AB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          {/* Upload Icon */}
          <Box
            sx={{
              fontSize: '64px',
              background: 'linear-gradient(180deg, #E31937 0%, #5236AB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
              file_upload
            </span>
          </Box>

          {/* Upload Text */}
          <Typography variant="body1" sx={{ fontSize: '16px', color: '#333333', fontWeight: 400 }}>
            Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file
          </Typography>

          {/* Upload Button */}
          <Button
            component="label"
            variant="contained"
            color="primary"
            sx={{
              width: '200px',
              height: '48px',
              backgroundColor: '#5236AB',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#3A2679',
              },
            }}
          >
            Upload file
            <input type="file" hidden onChange={handleUpload} />
          </Button>

          {/* Uploaded file name (optional) */}
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1, fontSize: '14px', color: '#333333' }}>
              Uploaded: {selectedFile.name}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
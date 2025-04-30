import React, { useState } from 'react';
import { CssBaseline, Box, Typography, Button, Stack, Paper } from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';
import appStyles from './styles/appStyles'; 

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = (e) => {
    setSelectedFile(e.target.files[0]);
    console.log('Uploaded:', e.target.files[0]);
  };

  return (
    <Box sx={appStyles.rootBox}>
      <CssBaseline />
      <TopBar />
      <SideBar />
      <Box component="main" sx={appStyles.mainBox}>
        <Typography variant="h2" sx={appStyles.heading}>
          Welcome to ResumeGenie
        </Typography>
        <Typography variant="body2" sx={appStyles.subText}>
          Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file and let AI help craft the CGI’s template resume.
        </Typography>

        <Paper elevation={0} sx={appStyles.uploadCard}>
          <Box sx={appStyles.uploadIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
              file_upload
            </span>
          </Box>

          <Typography variant="body1" sx={appStyles.uploadText}>
            Upload a <strong>PDF</strong> or <strong>DOCX</strong> resume file
          </Typography>

          <Button component="label" variant="contained" color="primary" sx={appStyles.uploadButton}>
            Upload file
            <input type="file" hidden onChange={handleUpload} />
          </Button>

          {selectedFile && (
            <Typography variant="body2" sx={appStyles.uploadedFileName}>
              Uploaded: {selectedFile.name}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
import React, { useState } from 'react';
import {
  CssBaseline,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
} from '@mui/material';
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar />
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h2" color="primary.main" gutterBottom>
          Welcome to ResumeGenie
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
          Upload your resume and let AI help craft the perfect professional summary.
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #E31937',
            borderRadius: 3,
            backgroundColor: '#F2F1F9',
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h6">Please upload your resume here</Typography>
            <Button
              component="label"
              variant="contained"
              color="primary"
              sx={{ fontWeight: 'bold', textTransform: 'none' }}
            >
              Upload File
              <input type="file" hidden onChange={handleUpload} />
            </Button>
            {selectedFile && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                Uploaded: {selectedFile.name}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
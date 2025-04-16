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
    // You can add your backend upload logic here
    console.log('Uploaded:', e.target.files[0]);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar />
      <SideBar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        <Typography variant="h2" color="primary.main" gutterBottom>
          Welcome to ResumeGenie
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Upload your resume and let AI help craft the perfect professional summary.
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed #9E83F5',
            borderRadius: 3,
            backgroundColor: '#F2F1F9',
            maxWidth: 600,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <UploadFileIcon sx={{ fontSize: 60, color: '#5236AB' }} />
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
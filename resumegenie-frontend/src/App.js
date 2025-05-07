import React, { useState } from 'react';
import {
  CssBaseline, Box, Typography, Button, Paper, CircularProgress
} from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';
import appStyles from './styles/appStyles';
import uploadProgressStyles from './styles/uploadProgressStyles';
import uploadCompletedStyles from './styles/uploadCompletedStyles';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState(["Uploading file..."]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploading(true);
      setIsCompleted(false);
      setLogs(["Uploading file..."]);

      setTimeout(() => {
        setLogs(prev => [...prev, "Crafting resume..."]);
        setTimeout(() => {
          setLogs(prev => [...prev, "Resume ready!"]);
          setIsUploading(false);
          setIsCompleted(true);
        }, 2000);
      }, 2000);
    }
  };

  const handleCancel = () => {
    setIsUploading(false);
    setLogs([]);
    setSelectedFile(null);
  };

  const handleReset = () => {
    setIsCompleted(false);
    setSelectedFile(null);
    setLogs([]);
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

        {!isUploading && !isCompleted && (
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
        )}

        {isUploading && (
          <>
            <Paper elevation={0} sx={uploadProgressStyles.uploadingCard}>
              <CircularProgress sx={uploadProgressStyles.progressCircle} />
              <Typography sx={uploadProgressStyles.uploadingText}>
                Uploading resume file…
              </Typography>
              <Button onClick={handleCancel} {...uploadProgressStyles.cancelButton}>
                Cancel
              </Button>
            </Paper>

            <Paper elevation={0} sx={uploadProgressStyles.logsCard}>
              <Typography sx={uploadProgressStyles.logsTitle}>Logs of uploaded file</Typography>
              <Box sx={uploadProgressStyles.logsInnerBox}>
                {logs.map((log, idx) => (
                  <Box key={idx} sx={uploadProgressStyles.logItem}>
                    <CircularProgress size={16} sx={{ color: '#5236AB' }} />
                    <span>{log}</span>
                  </Box>
                ))}
              </Box>
            </Paper>
          </>
        )}

        {isCompleted && (
          <>
            <Paper elevation={0} sx={uploadProgressStyles.uploadingCard}>
              <Box sx={uploadCompletedStyles.successIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px' }}>
                  check_circle
                </span>
              </Box>
              <Typography sx={uploadCompletedStyles.successText}>
                Your resume is processed successfully!
              </Typography>
              <Box sx={uploadCompletedStyles.buttonRow}>
                <Button
                  variant="text"
                  sx={uploadCompletedStyles.uploadNewButton}
                  onClick={handleReset}
                >
                  Upload a new file
                </Button>

                <Button
                  variant="contained"
                  sx={uploadCompletedStyles.downloadButton}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    download
                  </span>
                  Download crafted file
                </Button>
              </Box>
            </Paper>

            <Paper elevation={0} sx={uploadProgressStyles.logsCard}>
              <Typography sx={uploadProgressStyles.logsTitle}>Logs of uploaded file</Typography>
              <Box sx={uploadProgressStyles.logsInnerBox}>
                {logs.map((log, idx) => (
                  <Box key={idx} sx={uploadProgressStyles.logItem}>
                    <CircularProgress size={16} sx={{ color: '#5236AB' }} />
                    <span>{log}</span>
                  </Box>
                ))}
                <Box sx={uploadProgressStyles.logItem}>
                  <CircularProgress size={16} sx={{ color: '#5236AB' }} />
                  <span>File is ready to download.</span>
                </Box>
              </Box>
            </Paper>
          </>
        )}

      </Box>
    </Box>
  );
}

export default App;

import React from 'react';
import { 
  Box, Typography, CardContent, Fade, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { StyledCard, cgiColors } from '../components/ui/StyledComponents';
import apiService from '../services/apiService';

const Results = ({ processedFiles, setError }) => {
  const handleDownloadAll = async () => {
    try {
      for (const file of processedFiles) {
        if (file.downloadUrl && file.status === 'completed') {
          const blob = await apiService.downloadResume(file.id);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name.replace(/\.(pdf|docx?)$/i, '_updated.docx');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          // Add delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      setError('Failed to download files');
    }
  };

  const handleDownloadAllEvaluations = async () => {
    try {
      for (const file of processedFiles) {
        if (file.status === 'completed') {
          try {
            const blob = await apiService.downloadEvaluation(file.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace(/\.(pdf|docx?)$/i, '_evaluation.pdf');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            // Add delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.warn(`Failed to download evaluation for ${file.name}:`, err);
          }
        }
      }
    } catch (err) {
      setError('Failed to download evaluations');
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const blob = await apiService.downloadResume(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(pdf|docx?)$/i, '_updated.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleDownloadEvaluation = async (file) => {
    try {
      const blob = await apiService.downloadEvaluation(file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(pdf|docx?)$/i, '_evaluation.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download evaluation');
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1200px'
      }}>
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: cgiColors.primary, fontWeight: 600 }}>
                Processed Files
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {processedFiles.length > 0 && (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleDownloadAll}
                      sx={{
                        background: cgiColors.gradient,
                        color: cgiColors.white,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          background: cgiColors.gradient,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Download All Resumes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleDownloadAllEvaluations}
                      sx={{
                        borderColor: cgiColors.secondary,
                        color: cgiColors.secondary,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: cgiColors.lightGray,
                          borderColor: cgiColors.secondary
                        }
                      }}
                      startIcon={<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>assessment</span>}
                    >
                      Download All Evaluations
                    </Button>
                  </>
                )}
              </Box>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Upload Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Processed At</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>Evaluation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No files processed yet. Upload files in Simple or Advanced mode to see them here.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedFiles.map((file) => (
                      <TableRow key={`${file.id}-${file.processedAt}`}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={file.uploadType || 'Simple'} 
                            color={file.uploadType === 'Advanced' ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={file.status} 
                            color={file.status === 'completed' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(file.processedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          {file.downloadUrl && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDownloadFile(file)}
                              sx={{ mr: 1 }}
                            >
                              Download
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {file.status === 'completed' && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => handleDownloadEvaluation(file)}
                              startIcon={<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>assessment</span>}
                            >
                              Evaluation
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Box>
    </Fade>
  );
};

export default Results;
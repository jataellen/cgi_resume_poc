import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, TextField, Paper, Typography, Alert } from '@mui/material';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Resume Genie
        </Typography>
        
        <Typography variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          
          {error && (
            <Alert severity={error.includes('email') ? 'info' : 'error'} sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Auth;
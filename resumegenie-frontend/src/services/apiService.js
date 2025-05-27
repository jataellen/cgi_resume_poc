const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Import auth context
import { useAuth } from '../contexts/AuthContext';

// Store auth instance
let authInstance = null;

export const setAuthInstance = (auth) => {
  authInstance = auth;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  if (authInstance && authInstance.getAuthToken) {
    const token = authInstance.getAuthToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
  }
  return {};
};

class ApiService {
  /**
   * Upload a resume file
   * @param {File} file - The file to upload
   * @returns {Promise<{sessionId: string, message: string, filename: string}>}
   */
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        sessionId: data.session_id,
        message: data.message,
        filename: data.filename,
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running on port 8000.');
      }
      throw error;
    }
  }

  /**
   * Get processing status
   * @param {string} sessionId - The session ID
   * @returns {Promise<{status: string, logs: string[], progress: number, downloadUrl: string|null, error: string|null}>}
   */
  async getStatus(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${sessionId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to get status' }));
        throw new Error(error.detail || `Status check failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        logs: data.logs || [],
        progress: data.progress || 0,
        downloadUrl: data.download_url,
        error: data.error,
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  /**
   * Download processed resume
   * @param {string} sessionId - The session ID
   * @returns {Promise<Blob>}
   */
  async downloadResume(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download/${sessionId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Download failed' }));
        throw new Error(error.detail || `Download failed with status ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  /**
   * Clean up session
   * @param {string} sessionId - The session ID
   * @returns {Promise<void>}
   */
  async cleanupSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Cleanup failed' }));
        throw new Error(error.detail || `Cleanup failed with status ${response.status}`);
      }
    } catch (error) {
      // Don't throw errors for cleanup failures - just log them
      console.warn('Session cleanup failed:', error.message);
    }
  }

  /**
   * Check API health
   * @returns {Promise<{status: string, timestamp: string, activeSessions: number}>}
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`API health check failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        timestamp: data.timestamp,
        activeSessions: data.active_sessions,
      };
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
  }

  /**
   * Test the connection to the backend
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}

const apiService = new ApiService();
export default apiService;
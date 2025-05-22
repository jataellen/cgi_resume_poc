const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  /**
   * Upload a resume file
   * @param {File} file - The file to upload
   * @returns {Promise<{sessionId: string, message: string, filename: string}>}
   */
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();
    return {
      sessionId: data.session_id,
      message: data.message,
      filename: data.filename,
    };
  }

  /**
   * Get processing status
   * @param {string} sessionId - The session ID
   * @returns {Promise<{status: string, logs: string[], progress: number, downloadUrl: string|null, error: string|null}>}
   */
  async getStatus(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/status/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get status');
    }

    const data = await response.json();
    return {
      status: data.status,
      logs: data.logs,
      progress: data.progress,
      downloadUrl: data.download_url,
      error: data.error,
    };
  }

  /**
   * Download processed resume
   * @param {string} sessionId - The session ID
   * @returns {Promise<Blob>}
   */
  async downloadResume(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/download/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Download failed');
    }

    return response.blob();
  }

  /**
   * Clean up session
   * @param {string} sessionId - The session ID
   * @returns {Promise<void>}
   */
  async cleanupSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Cleanup failed');
    }
  }

  /**
   * Check API health
   * @returns {Promise<{status: string, timestamp: string, activeSessions: number}>}
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
      throw new Error('API is not healthy');
    }

    const data = await response.json();
    return {
      status: data.status,
      timestamp: data.timestamp,
      activeSessions: data.active_sessions,
    };
  }
}

export default new ApiService();
import axios from 'axios';

// Replace with your actual base URL
const BASE_URL = 'https://test-mobile-backend.seren.guru'; 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (data: any) => {
    const response = await api.post('/login', data);
    return response.data;
  },
  verifyLoginOtp: async (data: any) => {
    const response = await api.post('/verify-login-otp', data);
    return response.data;
  },
  signup: async (data: any) => {
    const response = await api.post('/signup', data);
    return response.data;
  },
  verifySignupOtp: async (data: any) => {
    const response = await api.post('/verify-signup-otp', data);
    return response.data;
  },
  getMe: async (token: string) => {
    const response = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export const documentService = {
  uploadDocument: async (fileUri: string, token: string) => {
    const formData = new FormData();
    const uriParts = fileUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // @ts-ignore
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Defaulting to docx as per example
    });

    const response = await api.post('/process_document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getDocumentBatches: async (documentId: string, token: string) => {
    const response = await api.get(`/documents/${documentId}/batches_content`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getAudioFromText: async (text: string, speaker: string = 'Charlotte', token: string) => {
    const response = await api.post('/audio/text', {
      text,
      language: 'English',
      speaker
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getVoices: async (token: string) => {
    const response = await api.get('/audio/voices', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};


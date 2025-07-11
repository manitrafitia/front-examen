import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.API_URL, 
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else {
      console.error('API Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  // Élèves
  getEleves: (skip: number = 0, limit: number = API_CONFIG.defaultLimit) => 
    api.get('/eleves/', { params: { skip, limit } }),
  getEleve: (id: number) => api.get(`/eleves/${id}`),
  createEleve: (data: any) => api.post('/eleves/', data),
  updateEleve: (id: number, data: any) => api.put(`/eleves/${id}`, data),
  deleteEleve: (id: number) => api.delete(`/eleves/${id}`),

  // Matières
  getMatieres: (skip: number = 0, limit: number = API_CONFIG.defaultLimit) =>
    api.get('/matieres/', { params: { skip, limit } }),
  getMatiere: (id: number) => api.get(`/matieres/${id}`),
  createMatiere: (data: any) => api.post('/matieres/', data),
  updateMatiere: (id: number, data: any) => api.put(`/matieres/${id}`, data),
  deleteMatiere: (id: number) => api.delete(`/matieres/${id}`),

  // Examens
  getExamens: (skip: number = 0, limit: number = API_CONFIG.defaultLimit) =>
    api.get('/examens/', { params: { skip, limit } }),
  getExamen: (id: number) => api.get(`/examens/${id}`),
  createExamen: (data: any) => api.post('/examens/', data),
  updateExamen: (id: number, data: any) => api.put(`/examens/${id}`, data),
  deleteExamen: (id: number) => api.delete(`/examens/${id}`),

  // Notes
  getNotes: (skip: number = 0, limit: number = API_CONFIG.defaultLimit) =>
    api.get('/notes/', { params: { skip, limit } }),
  getNote: (id: number) => api.get(`/notes/${id}`),
  createNote: (data: any) => api.post('/notes/', data),
  updateNote: (id: number, data: any) => api.put(`/notes/${id}`, data),
  deleteNote: (id: number) => api.delete(`/notes/${id}`),
};
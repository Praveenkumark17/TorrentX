import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL+'/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// Torrent API calls
export const addTorrentApi = async (magnetURI, savePath) => {
  const response = await api.post('/torrent/add', { magnetURI, savePath });
  return response.data;
};

export const getTorrentsApi = async () => {
  const response = await api.get('/torrent/all');
  return response.data;
};

export default api;

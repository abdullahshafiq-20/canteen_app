import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: 'https://my-sql-backend.vercel.app/ap',
  // baseURL: 'http://localhost:5000/api', // Replace with your API URL
});

api.interceptors.request.use(
  (config) => { 
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
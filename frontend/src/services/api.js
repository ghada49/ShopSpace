import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const listingsAPI = {
  getAll: () => api.get('/listings'),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.patch(`/listings/${id}`, data),
  getHostListings: () => api.get('/listings/host/me'),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getBrandBookings: () => api.get('/bookings/brand/me'),
  getHostBookings: () => api.get('/bookings/host/me'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export default api;

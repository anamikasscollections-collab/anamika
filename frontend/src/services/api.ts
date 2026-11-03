import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach customer token and guest session ID to requests
api.interceptors.request.use((config) => {
  const customerToken = localStorage.getItem('anamika_customer_token');
  const adminToken = localStorage.getItem('anamika_admin_token');

  // If path is under /admin, attach adminToken
  if (config.url?.startsWith('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }

  // Ensure persistent guest session ID
  let guestId = localStorage.getItem('anamika_guest_session_id');
  if (!guestId) {
    guestId = 'gst-' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('anamika_guest_session_id', guestId);
  }
  config.headers['x-guest-session-id'] = guestId;

  return config;
});

// Global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 unauthorized on admin endpoint, clear admin token
    if (error.response?.status === 401 && error.config?.url?.startsWith('/admin')) {
      localStorage.removeItem('anamika_admin_token');
      localStorage.removeItem('anamika_admin_user');
    }
    return Promise.reject(error);
  }
);


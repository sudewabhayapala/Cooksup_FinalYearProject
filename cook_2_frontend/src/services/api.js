import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chef API
export const chefAPI = {
  searchChefs: (params) => api.get('/chefs/search', { params }),
  getChefProfile: (chefId) => api.get(`/chefs/profile/${chefId}`),
  updateProfile: (data) => api.put('/chefs/profile', data),
  addPhoto: (photoData) => api.post('/chefs/photo', photoData),
  getDashboardStats: () => api.get('/chefs/dashboard/stats')
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, status) => api.put(`/bookings/${bookingId}/status`, { status }),
  payBooking: (bookingId) => api.put(`/bookings/${bookingId}/pay`),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`)
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getChefReviews: (chefId) => api.get(`/reviews/chef/${chefId}`),
  getRatingSummary: (chefId) => api.get(`/reviews/summary/${chefId}`),
  getBookingReview: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  getRecentReviews: (limit = 6) => api.get('/reviews/recent', { params: { limit } }),
  getPointsHistory: (chefId) => api.get(`/reviews/points-history/${chefId}`)
};

export default api;

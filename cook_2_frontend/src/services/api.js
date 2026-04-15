import axios from 'axios';

// API service layer for frontend requests.
// This file centralizes all backend routes used by the UI.
// It also attaches the stored JWT token to every request automatically.
const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL
});

// Request interceptor to add authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chef API endpoints
export const chefAPI = {
  // Search chefs with filters
  searchChefs: (params) => api.get('/chefs/search', { params }),
  // Get specific chef profile
  getChefProfile: (chefId) => api.get(`/chefs/profile/${chefId}`),
  // Update chef profile
  updateProfile: (data) => api.put('/chefs/profile', data),
  // Upload chef photo
  addPhoto: (photoData) => api.post('/chefs/photo', photoData),
  // Get chef dashboard stats
  getDashboardStats: () => api.get('/chefs/dashboard/stats')
};

// Booking API endpoints
export const bookingAPI = {
  // Create a new booking
  createBooking: (data) => api.post('/bookings', data),
  // Get user's bookings
  getMyBookings: () => api.get('/bookings/my-bookings'),
  // Get specific booking details
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  // Update booking status (chef only)
  updateBookingStatus: (bookingId, status) => api.put(`/bookings/${bookingId}/status`, { status }),
  // Pay for booking (customer only)
  payBooking: (bookingId) => api.put(`/bookings/${bookingId}/pay`),
  // Cancel booking
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`)
};

// Review API endpoints
export const reviewAPI = {
  // Create a review
  createReview: (data) => api.post('/reviews', data),
  // Get reviews for a chef
  getChefReviews: (chefId) => api.get(`/reviews/chef/${chefId}`),
  // Get rating summary for a chef
  getRatingSummary: (chefId) => api.get(`/reviews/summary/${chefId}`),
  // Get review for a specific booking
  getBookingReview: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  // Get recent reviews
  getRecentReviews: (limit = 6) => api.get('/reviews/recent', { params: { limit } }),
  // Get points history for a chef
  getPointsHistory: (chefId) => api.get(`/reviews/points-history/${chefId}`)
};

export default api;

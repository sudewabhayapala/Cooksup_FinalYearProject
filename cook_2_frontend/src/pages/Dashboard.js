import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, chefAPI, reviewAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const userType = user?.userType || user?.user_type;

  if (userType === 'chef') {
    return <ChefDashboard />;
  }

  if (userType === 'customer') {
    return <ClientDashboard />;
  }

  return <div>Loading dashboard...</div>;
};

const ChefDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        chefAPI.getDashboardStats(),
        bookingAPI.getMyBookings()
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setDetailsLoading(true);
    setActionMessage('');
    setActionError('');

    try {
      const response = await bookingAPI.getBookingDetails(bookingId);
      setSelectedBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setActionError(error.response?.data?.error || 'Failed to load booking details');
      setSelectedBooking(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBookingAction = async (status) => {
    if (!selectedBookingId) return;

    setActionLoading(true);
    setActionMessage('');
    setActionError('');

    try {
      await bookingAPI.updateBookingStatus(selectedBookingId, status);
      setActionMessage(status === 'confirmed' ? 'Booking accepted successfully' : 'Booking declined successfully');

      setBookings((prev) => prev.map((booking) => (
        booking.id === selectedBookingId ? { ...booking, status } : booking
      )));

      setSelectedBooking((prev) => (prev ? { ...prev, status } : prev));
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setActionError(error.response?.data?.error || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-banner">
        <div className="banner-content">
          <p className="banner-greeting">Chef Dashboard</p>
          <h1 className="banner-title">Welcome back, {user?.firstName || user?.first_name || 'Chef'} 👋</h1>
          <p className="banner-sub">Manage your bookings and track your performance</p>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">⭐</div>
            <div className="stat-info">
              <span className="stat-label">Rating</span>
              <span className="stat-value">{stats?.rating?.toFixed(1) || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">🏆</div>
            <div className="stat-info">
              <span className="stat-label">Points</span>
              <span className="stat-value">{stats?.total_points || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">📅</div>
            <div className="stat-info">
              <span className="stat-label">Pending Bookings</span>
              <span className="stat-value">{stats?.pendingBookings || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">✅</div>
            <div className="stat-info">
              <span className="stat-label">Completed This Month</span>
              <span className="stat-value">{stats?.completedThisMonth || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">📊</div>
            <div className="stat-info">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value">{stats?.total_bookings || 0}</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Your Bookings</h2>
          </div>
          <div className="section-body">
            {bookings.length === 0 ? (
              <p className="no-data">No bookings yet — new requests will appear here</p>
            ) : (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Event Date</th>
                      <th>Location</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>{booking.customer_first_name} {booking.customer_last_name}</td>
                        <td>{new Date(booking.event_date).toLocaleDateString()}</td>
                        <td>{booking.event_location}</td>
                        <td>{booking.guest_count}</td>
                        <td><span className={`status ${booking.status}`}>{booking.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="action-link-btn"
                            onClick={() => handleViewBooking(booking.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailsLoading && <p className="details-loading">Loading booking details...</p>}
            {actionError && <p className="details-error">{actionError}</p>}

            {!detailsLoading && selectedBooking && (
              <div className="booking-details-panel">
                <h3>Client Details</h3>

            <div className="details-grid">
              <p><strong>Client Name:</strong> {selectedBooking.customer_first_name} {selectedBooking.customer_last_name}</p>
              <p><strong>Client Email:</strong> {selectedBooking.customer_email}</p>
              <p><strong>Event Date:</strong> {new Date(selectedBooking.event_date).toLocaleDateString()}</p>
              <p><strong>Event Time:</strong> {selectedBooking.event_time}</p>
              <p><strong>Event Type:</strong> {selectedBooking.event_type || 'Not specified'}</p>
              <p><strong>Location:</strong> {selectedBooking.event_location}</p>
              <p><strong>Guests:</strong> {selectedBooking.guest_count}</p>
              <p><strong>Budget:</strong> ${selectedBooking.total_price}</p>
              <p><strong>Status:</strong> <span className={`status ${selectedBooking.status}`}>{selectedBooking.status}</span></p>
              <p><strong>Special Requests:</strong> {selectedBooking.special_requests || 'None'}</p>
            </div>

            {actionMessage && <p className="details-success">{actionMessage}</p>}

            {selectedBooking.status === 'pending' && (
              <div className="details-actions">
                <button
                  type="button"
                  className="accept-btn"
                  onClick={() => handleBookingAction('confirmed')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Accept Booking'}
                </button>
                <button
                  type="button"
                  className="decline-btn"
                  onClick={() => handleBookingAction('cancelled')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Decline Booking'}
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (location.state?.paymentMessage) {
      setPaymentMessage(location.state.paymentMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (bookingId) => {
    setPaymentMessage('');
    setPaymentError('');
    navigate(`/payment/${bookingId}`);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-banner">
        <div className="banner-content">
          <p className="banner-greeting">Customer Dashboard</p>
          <h1 className="banner-title">My Bookings</h1>
          <p className="banner-sub">Track and manage your private chef experiences</p>
        </div>
      </div>

      <div className="dashboard-body">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't booked any chefs yet</p>
            <a href="/chefs" className="btn-primary">Browse Chefs</a>
          </div>
        ) : (
          <>
            {paymentMessage && <p className="details-success">{paymentMessage}</p>}
            {paymentError && <p className="details-error">{paymentError}</p>}

            <div className="bookings-grid">
            {bookings.map(booking => {
              const paymentStatus = booking.payment_status || 'pending';
              const canPayNow = booking.status === 'confirmed' && paymentStatus !== 'fully_paid';

              return (
              <div key={booking.id} className={`booking-card status-${booking.status}`}>
                <div className="booking-header">
                  <h3>Chef {booking.chef_first_name} {booking.chef_last_name}</h3>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                </div>
                <div className="booking-details">
                  <p><strong>Date:</strong> {new Date(booking.event_date).toLocaleDateString()} at {booking.event_time}</p>
                  <p><strong>Location:</strong> {booking.event_location}</p>
                  <p><strong>Guests:</strong> {booking.guest_count}</p>
                  <p><strong>Total:</strong> ${booking.total_price}</p>
                  <p>
                    <strong>Payment:</strong>{' '}
                    <span className={`status payment-${paymentStatus}`}>{paymentStatus.replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="booking-actions">
                  {canPayNow && (
                    <button
                      type="button"
                      className="pay-btn"
                      onClick={() => handlePayNow(booking.id)}
                    >
                      Pay Now
                    </button>
                  )}
                  <Link to={`/booking/${booking.id}`} className="view-link">View Details</Link>
                </div>
              </div>
            );
            })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

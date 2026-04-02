import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './BookingDetails.css';

const StarPicker = ({ value, onChange }) => (
  <div className="star-picker">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn${star <= value ? ' active' : ''}`}
        onClick={() => onChange(star)}
        aria-label={`${star} star`}
      >
        ★
      </button>
    ))}
  </div>
);

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userType = user?.userType || user?.user_type;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review state
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [rating, setRating] = useState(5);
  const [foodQuality, setFoodQuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getBookingDetails(bookingId);
        setBooking(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking) return;
    const canReview =
      userType === 'customer' &&
      (booking.status === 'confirmed' || booking.status === 'completed');
    if (!canReview) return;

    const fetchReview = async () => {
      setReviewLoading(true);
      try {
        const res = await reviewAPI.getBookingReview(bookingId);
        if (res.data) {
          setExistingReview(res.data);
          setRating(res.data.rating);
          setComment(res.data.comment || '');
        }
      } catch {
        // no review yet — ignore
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReview();
  }, [booking, bookingId, userType]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await reviewAPI.createReview({
        bookingId: parseInt(bookingId, 10),
        rating,
        foodQuality,
        professionalism,
        valueForMoney,
        comment: comment.trim()
      });
      setReviewSuccess('Your review has been submitted successfully!');
      // refetch so it shows as submitted
      const res = await reviewAPI.getBookingReview(bookingId);
      if (res.data) setExistingReview(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="booking-details-page">
        <div className="booking-details-card">
          <h1>Booking Details</h1>
          <p className="booking-error">{error || 'Booking not found'}</p>
          <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const canReview =
    userType === 'customer' &&
    (booking.status === 'confirmed' || booking.status === 'completed');

  return (
    <div className="booking-details-page">
      <div className="booking-details-card">
        <div className="booking-details-header">
          <h1>Booking #{booking.id}</h1>
          <span className={`status ${booking.status}`}>{booking.status}</span>
        </div>

        <div className="booking-detail-grid">
          <p><strong>Chef:</strong> {booking.chef_first_name} {booking.chef_last_name}</p>
          <p><strong>Customer:</strong> {booking.customer_first_name} {booking.customer_last_name}</p>
          <p><strong>Event Date:</strong> {new Date(booking.event_date).toLocaleDateString()}</p>
          <p><strong>Event Time:</strong> {booking.event_time}</p>
          <p><strong>Event Type:</strong> {booking.event_type || 'Not specified'}</p>
          <p><strong>Location:</strong> {booking.event_location}</p>
          <p><strong>Guests:</strong> {booking.guest_count}</p>
          <p><strong>Total Price:</strong> ${Number(booking.total_price || 0).toFixed(2)}</p>
          <p>
            <strong>Payment:</strong>{' '}
            <span className={`status payment-${booking.payment_status || 'pending'}`}>
              {(booking.payment_status || 'pending').replace('_', ' ')}
            </span>
          </p>
        </div>

        <div className="special-requests-block">
          <h3>Special Requests</h3>
          <p>{booking.special_requests || 'None'}</p>
        </div>

        {error && <p className="booking-error">{error}</p>}

        {/* ── Review Section ── */}
        {canReview && !reviewLoading && (
          <div className="review-section">
            <h2>{existingReview ? 'Your Review' : 'Rate Your Experience'}</h2>

            {existingReview ? (
              <div className="submitted-review">
                <div className="review-stars-row">
                  {'★'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)}
                  <span className="review-date">
                    {new Date(existingReview.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment-text">{existingReview.comment || <em>No comment</em>}</p>
                {reviewSuccess && <p className="review-success">{reviewSuccess}</p>}
              </div>
            ) : (
              <form className="review-form" onSubmit={handleSubmitReview}>
                <div className="review-row">
                  <label>Overall Rating</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div className="review-row">
                  <label>Food Quality</label>
                  <StarPicker value={foodQuality} onChange={setFoodQuality} />
                </div>
                <div className="review-row">
                  <label>Professionalism</label>
                  <StarPicker value={professionalism} onChange={setProfessionalism} />
                </div>
                <div className="review-row">
                  <label>Value for Money</label>
                  <StarPicker value={valueForMoney} onChange={setValueForMoney} />
                </div>
                <div className="review-comment-group">
                  <label>Comment</label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience with this chef..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                  />
                </div>
                {reviewError && <p className="review-error">{reviewError}</p>}
                {reviewSuccess && <p className="review-success">{reviewSuccess}</p>}
                <button
                  type="submit"
                  className="submit-review-btn"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="booking-detail-actions">
          <Link to="/dashboard" className="back-link">Back to dashboard</Link>
          {booking.status === 'confirmed' && (booking.payment_status || 'pending') !== 'fully_paid' && (
            <button
              type="button"
              className="pay-btn"
              onClick={() => navigate(`/payment/${booking.id}`)}
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import './Payment.css';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

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

  const amount = useMemo(() => {
    const value = Number(booking?.total_price || 0);
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
  }, [booking]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!booking) {
      setError('Booking not found');
      return;
    }

    if (booking.status !== 'confirmed') {
      setError('Payment is available only for confirmed bookings');
      return;
    }

    if ((booking.payment_status || 'pending') === 'fully_paid') {
      setError('This booking is already paid');
      return;
    }

    setIsPaying(true);

    try {
      await bookingAPI.payBooking(booking.id);
      navigate('/dashboard/customer', {
        replace: true,
        state: { paymentMessage: `Payment completed for booking #${booking.id}` }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading payment page...</div>;
  }

  if (!booking) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h1>Payment</h1>
          <p className="payment-error">{error || 'Booking not found'}</p>
          <Link to="/dashboard/customer" className="payment-link">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h1>Secure Checkout</h1>
        <p className="payment-subtitle">Dummy payment page for booking #{booking.id}</p>

        <div className="payment-summary">
          <p><strong>Chef:</strong> {booking.chef_first_name} {booking.chef_last_name}</p>
          <p><strong>Event date:</strong> {new Date(booking.event_date).toLocaleDateString()}</p>
          <p><strong>Total amount:</strong> ${amount}</p>
          <p><strong>Status:</strong> {booking.status}</p>
        </div>

        {error && <p className="payment-error">{error}</p>}

        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Card holder name</label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Card number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              required
            />
          </div>

          <div className="payment-row">
            <div className="form-group">
              <label>Expiry</label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div className="payment-actions">
            <Link to="/dashboard/customer" className="payment-cancel">Cancel</Link>
            <button type="submit" className="payment-submit" disabled={isPaying}>
              {isPaying ? 'Processing...' : `Pay $${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;

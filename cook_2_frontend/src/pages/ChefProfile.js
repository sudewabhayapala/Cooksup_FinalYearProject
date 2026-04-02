import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chefAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toImageUrl } from '../utils/imageUrl';
import './ChefProfile.css';

const ChefProfile = () => {
  const { chefId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [contactLocation, setContactLocation] = useState('');
  const [contactDate, setContactDate] = useState('');

  const role = user?.userType || user?.user_type;
  const fetchChefProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chefAPI.getChefProfile(chefId);
      setChef(response.data);
    } catch (error) {
      console.error('Error fetching chef profile:', error);
    } finally {
      setLoading(false);
    }
  }, [chefId]);

  useEffect(() => {
    fetchChefProfile();
  }, [fetchChefProfile]);

  useEffect(() => {
    if (!chef) return;
    setContactLocation(chef.location || '');
  }, [chef]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (role !== 'customer') {
      alert('Please login as a client account to message and book this chef.');
      return;
    }

    setShowBookingForm(true);
  };

  const fullName = useMemo(
    () => `${chef?.first_name || ''} ${chef?.last_name || ''}`.trim() || 'Chef',
    [chef]
  );

  const averageRating = Number(chef?.average_rating ?? chef?.rating ?? 0);
  const reviewCount = Number(chef?.review_count ?? chef?.total_reviews ?? 0);
  const eventsCount = Number(chef?.total_bookings ?? chef?.booking_count ?? 0);
  const experienceYears = Number(chef?.experience_years ?? 0);
  const hourlyRate = chef?.hourly_rate;
  const minSpend = chef?.min_spend;

  const aboutText = chef?.bio || 'Private chef available for bespoke dining experiences.';
  const longBio = aboutText.length > 280;
  const visibleBio = showFullBio || !longBio ? aboutText : `${aboutText.slice(0, 280)}...`;

  const profileTags = useMemo(() => {
    const source = [chef?.specialties, chef?.cuisine_types, chef?.certifications]
      .filter(Boolean)
      .join(',');

    const tags = source
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    return Array.from(new Set(tags)).slice(0, 6);
  }, [chef]);

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return `$${Number(value).toFixed(0)}`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!chef) return <div className="error">Chef not found</div>;

  return (
    <div className="chef-profile-page">
      <div className="chef-profile-layout">
        <div className="chef-profile-main">
          <section className="chef-summary-card">
            <div className="chef-summary-avatar-wrap">
              {chef.profile_image ? (
                <img src={toImageUrl(chef.profile_image)} alt={fullName} className="chef-summary-avatar" />
              ) : (
                <div className="chef-summary-avatar chef-summary-avatar-placeholder">
                  {`${chef.first_name?.[0] || ''}${chef.last_name?.[0] || ''}`.toUpperCase() || 'CH'}
                </div>
              )}
            </div>

            <div className="chef-summary-content">
              <div className="chef-summary-top-row">
                <div>
                  <h1>{fullName}</h1>
                  <p className="chef-summary-headline">
                    {chef.specialties || chef.specialty || 'Private chef with a tailored dining style.'}
                  </p>
                </div>

                <p className="chef-summary-rating">{averageRating.toFixed(2)} ({reviewCount} reviews)</p>
              </div>

              <div className="chef-summary-meta">
                <p>{chef.location || 'Location not specified'}</p>
                <p>
                  {hourlyRate ? `From ${formatMoney(hourlyRate)}pp` : 'Price on request'}
                  {minSpend ? ` / Min spend ${formatMoney(minSpend)}` : ''}
                </p>
                <p>{eventsCount} yhungry events</p>
                <p>{experienceYears} years experience</p>
              </div>

            </div>
          </section>

          <section className="chef-about-card">
            <h2>About chef</h2>

            <p className="chef-about-text">{visibleBio}</p>
            {longBio && (
              <button type="button" className="link-btn" onClick={() => setShowFullBio((prev) => !prev)}>
                {showFullBio ? 'show less' : 'read more'}
              </button>
            )}

            {profileTags.length > 0 && (
              <div className="chef-tags">
                {profileTags.map((tag) => (
                  <span key={tag} className="chef-tag">{tag}</span>
                ))}
              </div>
            )}
          </section>

          <section className="reviews-card">
            <h2>Chef reviews</h2>
            {chef.recentReviews && chef.recentReviews.length > 0 ? (
              <div className="reviews-list">
                {chef.recentReviews.map((review) => {
                  const filled = Math.round(review.rating);
                  return (
                    <div key={review.id} className="review-item">
                      <div className="review-item-header">
                        <div className="review-avatar">
                          {review.first_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="review-meta">
                          <strong className="review-author">
                            {review.first_name} {review.last_name}
                          </strong>
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            {review.event_type ? ` · ${review.event_type}` : ''}
                          </span>
                        </div>
                        <div className="review-stars">
                          {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
                          <span className="review-score">{Number(review.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="review-body">{review.comment}</p>
                      )}
                      {review.response && (
                        <div className="review-response">
                          <strong>Chef's reply:</strong> {review.response}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-reviews">No reviews yet.</p>
            )}
          </section>
        </div>

        <aside className="chef-contact-card">
          <span className="booking-chip">{eventsCount > 0 ? `${eventsCount} looking to book` : 'Open for booking'}</span>
          <h3>Message chef to create your dream menu</h3>

          <div className="contact-field">
            <label>Location</label>
            <input
              type="text"
              value={contactLocation}
              onChange={(e) => setContactLocation(e.target.value)}
              placeholder="Search zip code or city"
            />
          </div>

          <div className="contact-field">
            <label>Event date</label>
            <input
              type="date"
              value={contactDate}
              onChange={(e) => setContactDate(e.target.value)}
            />
          </div>

          <button type="button" className="message-btn" onClick={handleBookClick}>
            Message chef
          </button>
          <p className="booking-note">You will not be charged yet</p>
        </aside>
      </div>

      {showBookingForm && (
        <BookingForm
          chefId={chefId}
          chefName={fullName}
          initialData={{
            eventDate: contactDate,
            eventLocation: contactLocation
          }}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
};

const BookingForm = ({ chefId, chefName, onClose, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventDate: initialData.eventDate || '',
    eventTime: '',
    eventLocation: initialData.eventLocation || '',
    eventType: '',
    numGuests: '',
    menuRequirements: '',
    budget: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const guestCount = parseInt(formData.numGuests, 10);
      const totalPrice = formData.budget ? parseFloat(formData.budget) : NaN;

      if (!Number.isFinite(guestCount) || guestCount <= 0) {
        alert('Please enter a valid number of guests.');
        setLoading(false);
        return;
      }

      if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
        alert('Please enter a valid budget.');
        setLoading(false);
        return;
      }

      const combinedSpecialRequests = [
        formData.menuRequirements ? `Menu requirements: ${formData.menuRequirements}` : '',
        formData.specialRequests || ''
      ]
        .filter(Boolean)
        .join('\n\n');

      await bookingAPI.createBooking({
        chefId,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation,
        eventType: formData.eventType,
        guestCount,
        totalPrice,
        specialRequests: combinedSpecialRequests
      });

      alert('Booking requested successfully!');
      navigate('/dashboard/customer');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>x</button>
        <h2>Book {chefName}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Event Time</label>
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Event Location</label>
            <input
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleChange}
              placeholder="Address"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>
              <input
                type="text"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                placeholder="Birthday, Wedding, etc."
              />
            </div>
            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                name="numGuests"
                value={formData.numGuests}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              step="0.01"
              placeholder="$"
            />
          </div>

          <div className="form-group">
            <label>Menu Requirements</label>
            <textarea
              name="menuRequirements"
              value={formData.menuRequirements}
              onChange={handleChange}
              placeholder="Describe your menu preferences..."
            />
          </div>

          <div className="form-group">
            <label>Special Requests</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or dietary restrictions?"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChefProfile;

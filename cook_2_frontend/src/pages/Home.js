import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chefAPI, reviewAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredChefs, setFeaturedChefs] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    const items = document.querySelectorAll('.reveal-on-scroll');
    if (!items.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    chefAPI.searchChefs({ sortBy: 'rating', limit: 3 })
      .then((res) => setFeaturedChefs(res.data?.chefs || []))
      .catch(() => {});

    reviewAPI.getRecentReviews(3)
      .then((res) => setRecentReviews(res.data?.reviews || []))
      .catch(() => {});
  }, []);

  const heroStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.82) 0%, rgba(30, 27, 75, 0.78) 50%, rgba(15, 23, 42, 0.82) 100%), url(${process.env.PUBLIC_URL}/images/home/man-chef-serious-food-kitchen-600nw-2488467451.webp)`
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero" style={heroStyle}>
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-content hero-enter">
          <span className="hero-badge">✦ Next Generation Dining</span>
          <h1>Find a private chef for your next event</h1>
          <p className="hero-subtitle">Anywhere in your city • Get quotes within 20 min</p>
          <Link to="/chefs" className="btn btn-hero">
            Find local chef
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works reveal-on-scroll reveal-up">
        <div className="container">
          <span className="section-badge">◈ Simple Process</span>
          <h2 className="section-title">We made it very easy</h2>
          <div className="steps-grid">
            <div className="step-card reveal-on-scroll reveal-up" style={{ '--reveal-delay': '60ms' }}>
              <div className="step-number">1</div>
              <h3>Send your details</h3>
              <p>Tell us your vibe, budget, event details and food preferences</p>
            </div>
            <div className="step-card reveal-on-scroll reveal-up" style={{ '--reveal-delay': '130ms' }}>
              <div className="step-number">2</div>
              <h3>Receive Menus and Quotes</h3>
              <p>Get personalised menus and quotes from multiple chefs so you can compare</p>
            </div>
            <div className="step-card reveal-on-scroll reveal-up" style={{ '--reveal-delay': '200ms' }}>
              <div className="step-number">3</div>
              <h3>Chat to customise</h3>
              <p>Chat with your chef to customise. You can still make edits after booking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Chefs - real data from database */}
      <section className="featured-chefs reveal-on-scroll reveal-up">
        <div className="container">
          <span className="section-badge">◈ Featured Talent</span>
          <h2 className="section-title">Amazing chefs, exclusive to CooksUp</h2>
          <p className="section-subtitle">Have a chef from your favourite restaurant or TV show cook for you</p>
          <div className="chefs-grid">
            {featuredChefs.map((chef, idx) => {
              const initials = ((chef.first_name || '')[0] + (chef.last_name || '')[0]).toUpperCase();
              const rating = Number(chef.average_rating || 0).toFixed(1);
              const events = chef.booking_count || chef.total_bookings || 0;
              const minSpend = chef.min_spend ? '$' + Number(chef.min_spend).toFixed(0) + ' min spend' : null;
              const delays = ['60ms', '130ms', '200ms'];
              return (
                <Link
                  key={chef.user_id || chef.id}
                  to={'/chefs/' + (chef.user_id || chef.id)}
                  className="chef-card reveal-on-scroll reveal-scale"
                  style={{ '--reveal-delay': delays[idx] || '60ms' }}
                >
                  <div className="chef-avatar">{initials}</div>
                  <h4>{chef.first_name} {chef.last_name}</h4>
                  <p className="chef-desc">{chef.specialties || 'Private Chef'}</p>
                  <p className="chef-stats">
                    {'\u2B50'} {rating}
                    {minSpend ? ' \u2022 ' + minSpend : ''}
                    {' \u2022 ' + events + ' events'}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <Link to="/chefs" className="btn btn-outline">Browse all chefs</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose reveal-on-scroll reveal-up">
        <div className="container">
          <span className="section-badge">◈ Why Us</span>
          <h2 className="section-title">Why hire private chef with CooksUp</h2>
          <div className="benefits-grid">
            <div className="benefit-card reveal-on-scroll reveal-left" style={{ '--reveal-delay': '50ms' }}>
              <div className="benefit-icon">{'\u2713'}</div>
              <h3>Vetted and rated professional chefs</h3>
              <p>We work with the best chefs and we make choosing the right chef easy by providing transparent ratings and reviews by real customers.</p>
            </div>
            <div className="benefit-card reveal-on-scroll reveal-left" style={{ '--reveal-delay': '110ms' }}>
              <div className="benefit-icon">{'\uD83D\uDD12'}</div>
              <h3>Secure payment and protection</h3>
              <p>All payments are securely held in escrow until after your event. This ensures your funds are protected, minimizing any risks.</p>
            </div>
            <div className="benefit-card reveal-on-scroll reveal-left" style={{ '--reveal-delay': '170ms' }}>
              <div className="benefit-icon">{'\uD83D\uDEE1\uFE0F'}</div>
              <h3>Public liability insurance cover</h3>
              <p>Any accidents caused by the chef during an event booked on the CooksUp platform is covered by our public liability policy.</p>
            </div>
            <div className="benefit-card reveal-on-scroll reveal-left" style={{ '--reveal-delay': '230ms' }}>
              <div className="benefit-icon">{'\uD83D\uDCC5'}</div>
              <h3>Flexible cancellation policy</h3>
              <p>If a chef cancels, we will help you find a new chef and if that is not possible you will receive a full refund.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - real reviews from database */}
      <section className="testimonials reveal-on-scroll reveal-up">
        <div className="container">
          <span className="section-badge">◈ Reviews</span>
          <h2 className="section-title">What our customers say</h2>
          <div className="testimonials-grid">
            {recentReviews.length > 0 ? recentReviews.map((review, idx) => {
              const delays = ['70ms', '140ms', '210ms'];
              const filled = Math.min(5, Math.max(1, Number(review.rating)));
              const stars = '\u2B50'.repeat(filled);
              const initials = ((review.customer_first_name || '')[0] + (review.customer_last_name || '')[0]).toUpperCase();
              return (
                <div
                  key={review.id}
                  className="testimonial-card reveal-on-scroll reveal-right"
                  style={{ '--reveal-delay': delays[idx] || '70ms' }}
                >
                  <div className="testimonial-top">
                    <div className="testimonial-avatar">{initials}</div>
                    <div className="testimonial-meta">
                      <strong>{review.customer_first_name} {review.customer_last_name}</strong>
                      <span className="testimonial-chef-tag">Reviewed Chef {review.chef_first_name} {review.chef_last_name}</span>
                    </div>
                  </div>
                  <div className="stars">{stars}</div>
                  <p className="testimonial-text">"{review.comment}"</p>
                </div>
              );
            }) : (
              <>
                <div className="testimonial-card reveal-on-scroll reveal-right" style={{ '--reveal-delay': '70ms' }}>
                  <div className="stars">{'\u2B50\u2B50\u2B50\u2B50\u2B50'}</div>
                  <p className="testimonial-text">"Incredible experience. Not only was the food next level, the chef was extremely personable which made the entire experience even better."</p>
                  <p className="testimonial-author">- John D.</p>
                </div>
                <div className="testimonial-card reveal-on-scroll reveal-right" style={{ '--reveal-delay': '140ms' }}>
                  <div className="stars">{'\u2B50\u2B50\u2B50\u2B50\u2B50'}</div>
                  <p className="testimonial-text">"Chef made our Valentine's Day absolutely unforgettable. The food was beautifully presented and full of flavor. Highly recommend!"</p>
                  <p className="testimonial-author">- Sarah M.</p>
                </div>
                <div className="testimonial-card reveal-on-scroll reveal-right" style={{ '--reveal-delay': '210ms' }}>
                  <div className="stars">{'\u2B50\u2B50\u2B50\u2B50\u2B50'}</div>
                  <p className="testimonial-text">"Understood exactly what I was looking for and made incredible food for a party of 12. Couldn't recommend highly enough!"</p>
                  <p className="testimonial-author">- Jack W.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section reveal-on-scroll reveal-up">
        <div className="container">
          <h2>Ready to find your perfect chef?</h2>
          <p>Browse our amazing chefs and book your next event</p>
          <Link to="/register" className="btn btn-cta">Get started now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

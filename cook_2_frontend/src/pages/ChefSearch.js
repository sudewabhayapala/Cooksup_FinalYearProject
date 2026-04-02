import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { chefAPI } from '../services/api';
import { toImageUrl } from '../utils/imageUrl';
import './ChefSearch.css';

const ChefSearch = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    query: '',
    specialty: '',
    minRating: '',
    sortBy: 'popular'
  });
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');

  const quickTags = [
    'Chefs near me',
    'Super Chefs',
    'Italian',
    'Indian',
    'British',
    'BBQ'
  ];

  const fetchChefs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        location: filters.location,
        query: filters.query,
        cuisine: filters.specialty,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
        ...(guestCount ? { guestCount } : {})
      };

      const response = await chefAPI.searchChefs(params);
      setChefs(response.data?.chefs || []);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.location, filters.query, filters.specialty, filters.minRating, filters.sortBy, guestCount]);

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagClick = (tag) => {
    const specialtyMap = {
      Italian: 'Italian',
      Indian: 'Indian',
      British: 'British',
      BBQ: 'BBQ',
      Masterchef: 'Masterchef',
      'Michelin trained': 'Michelin',
      'Super Chefs': 'Chef',
      'Chefs near me': ''
    };

    if (tag === 'Chefs near me') {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      specialty: specialtyMap[tag] || tag
    }));
  };

  const handleSearchClick = () => {
    fetchChefs();
  };

  const handleQueryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchChefs();
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'CH';
  };

  const getChefBadges = (chef) => {
    const badges = [];
    const rating = Number(chef.average_rating || 0);
    const bookings = Number(chef.total_bookings || chef.booking_count || 0);

    if (rating >= 4.8) badges.push('Super Chef');
    if (bookings >= 20) badges.push('Trending');
    return badges.length > 0 ? badges : ['Trending'];
  };

  const formatChefBio = (bio) => {
    if (!bio) return 'Private chef available for bespoke dining experiences.';
    if (bio.length <= 95) return bio;
    return `${bio.slice(0, 95)}...`;
  };

  const renderStars = (rating) => {
    return Number(rating || 0).toFixed(1);
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 16;
    const rotateX = (0.5 - y) * 14;

    card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
    card.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
    card.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
  };

  const handleCardLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--card-rotate-x', '0deg');
    card.style.setProperty('--card-rotate-y', '0deg');
    card.style.setProperty('--pointer-x', '50%');
    card.style.setProperty('--pointer-y', '50%');
  };

  return (
    <div className="chef-search-container">
      {/* Hero Banner */}
      <div className="search-hero">
        <div className="search-hero-glow search-hero-glow-1" />
        <div className="search-hero-glow search-hero-glow-2" />
        <div className="search-hero-content">
          <span className="search-hero-badge">&#9726; Private Chefs</span>
          <h1>Find your perfect chef</h1>
          <p>Discover talented chefs for any occasion, anywhere in your city</p>
        </div>
        <div className="search-hero-bottom" />
      </div>

      <div className="discover-toolbar-wrap">
        <div className="discover-toolbar">
          <div className="toolbar-field">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Enter location"
            />
          </div>

          <div className="toolbar-field">
            <label>Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="toolbar-field">
            <label>Guests</label>
            <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>
              <option value="">Any guests</option>
              <option value="2">2 guests</option>
              <option value="4">4 guests</option>
              <option value="8">8 guests</option>
              <option value="12">12 guests</option>
              <option value="20">20+ guests</option>
            </select>
          </div>
        </div>
      </div>

      <div className="search-filters-row">
        <div className="left-filters">
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="pill-select">
            <option value="popular">Most popular</option>
            <option value="points">Top points</option>
          </select>

          <select name="minRating" value={filters.minRating} onChange={handleFilterChange} className="pill-select">
            <option value="">Any rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>

          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handleFilterChange}
            onKeyDown={handleQueryKeyDown}
            className="pill-input"
            placeholder="Name, specialty, or cuisine"
          />

          <button className="search-icon-btn" type="button" aria-label="Search chefs" onClick={handleSearchClick}>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="search-text">Search</span>
          </button>
        </div>

        <div className="quick-tags" role="list">
          {quickTags.map((tag) => (
            <button key={tag} type="button" className="tag-pill" onClick={() => handleTagClick(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading">Loading chefs...</div>}

      <div className="chefs-grid">
        {chefs.length === 0 ? (
          <div className="no-results">No chefs found. Try adjusting your filters.</div>
        ) : (
          chefs.map(chef => {
            const profileRouteId = chef.user_id || chef.id;
            const coverImageUrl = chef.cover_image ? toImageUrl(chef.cover_image) : '';
            const coverStyle = coverImageUrl
              ? { backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.35) 100%), url(${coverImageUrl})` }
              : undefined;

            return (
            <Link
              key={chef.id}
              to={`/chef/${profileRouteId}`}
              className="chef-card"
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
            >
              <div className={`chef-cover ${coverImageUrl ? 'has-cover' : ''}`} style={coverStyle}>
                <div className="chef-badges">
                  {getChefBadges(chef).map((badge) => (
                    <span key={`${profileRouteId}-${badge}`} className="chef-badge">{badge}</span>
                  ))}
                </div>
              </div>

              <div className="chef-avatar-wrap">
                {chef.profile_image ? (
                  <img src={toImageUrl(chef.profile_image)} alt={chef.first_name} className="chef-avatar" />
                ) : (
                  <div className="chef-avatar placeholder-avatar">{getInitials(chef.first_name, chef.last_name)}</div>
                )}
              </div>

              <div className="chef-info">
                <div className="chef-main-row">
                  <h3>{chef.first_name} {chef.last_name?.[0] || ''}</h3>
                  <p className="chef-rating">⭐ {renderStars(chef.average_rating)} ({chef.review_count || 0})</p>
                </div>

                <p className="chef-summary">{chef.current_workplace || `${chef.specialty || 'Private chef'} specialist`}</p>
                <p className="chef-bio">{formatChefBio(chef.bio)}</p>

                <p className="chef-events">👥 {chef.total_bookings || chef.booking_count || 0} yhungry events</p>
                <p className="chef-points">Top points: {Number(chef.ranking_points || 0).toFixed(0)}</p>
              </div>

            </Link>
          );
          })
        )}
      </div>
    </div>
  );
};

export default ChefSearch;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'customer',
    location: '',
    postalCode: '',
    level2CertificationNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.userType === 'chef') {
      const cert = formData.level2CertificationNumber.trim().toUpperCase();
      const certPattern = /^W[A-Z0-9]{6}$/;
      if (!certPattern.test(cert)) {
        setError('Level 2 certification number must start with W and be exactly 7 characters.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.userType,
        formData.location,
        formData.postalCode,
        formData.level2CertificationNumber
      );
      navigate('/dashboard');
    } catch (err) {
      const apiError = err.response?.data?.error;
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      setError(apiError || validationMessage || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container register-page">
      <div className="register-glow register-glow-one" aria-hidden="true" />
      <div className="register-glow register-glow-two" aria-hidden="true" />

      <div className="register-layout">
        <section className="register-brand-panel">
          <p className="register-badge">Start Your CookSup Journey</p>
          <h1>Join as a client or chef and create memorable food experiences</h1>
          <p className="register-brand-copy">
            Build your profile, connect instantly, and book or host private dining in minutes.
          </p>
          <div className="register-brand-pills">
            <span>Easy onboarding</span>
            <span>Trusted profiles</span>
            <span>Flexible bookings</span>
          </div>
        </section>

        <div className="auth-form register-form">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join CookSup today</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>User Type</label>
              <select name="userType" value={formData.userType} onChange={handleChange} required>
                <option value="customer">Client (Looking for a Chef)</option>
                <option value="chef">Chef (Offering Services)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City or area"
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="SW1A 1AA"
                />
              </div>
            </div>

            {formData.userType === 'chef' && (
              <div className="form-group">
                <label>Level 2 Certification Number</label>
                <input
                  type="text"
                  name="level2CertificationNumber"
                  value={formData.level2CertificationNumber}
                  onChange={handleChange}
                  placeholder="W123456"
                  maxLength={7}
                  required
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = new URLSearchParams(location.search).get('resetToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');

    if (!resetToken) {
      setError('Missing reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Failed to reset password');
        return;
      }

      setInfoMessage('Password reset successfully. Please sign in with your new password.');
      setNewPassword('');
      navigate('/login', { replace: true });
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfoMessage('');

    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Failed to start password reset');
        return;
      }

      setInfoMessage(data?.message || 'If the email exists, reset instructions have been generated.');
    } catch (err) {
      setError('Failed to start password reset');
    }
  };

  const heading = resetToken ? 'Reset Password' : 'Welcome Back';
  const subtitle = resetToken
    ? 'Create a new password for your account'
    : 'Sign in and continue planning your next event';

  return (
    <div className="auth-container login-page">
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-brand-panel">
          <p className="login-badge">CookSup Private Dining</p>
          <h1>Host unforgettable moments with top private chefs</h1>
          <p className="login-brand-copy">
            Discover creative menus, compare chefs, and book with confidence.
          </p>
          <div className="login-brand-pills">
            <span>Vetted chefs</span>
            <span>Fast quotes</span>
            <span>Secure booking</span>
          </div>
        </section>

        <div className="auth-form login-form">
          <h2>{heading}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          {error && <div className="error-message">{error}</div>}
          {infoMessage && <div className="success-message">{infoMessage}</div>}

          {resetToken && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Set New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {!resetToken && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          )}

          {!resetToken && (
            <p className="auth-footer">
              Don't have an account? <Link to="/register">Sign up here</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

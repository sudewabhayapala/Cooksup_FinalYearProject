import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click 1
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const initials = user
    ? `${(user.firstName || user.first_name || '')[0] || ''}${(user.lastName || user.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  const displayName = user?.firstName || user?.first_name || 'Account';

  return (
    <header className={`header${scrolled ? ' header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon">🍽</span>
          <span className="logo-text">CookSup</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav">
          <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
          <Link to="/chefs" className={`nav-link${isActive('/chefs') ? ' active' : ''}`}>Find Chefs</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}>Dashboard</Link>

              {/* Avatar dropdown */}
              <div className="nav-avatar-wrap" ref={dropdownRef}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => setDropdownOpen((p) => !p)}
                  aria-label="Account menu"
                >
                  <span className="nav-avatar">{initials}</span>
                  <span className="nav-avatar-name">{displayName}</span>
                  <span className={`nav-caret${dropdownOpen ? ' open' : ''}`}>▾</span>
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown">
                    <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                    <Link to="/dashboard" className="dropdown-item">📊 Dashboard</Link>
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn-nav-login">Login</Link>
              <Link to="/register" className="btn-nav-signup">Sign Up</Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-nav">
          <Link to="/" className={`mobile-link${isActive('/') ? ' active' : ''}`}>Home</Link>
          <Link to="/chefs" className={`mobile-link${isActive('/chefs') ? ' active' : ''}`}>Find Chefs</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`mobile-link${isActive('/dashboard') ? ' active' : ''}`}>Dashboard</Link>
              <Link to="/profile" className={`mobile-link${isActive('/profile') ? ' active' : ''}`}>Profile</Link>
              <button className="mobile-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link mobile-signup">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

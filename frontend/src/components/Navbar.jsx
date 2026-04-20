import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        BookMyVibe
      </Link>
      
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <Link to="/events" className="nav-link" onClick={closeMenu}>Explore Events</Link>
        
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
            )}
            {user.role === 'vendor' && (
              <Link to="/vendor/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
            )}
            {user.role === 'user' && (
              <Link to="/profile" className="nav-link" onClick={closeMenu}>My Bookings</Link>
            )}
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

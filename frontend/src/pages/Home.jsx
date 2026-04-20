import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section container">
        <h1 className="hero-title">
          Book Your Perfect <span>Vibe</span>
        </h1>
        <p className="hero-subtitle">
          Discover and book the best vendors for your events. From DJs to Decorators, we bring your vision to life.
        </p>
        <div className="hero-cta">
          <Link to="/events" className="btn btn-primary">Explore Events</Link>
          <Link to="/vendor/signup" className="btn btn-outline">Become a Vendor</Link>
        </div>
      </section>

      <section className="features-section container">
        <h2 className="section-title">Why Choose BookMyVibe?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">🎭</div>
            <h3 className="feature-title">Diverse Vendors</h3>
            <p className="text-muted">Find exactly what you need from our wide range of curated event service providers.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Secure Booking</h3>
            <p className="text-muted">Easy and secure booking process with instant confirmations and seamless communication.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">⭐</div>
            <h3 className="feature-title">Verified Reviews</h3>
            <p className="text-muted">Make informed decisions based on genuine reviews from previous customers.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

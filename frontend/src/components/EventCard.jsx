import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div className="event-card glass-panel">
      <img 
        src={event.imageUrl || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800'} 
        alt={event.title} 
        className="event-image" 
      />
      <div className="event-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="event-category">{event.category || 'Event'}</span>
          <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
            {event.availability || 'Available'}
          </span>
        </div>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-vendor">By {event.vendor?.name || 'Unknown Vendor'}</p>
        
        <div className="event-footer">
          <span className="event-price">₹{event.price}</span>
          <Link to={`/events/${event._id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

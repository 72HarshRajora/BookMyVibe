import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import '../styles/events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('https://bookmyvibe.onrender.com/api/events');
        setEvents(res.data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || event.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container events-container">
      <div className="events-header">
        <h1 className="events-title">Explore Services</h1>
        <div className="events-filter">
          <input 
            type="text" 
            placeholder="Search events..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="DJ">DJ</option>
            <option value="Decorator">Decorator</option>
            <option value="Food">Food</option>
            <option value="Lighting">Lighting</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading events...</div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
          {filteredEvents.length === 0 && (
            <p>No events found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;

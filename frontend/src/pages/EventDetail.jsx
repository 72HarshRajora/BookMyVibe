import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/events.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    phone: '',
    addressLine: '',
    area: '',
    cityState: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://bookmyvibe.onrender.com/api/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        // Fallback for UI
        setEvent({
          _id: id,
          title: 'Premium Event Service',
          description: 'High quality service for your perfect event. We handle everything with care and professionalism.',
          price: 15000,
          category: 'Service',
          vendor: { name: 'Super Vendor' },
          image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book', { id: 'login-error' });
      navigate('/login');
      return;
    }

    // Frontend validation
    if (!bookingData.date || !bookingData.time || !bookingData.phone || !bookingData.addressLine || !bookingData.area || !bookingData.cityState) {
      toast.error('Please fill out all required fields', { id: 'booking-error' });
      return;
    }

    const selectedDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Cannot book past dates', { id: 'booking-error' });
      return;
    }
    
    try {
      await axios.post('https://bookmyvibe.onrender.com/api/bookings', {
        eventId: event._id,
        ...bookingData
      }, { withCredentials: true });
      
      toast.success('Booking request sent successfully!');
      setBookingData({ phone: '', addressLine: '', area: '', cityState: '', date: '', time: '' });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed', { id: 'booking-error' });
    }
  };

  if (loading) return <div className="container" style={{padding: '5rem', textAlign:'center'}}>Loading...</div>;
  if (!event) return <div className="container" style={{padding: '5rem', textAlign:'center'}}>Event not found</div>;

  // Get today's date in YYYY-MM-DD format for the min attribute
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="event-detail-container">
      <div className="glass-panel event-detail-card">
        <div className="event-image-container">
          <img src={event.imageUrl || event.image} alt={event.title} className="event-detail-image" />
        </div>
        
        <div className="event-info">
          <h1>{event.title}</h1>
          <p className="event-category" style={{marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <span>{event.category} • By {event.vendor?.name}</span>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '500' }}>
              {event.availability || 'Available'}
            </span>
          </p>
          <div className="price" style={{marginBottom: '1rem'}}>₹{event.price}</div>
          <p className="description">{event.description}</p>
          
          <form className="booking-form" onSubmit={handleBook}>
            <h3 style={{marginBottom: '1.5rem'}}>Book this service</h3>
            
            <div className="form-group">
              <label>Event Date</label>
              <input type="date" name="date" min={todayString} className="form-control" value={bookingData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Event Time</label>
              <input type="time" name="time" className="form-control" value={bookingData.time} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="form-control" placeholder="Your phone number" value={bookingData.phone} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Address Line (H.No, Building)</label>
              <input type="text" name="addressLine" className="form-control" value={bookingData.addressLine} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Area/Colony/Society</label>
              <input type="text" name="area" className="form-control" value={bookingData.area} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>City + State</label>
              <input type="text" name="cityState" className="form-control" value={bookingData.cityState} onChange={handleChange} required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

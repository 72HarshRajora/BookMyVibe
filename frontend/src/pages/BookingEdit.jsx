import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const BookingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    phone: '',
    addressLine: '',
    area: '',
    cityState: ''
  });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`https://bookmyvibe.onrender.com/api/bookings/${id}`, { withCredentials: true });
        const b = res.data.booking;
        setBooking(b);
        setFormData({
          date: b.date ? new Date(b.date).toISOString().split('T')[0] : '',
          time: b.time || '',
          phone: b.phone || '',
          addressLine: b.address?.line1 || '',
          area: b.address?.area || '',
          cityState: b.address?.cityState || ''
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load booking', { id: 'edit-error' });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBooking();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.phone || !formData.addressLine || !formData.area || !formData.cityState) {
      toast.error('Please fill out all fields', { id: 'edit-error' });
      return;
    }

    setSaving(true);
    try {
      await axios.put(`https://bookmyvibe.onrender.com/api/bookings/${id}`, formData, { withCredentials: true });
      toast.success('Booking updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update booking', { id: 'edit-error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to cancel and delete this booking? This cannot be undone.')) return;

    try {
      await axios.delete(`https://bookmyvibe.onrender.com/api/bookings/${id}`, { withCredentials: true });
      toast.success('Booking deleted successfully');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete booking', { id: 'edit-error' });
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading booking...</div>;
  if (!user) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Please login</div>;
  if (!booking) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Booking not found</div>;

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <h1>Edit Booking</h1>
        <button className="btn btn-outline" onClick={() => navigate('/profile')}>
          Back to My Bookings
        </button>
      </div>

      {/* Booking Summary */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--accent-1)' }}>Booking Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Event</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{booking.event?.title || 'Unknown'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>₹{booking.event?.price || '-'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</p>
            <span className={`status-badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Booked On</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{new Date(booking.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-1)' }}>Update Details</h2>

        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Event Date</label>
              <input type="date" name="date" min={todayString} className="form-control" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Event Time</label>
              <input type="time" name="time" className="form-control" value={formData.time} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Address Line (H.No, Building)</label>
              <input type="text" name="addressLine" className="form-control" value={formData.addressLine} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Area/Colony/Society</label>
              <input type="text" name="area" className="form-control" value={formData.area} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>City + State</label>
              <input type="text" name="cityState" className="form-control" value={formData.cityState} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingEdit;

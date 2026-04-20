import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [processingBookingId, setProcessingBookingId] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          axios.get('https://bookmyvibe.onrender.com/api/vendor/events', { withCredentials: true }).catch(() => ({data: {events: []}})),
          axios.get('https://bookmyvibe.onrender.com/api/vendor/bookings', { withCredentials: true }).catch(() => ({data: {bookings: []}}))
        ]);
        
        setEvents(eventsRes.data.events || []);
        setBookings(bookingsRes.data.bookings || []);
      } catch (err) {
        console.error('Error fetching vendor data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'vendor') fetchVendorData();
  }, [user]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setProcessingBookingId(bookingId);
    try {
      await axios.put(`https://bookmyvibe.onrender.com/api/vendor/bookings/${bookingId}/status`, { status: newStatus }, { withCredentials: true });
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      toast.success(`Booking ${newStatus} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status', { id: 'status-error' });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`https://bookmyvibe.onrender.com/api/events/${eventId}`, { withCredentials: true });
        setEvents(events.filter(e => e._id !== eventId));
        toast.success('Service deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete service');
      }
    }
  };

  if (!user || user.role !== 'vendor') return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Access Denied</div>;

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/vendor/add-event')}>Add New Event/Service</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card glass-panel">
          <span className="stat-title">Total Services</span>
          <span className="stat-value">{events.length}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-title">Total Bookings</span>
          <span className="stat-value">{bookings.length}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-title">Pending Bookings</span>
          <span className="stat-value">{bookings.filter(b => b.status === 'pending').length}</span>
        </div>
      </div>

      <div className="dashboard-section glass-panel" style={{padding: '2rem'}}>
        <h2>My Services</h2>
        {events.length === 0 ? (
          <p>You haven't created any services yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.category}</td>
                    <td>₹{event.price}</td>
                    <td>
                      <button className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem'}} onClick={() => navigate(`/vendor/edit-event/${event._id}`)}>Edit</button>
                      <button className="btn btn-danger" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section glass-panel" style={{padding: '2rem'}}>
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p>No bookings received yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>View Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <React.Fragment key={booking._id}>
                    <tr>
                      <td>{booking.user?.name}</td>
                      <td>{booking.event?.title}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.time || '-'}</td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                        >
                          {expandedBookingId === booking._id ? 'Hide' : 'View Details'}
                        </button>
                      </td>
                      <td>
                        {booking.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: processingBookingId === booking._id ? 0.5 : 1 }}
                              onClick={() => handleStatusChange(booking._id, 'confirmed')}
                              disabled={processingBookingId === booking._id}
                            >
                              {processingBookingId === booking._id ? '...' : 'Confirm'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: processingBookingId === booking._id ? 0.5 : 1 }}
                              onClick={() => handleStatusChange(booking._id, 'cancelled')}
                              disabled={processingBookingId === booking._id}
                            >
                              {processingBookingId === booking._id ? '...' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        )}
                      </td>
                    </tr>

                    {expandedBookingId === booking._id && (
                      <tr>
                        <td colSpan="6" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderTop: 'none' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Customer Name</p>
                              <p style={{ fontWeight: '500' }}>{booking.user?.name}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Customer Email</p>
                              <p style={{ fontWeight: '500' }}>{booking.user?.email}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Phone Number</p>
                              <p style={{ fontWeight: '500' }}>{booking.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Event Address</p>
                              <p style={{ fontWeight: '500' }}>
                                {booking.address?.line1}, {booking.address?.area}, {booking.address?.cityState}
                              </p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Event Date & Time</p>
                              <p style={{ fontWeight: '500' }}>{new Date(booking.date).toLocaleDateString()} at {booking.time || '-'}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Status</p>
                              <span className={`status-badge status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Booked On</p>
                              <p style={{ fontWeight: '500' }}>{new Date(booking.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;

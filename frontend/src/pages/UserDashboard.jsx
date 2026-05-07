import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const { user, login } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Fetch real profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://bookmyvibe.onrender.com/api/users/profile', { withCredentials: true });
        setProfile(res.data);
        setEditData({ name: res.data.name || '', phone: res.data.phone || '' });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfile(user);
        setEditData({ name: user?.name || '', phone: user?.phone || '' });
      } finally {
        setProfileLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('https://bookmyvibe.onrender.com/api/bookings/my-bookings', {
          withCredentials: true
        });
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editData.name.trim()) {
      toast.error('Name is required', { id: 'profile-error' });
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put('https://bookmyvibe.onrender.com/api/users/profile', editData, { withCredentials: true });
      setProfile(res.data);
      login(res.data); // Update AuthContext + localStorage
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile', { id: 'profile-error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Please login</div>;

  const displayUser = profile || user;

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Welcome back, {displayUser.name}!</p>
      </div>

      {/* Personal Info */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--accent-1)', margin: 0 }}>Personal Information</h2>
          {!editing && (
            <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {profileLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        ) : editing ? (
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" className="form-control" value={editData.name} onChange={handleEditChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={displayUser.email} disabled style={{ opacity: 0.5 }} />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="form-control" value={editData.phone} onChange={handleEditChange} placeholder="Enter your phone number" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setEditData({ name: displayUser.name || '', phone: displayUser.phone || '' }); }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{displayUser.name}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{displayUser.email}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Phone</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{displayUser.phone || 'Not provided'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Joined</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bookings */}
      <div className="dashboard-section glass-panel" style={{padding: '2rem'}}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-1)' }}>My Bookings</h2>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You have no bookings yet.</p>
            <Link to="/events" className="btn btn-primary">Explore Events</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <React.Fragment key={booking._id}>
                    <tr>
                      <td>{booking.event?.title || 'Unknown Event'}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.time || '-'}</td>
                      <td>₹{booking.event?.price || '-'}</td>
                      <td>
                        <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setExpandedId(expandedId === booking._id ? null : booking._id)}
                          className="btn btn-outline"
                          style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}
                        >
                          {expandedId === booking._id ? 'Hide' : 'View Details'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === booking._id && (
                      <tr>
                        <td colSpan="6" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderTop: 'none' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Event</p>
                              <p style={{ fontWeight: '500' }}>{booking.event?.title}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Category</p>
                              <p style={{ fontWeight: '500' }}>{booking.event?.category || '-'}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Phone</p>
                              <p style={{ fontWeight: '500' }}>{booking.phone}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Address</p>
                              <p style={{ fontWeight: '500' }}>
                                {booking.address?.line1}, {booking.address?.area}, {booking.address?.cityState}
                              </p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Booked On</p>
                              <p style={{ fontWeight: '500' }}>{new Date(booking.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Link to={`/events/${booking.event?._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                              Go to Event Page
                            </Link>
                            {(() => {
                              const eventDateTime = new Date(booking.date);
                              if (booking.time) {
                                const [h, m] = booking.time.split(':');
                                eventDateTime.setHours(parseInt(h), parseInt(m), 0, 0);
                              }
                              const hoursLeft = (eventDateTime - new Date()) / (1000 * 60 * 60);
                              const canEdit = hoursLeft >= 24;

                              return canEdit ? (
                                <Link to={`/booking/edit/${booking._id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                  Edit Booking
                                </Link>
                              ) : (
                                <button disabled className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: 0.4, cursor: 'not-allowed' }} title="Editing is locked within 24 hours of the event">
                                  Edit Locked
                                </button>
                              );
                            })()}
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

export default UserDashboard;

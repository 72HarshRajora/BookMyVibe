import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`https://bookmyvibe.onrender.com/api/admin/users/${id}`, { withCredentials: true });
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (authUser && authUser.role === 'admin') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [id, authUser]);

  if (loading) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Loading profile...</div>;
  if (!authUser || authUser.role !== 'admin') return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Admin Access Only</div>;
  if (error || !profileData) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>{error || 'Profile not found'}</div>;

  const { user, events, bookings } = profileData;

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <h1>{user.role === 'vendor' ? 'Vendor Profile' : 'User Profile'}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-1)' }}>Personal Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.name}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Phone Number</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.phone || 'Not provided'}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Role</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Joined Date</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {user.role === 'vendor' && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-1)' }}>Created Events / Services</h2>
          {events.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>This vendor has not created any events yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id}>
                      <td>
                        <img src={event.imageUrl} alt={event.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td>{event.title}</td>
                      <td>{event.category}</td>
                      <td>₹{event.price}</td>
                      <td>{event.availability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-1)' }}>
          {user.role === 'vendor' ? 'Bookings Received' : 'Booking History'}
        </h2>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No bookings found.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {user.role === 'vendor' && <th>Customer</th>}
                  <th>Event Name</th>
                  <th>Event Date/Time</th>
                  <th>Location</th>
                  <th>Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    {user.role === 'vendor' && (
                      <td>
                        {booking.user?.name}<br/>
                        <small style={{color: 'var(--text-secondary)'}}>{booking.user?.email}</small>
                      </td>
                    )}
                    <td>{booking.event?.title || 'Unknown Event'}</td>
                    <td>{new Date(booking.date).toLocaleDateString()} {booking.time ? `at ${booking.time}` : ''}</td>
                    <td>{booking.address?.line1 || booking.addressLine}, {booking.address?.area || booking.area}, {booking.address?.cityState || booking.cityState}</td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminUserProfile;

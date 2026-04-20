import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, vendors: 0, bookings: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await axios.get('https://bookmyvibe.onrender.com/api/admin/dashboard', { withCredentials: true });
        setStats(res.data.stats || { users: 0, vendors: 0, bookings: 0 });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Error fetching admin data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'admin') fetchAdminData();
  }, [user]);

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await axios.delete(`https://bookmyvibe.onrender.com/api/admin/users/${userId}`, { withCredentials: true });
      setUsers(users.filter(u => u._id !== userId));
      setStats(prev => ({ ...prev, [activeTab === 'users' ? 'users' : 'vendors']: prev[activeTab === 'users' ? 'users' : 'vendors'] - 1 }));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleView = (u) => {
    navigate(`/admin/profile/${u._id}`);
  };

  if (!user || user.role !== 'admin') return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Admin Access Only</div>;

  const filteredUsers = users
    .filter(u => activeTab === 'all' || (activeTab === 'users' ? u.role === 'user' : u.role === 'vendor'))
    .filter(u => 
      searchTerm === '' || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Control Panel</h1>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card glass-panel">
          <span className="stat-title">Total Users</span>
          <span className="stat-value">{stats.users}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-title">Total Vendors</span>
          <span className="stat-value">{stats.vendors}</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-title">Total Bookings</span>
          <span className="stat-value">{stats.bookings}</span>
        </div>
      </div>

      <div className="dashboard-section glass-panel" style={{padding: '2rem'}}>
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('users'); setVisibleCount(10); setSearchTerm(''); }}
          >
            Manage Users
          </button>
          <button 
            className={`btn ${activeTab === 'vendors' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('vendors'); setVisibleCount(10); setSearchTerm(''); }}
          >
            Manage Vendors
          </button>
        </div>

        <div className="search-bar">
          <input 
            type="text" 
            className="form-control" 
            placeholder={`Search ${activeTab}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, visibleCount).map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="status-badge" style={{background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-1)'}}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleView(u)} className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem'}}>View</button>
                    <button onClick={() => handleDelete(u._id, u.name)} className="btn btn-danger" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <p style={{textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)'}}>No users found.</p>}
        </div>
        
        {visibleCount < filteredUsers.length && (
          <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
            <button className="btn btn-outline" onClick={() => setVisibleCount(prev => prev + 10)}>
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

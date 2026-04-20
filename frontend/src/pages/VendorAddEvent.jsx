import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css'; // Reuse form styles

const VendorAddEvent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'DJ',
    availability: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'vendor') {
      toast.error('Only vendors can add events');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post('https://bookmyvibe.onrender.com/api/events', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Event/Service created successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Add New Event/Service</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Title</label>
            <input 
              type="text" 
              name="title" 
              className="form-control" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select 
              name="category" 
              className="form-control" 
              value={formData.category} 
              onChange={handleChange}
              required
            >
              <option value="DJ">DJ</option>
              <option value="Food">Food / Catering</option>
              <option value="Decorator">Decorator</option>
              <option value="Lighting">Lighting</option>
              <option value="Other">Other Services</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              className="form-control" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              className="form-control" 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              required 
            ></textarea>
          </div>

          <div className="form-group">
            <label>Availability / Timings</label>
            <input 
              type="text" 
              name="availability" 
              className="form-control" 
              placeholder="e.g. Weekends, 6PM - 12AM"
              value={formData.availability} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Upload Image</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*" 
              onChange={handleImageChange} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Service'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/vendor/dashboard')} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorAddEvent;

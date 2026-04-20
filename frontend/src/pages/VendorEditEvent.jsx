import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css'; // Reuse form styles

const VendorEditEvent = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'DJ',
    availability: '',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`https://bookmyvibe.onrender.com/api/events/${id}`);
        const event = res.data.event;
        setFormData({
          title: event.title,
          description: event.description,
          price: event.price,
          category: event.category,
          availability: event.availability || '',
        });
      } catch (err) {
        toast.error('Failed to fetch event data');
        navigate('/vendor/dashboard');
      } finally {
        setFetching(false);
      }
    };
    if (user && user.role === 'vendor') {
      fetchEvent();
    } else {
      navigate('/');
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'vendor') {
      toast.error('Only vendors can edit events');
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

      await axios.put(`https://bookmyvibe.onrender.com/api/events/${id}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Event/Service updated successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Edit Event/Service</h1>
        
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
            <label>Update Image (Optional)</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Service'}
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

export default VendorEditEvent;

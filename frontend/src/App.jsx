import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorAddEvent from './pages/VendorAddEvent';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserProfile from './pages/AdminUserProfile';
import BookingEdit from './pages/BookingEdit';
import VendorEditEvent from './pages/VendorEditEvent';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/profile" element={<UserDashboard />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/add-event" element={<VendorAddEvent />} />
          <Route path="/vendor/edit-event/:id" element={<VendorEditEvent />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile/:id" element={<AdminUserProfile />} />
          <Route path="/booking/edit/:id" element={<BookingEdit />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;

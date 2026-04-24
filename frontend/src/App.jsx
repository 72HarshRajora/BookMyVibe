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
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor/add-event" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorAddEvent />
            </ProtectedRoute>
          } />
          <Route path="/vendor/edit-event/:id" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorEditEvent />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserProfile />
            </ProtectedRoute>
          } />
          <Route path="/booking/edit/:id" element={
            <ProtectedRoute>
              <BookingEdit />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;

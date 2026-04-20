const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://bookmyvibepro.vercel.app',
    'https://bookmyvibepro.vercel.app/'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('BookMyVibe API is running');
});

// Routes (to be added)
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/vendor', require('./src/routes/vendorRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

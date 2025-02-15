const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const servicesRoutes = require('./routes/services');
const customerRoutes = require('./routes/customer');
const bookingRoutes = require('./routes/booking');
const searchRoutes = require('./routes/searchRoute');
const dashboardRoutes = require('./routes/dashboard')

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Home Service API is running');
});
// Routes
app.use('/api/services', servicesRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
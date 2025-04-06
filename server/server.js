const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS middleware - simplest possible configuration 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Other middleware
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies

// Import routes
const airportsRouter = require('./api/routes/airports');
const securityRouter = require('./api/routes/security');
const amenitiesRouter = require('./api/routes/amenities');
const flightsRouter = require('./api/routes/flights');

// API routes
app.use('/api/airports', airportsRouter);
app.use('/api/security', securityRouter);
app.use('/api/amenities', amenitiesRouter);
app.use('/api/flights', flightsRouter);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
const express = require('express');
const router = express.Router();

// Get flights for an airport
router.get('/:airport', (req, res) => {
  const { airport } = req.params;
  
  // For MVP, return mock data
  const flights = [
    {
      id: 'UA123',
      airline: 'United Airlines',
      flightNumber: 'UA123',
      origin: 'SFO',
      destination: 'LAX',
      scheduledDeparture: '2025-02-24T10:30:00Z',
      gate: 'A1',
      status: 'On Time'
    },
    {
      id: 'AA456',
      airline: 'American Airlines',
      flightNumber: 'AA456',
      origin: 'SFO',
      destination: 'JFK',
      scheduledDeparture: '2025-02-24T11:45:00Z',
      gate: 'B2',
      status: 'Delayed'
    }
  ];
  
  res.json(flights);
});

module.exports = router;
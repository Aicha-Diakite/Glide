const express = require('express');
const router = express.Router();

const airportsRouter = require('./api/routes/airports');
const authRouter = require('./api/routes/auth');
const securityRouter = require('./api/routes/security');
const amenitiesRouter = require('./api/routes/amenities');
const flightsRouter = require('./api/routes/flights');

router.get('/test', (req, res) => {
  res.json({ message: 'API routes are working!' });
});

router.use('/security', securityRouter);
router.use('/amenities', amenitiesRouter);
router.use('/flights', flightsRouter);
router.use('/auth', authRouter);

const path = require('path');
const fs = require('fs').promises;
const pathfindingService = require('./services/pathfindingService');

router.post('/airports/:code/routes', async (req, res) => {
  const { code } = req.params;
  const { start, end, floor } = req.body;

  try {
    const filePath = path.join(__dirname, 'data', 'airports', code, 'floors', `${floor}.json`);
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const route = pathfindingService.findRoute(data, start, end);

    if (route.distance === Infinity || route.path.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: 'Unable to calculate route' });
  }
});

module.exports = router;
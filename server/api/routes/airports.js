const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Cache airports list in memory for quick access
let airportsCache = null;

// Get list of supported airports
router.get('/', async (req, res) => {
  try {
    // If we have the data cached, return it
    if (airportsCache) {
      return res.json(airportsCache);
    }

    // Otherwise, read airports data from the data directory
    const airportsDir = path.join(__dirname, '../../../data/airports');
    const airports = await fs.readdir(airportsDir);
    
    // For each airport, read its info file if available
    const airportsList = await Promise.all(
      airports.map(async (code) => {
        try {
          const infoPath = path.join(airportsDir, code, 'info.json');
          const infoData = await fs.readFile(infoPath, 'utf8');
          return JSON.parse(infoData);
        } catch (err) {
          // If no info file, just return the code
          return { code, name: code.toUpperCase() };
        }
      })
    );

    // Cache the result
    airportsCache = airportsList;
    
    res.json(airportsList);
  } catch (err) {
    console.error('Error fetching airports:', err);
    res.status(500).json({ message: 'Error fetching airports data' });
  }
});

// Get specific airport data (including gates, terminals, etc.)
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const airportPath = path.join(__dirname, `../../../data/airports/${code.toLowerCase()}`);
    
    // Check if airport exists
    try {
      await fs.access(airportPath);
    } catch (err) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    
    // Read airport data files
    const [infoData, gatesData, amenitiesData] = await Promise.all([
      fs.readFile(path.join(airportPath, 'info.json'), 'utf8')
        .catch(() => '{}'), // Default to empty object if file doesn't exist
      fs.readFile(path.join(airportPath, 'gates.json'), 'utf8')
        .catch(() => '[]'),
      fs.readFile(path.join(airportPath, 'amenities.json'), 'utf8')
        .catch(() => '[]')
    ]);
    
    // Combine all airport data
    const airportData = {
      ...JSON.parse(infoData),
      gates: JSON.parse(gatesData),
      amenities: JSON.parse(amenitiesData)
    };
    
    res.json(airportData);
  } catch (err) {
    console.error(`Error fetching airport ${req.params.code}:`, err);
    res.status(500).json({ message: 'Error fetching airport data' });
  }
});

// Get floor-level data for specific airport
router.get('/:code/floors/:floor', async (req, res) => {
  try {
    const { code, floor } = req.params;
    const floorPath = path.join(
      __dirname, 
      `../../../data/airports/${code.toLowerCase()}/floors/${floor}.json`
    );
    
    // Check if floor data exists
    try {
      await fs.access(floorPath);
    } catch (err) {
      return res.status(404).json({ message: 'Floor data not found' });
    }
    
    // Read floor data
    const floorData = await fs.readFile(floorPath, 'utf8');
    res.json(JSON.parse(floorData));
  } catch (err) {
    console.error(`Error fetching floor data for ${req.params.code}:`, err);
    res.status(500).json({ message: 'Error fetching floor data' });
  }
});

module.exports = router;
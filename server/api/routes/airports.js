const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const pathfindingService = require('../../services/pathfindingService');

// Get list of supported airports
router.get('/', async (req, res) => {
  try {
    // Read airports data from the data directory
    const airportsDir = path.join(__dirname, '../../../data/airports');
    
    // Check if directory exists
    try {
      await fs.access(airportsDir);
    } catch (err) {
      console.error('Airports directory not found:', err);
      return res.status(404).json({ 
        message: 'Airports data directory not found',
        error: err.message 
      });
    }
    
    // Read the directory to get all airport codes
    const airports = await fs.readdir(airportsDir);
    
    // For each airport, read its info file if available
    const airportsList = await Promise.all(
      airports.map(async (code) => {
        try {
          const infoPath = path.join(airportsDir, code, 'info.json');
          const infoData = await fs.readFile(infoPath, 'utf8');
          return JSON.parse(infoData);
        } catch (err) {
          console.error(`Error reading info for airport ${code}:`, err);
          // If no info file, just return the code
          return { code, name: code.toUpperCase() };
        }
      })
    );
    
    res.json(airportsList);
  } catch (err) {
    console.error('Error fetching airports:', err);
    res.status(500).json({ 
      message: 'Error fetching airports data',
      error: err.message
    });
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

// Calculate route between two points in an airport
router.post('/:code/route', async (req, res) => {
  try {
    const { code } = req.params;
    const { floor, start, end, stops = [] } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({ 
        message: 'Start and end points are required' 
      });
    }
    
    // Handle "current_location" as a special case
    let startPoint = start;
    if (start === 'current_location') {
      // In a real app, we would use geolocation data
      // For MVP, we'll use a default entry point for the terminal
      const terminals = await getAirportTerminals(code);
      if (terminals && terminals.length > 0) {
        // Use the main entrance of the first terminal as default starting point
        startPoint = `entrance-${terminals[0].id}`;
      } else {
        return res.status(400).json({ 
          message: 'Could not determine current location' 
        });
      }
    }
    
    // Read floor data to get the nodes and connections
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
    
    // Read and parse floor data
    const floorDataRaw = await fs.readFile(floorPath, 'utf8');
    const floorData = JSON.parse(floorDataRaw);
    
    // Build graph from floor data
    const graph = pathfindingService.buildGraph(floorData);
    
    // Calculate optimal route
    const route = pathfindingService.optimizeRoute(graph, startPoint, end, stops);
    
    // If no route was found
    if (route.distance === Infinity || route.path.length === 0) {
      return res.status(404).json({ 
        message: 'No valid route found between the selected points' 
      });
    }
    
    // Enrich the path with node details
    const nodesMap = {};
    floorData.nodes.forEach(node => {
      nodesMap[node.id] = node;
    });
    
    const enhancedPath = route.path.map(nodeId => {
      const node = nodesMap[nodeId];
      if (node) {
        return {
          id: nodeId,
          name: node.name,
          type: node.type,
          coordinates: node.coordinates,
          terminal: node.terminal
        };
      }
      return { id: nodeId };
    });
    
    res.json({
      path: route.path,
      enhancedPath,
      distance: route.distance,
      estimatedTimeMinutes: Math.round(route.distance / 84), // Assuming 1.4m/s walking speed
      floor
    });
  } catch (err) {
    console.error(`Error calculating route for ${req.params.code}:`, err);
    res.status(500).json({ message: 'Error calculating route' });
  }
});

// Get available destination types for an airport
router.get('/:code/destination-types', async (req, res) => {
  try {
    const { code } = req.params;
    const { floor } = req.query;
    
    if (!floor) {
      return res.status(400).json({ message: 'Floor parameter is required' });
    }
    
    // Read floor data to get the nodes
    const floorPath = path.join(
      __dirname, 
      `../../../data/airports/${code.toLowerCase()}/floors/${floor}.json`
    );
    
    try {
      await fs.access(floorPath);
    } catch (err) {
      return res.status(404).json({ message: 'Floor data not found' });
    }
    
    // Read and parse floor data
    const floorDataRaw = await fs.readFile(floorPath, 'utf8');
    const floorData = JSON.parse(floorDataRaw);
    
    // Extract unique destination types
    const types = [...new Set(floorData.nodes.map(node => node.type))];
    
    res.json({ types });
  } catch (err) {
    console.error(`Error fetching destination types for ${req.params.code}:`, err);
    res.status(500).json({ message: 'Error fetching destination types' });
  }
});

// Helper function to get terminals for an airport
async function getAirportTerminals(code) {
  try {
    const infoPath = path.join(
      __dirname,
      `../../../data/airports/${code.toLowerCase()}/info.json`
    );
    
    const infoData = await fs.readFile(infoPath, 'utf8');
    const airportInfo = JSON.parse(infoData);
    
    return airportInfo.terminals || [];
  } catch (err) {
    console.error(`Error fetching terminals for ${code}:`, err);
    return [];
  }
}

module.exports = router;
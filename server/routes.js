// server/routes.js
const express = require('express');
const router = express.Router();

// Import route modules

const airportsRouter = require('./api/routes/airports');

// Log for debugging
console.log('Setting up airport routes');

const securityRouter = require('./api/routes/security');
const amenitiesRouter = require('./api/routes/amenities');
const flightsRouter = require('./api/routes/flights');

// Set up API routes
router.use('/airports', airportsRouter);

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'API routes are working!' });
  });
  
router.use('/security', securityRouter);
router.use('/amenities', amenitiesRouter);
router.use('/flights', flightsRouter);

// Custom route for pathfinding/routes
const path = require('path');
const fs = require('fs').promises;
const pathfindingService = require('./services/pathfindingService');

// Calculate route between two points in an airport
router.post('/airports/:code/route', async (req, res) => {
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
      const infoPath = path.join(__dirname, `../data/airports/${code.toLowerCase()}/info.json`);
      const infoData = await fs.readFile(infoPath, 'utf8');
      const airportInfo = JSON.parse(infoData);
      
      if (airportInfo.terminals && airportInfo.terminals.length > 0) {
        // Use the main entrance of the first terminal as default starting point
        startPoint = `entrance-${airportInfo.terminals[0].id}`;
      } else {
        return res.status(400).json({ 
          message: 'Could not determine current location' 
        });
      }
    }
    
    // Read floor data to get the nodes and connections
    const floorPath = path.join(
      __dirname, 
      `../data/airports/${code.toLowerCase()}/floors/${floor}.json`
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

module.exports = router;
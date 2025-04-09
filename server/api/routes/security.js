const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache wait times to reduce API calls (5 minute TTL)
const waitTimesCache = new NodeCache({ stdTTL: 300 });

// Get security wait times for an airport
router.get('/:airport/wait-times', async (req, res) => {
  try {
    const { airport } = req.params;
    
    // Check if we have cached data
    const cacheKey = `wait-times-${airport}`;
    const cachedData = waitTimesCache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // TSA doesn't have a public API, but airports often expose this data
    // For this MVP, we'll attempt to fetch from a real airport API if available
    // or use realistic calculated data based on flight schedules and time of day
    
    let waitTimes = [];
    
    try {
      // Attempt to get real wait time data if available
      switch(airport.toLowerCase()) {
        case 'sfo':
          // SFO exposes wait times through their API
          waitTimes = await fetchSFOWaitTimes();
          break;
        case 'jfk':
          waitTimes = await fetchJFKWaitTimes();
          break;
        case 'ord':
          waitTimes = await fetchORDWaitTimes();
          break;
        default:
          // For other airports, use the flightaware/flightstats API or calculate based on historical data
          waitTimes = await calculateEstimatedWaitTimes(airport);
      }
    } catch (apiErr) {
      console.error(`Error fetching real wait time data for ${airport}:`, apiErr);
      // Fall back to calculated data
      waitTimes = await calculateEstimatedWaitTimes(airport);
    }
    
    // Cache the results
    waitTimesCache.set(cacheKey, waitTimes);
    
    res.json(waitTimes);
  } catch (err) {
    console.error(`Error processing wait times for ${req.params.airport}:`, err);
    res.status(500).json({ message: 'Error fetching security wait times' });
  }
});

// Fetch wait times for SFO airport
async function fetchSFOWaitTimes() {
  // In a real implementation, this would call the actual SFO API
  // For demonstration, we'll use the airport data we already have
  try {
    // Read the terminals from our floor data
    const airportData = require('../../../data/airports/sfo/info.json');
    const terminals = airportData.terminals || [];
    
    // Get current time to generate realistic wait times based on time of day
    const now = new Date();
    const hour = now.getHours();
    
    // Morning rush (6-9 AM), midday lull (10 AM-2 PM), afternoon rush (3-7 PM), evening (8 PM+)
    let baseWaitTime;
    if (hour >= 6 && hour <= 9) {
      baseWaitTime = 25; // Morning rush
    } else if (hour >= 15 && hour <= 19) {
      baseWaitTime = 22; // Afternoon rush
    } else if (hour >= 10 && hour <= 14) {
      baseWaitTime = 15; // Midday
    } else {
      baseWaitTime = 10; // Evening or early morning
    }
    
    // Generate wait times for each terminal
    return terminals.map(terminal => {
      // Add some randomness to make it realistic (±30%)
      const randomFactor = 0.7 + (Math.random() * 0.6);
      const waitMinutes = Math.floor(baseWaitTime * randomFactor);
      
      // Determine status based on wait time
      let status;
      if (waitMinutes < 15) {
        status = 'low';
      } else if (waitMinutes < 30) {
        status = 'medium';
      } else {
        status = 'high';
      }
      
      return {
        id: `security-${terminal.id}`,
        checkpoint: `${terminal.name} Security`,
        waitMinutes,
        status,
        lastUpdated: new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Error generating SFO wait times:', err);
    throw err;
  }
}

// Fetch wait times for JFK airport
async function fetchJFKWaitTimes() {
  // Similar implementation to SFO but for JFK
  // In a real implementation, this would call JFK's API
  // For now, we'll generate realistic data
  
  const terminals = [
    { id: 'terminal-1', name: 'Terminal 1' },
    { id: 'terminal-4', name: 'Terminal 4' },
    { id: 'terminal-5', name: 'Terminal 5' },
    { id: 'terminal-7', name: 'Terminal 7' },
    { id: 'terminal-8', name: 'Terminal 8' }
  ];
  
  // Get current time to generate realistic wait times based on time of day
  const now = new Date();
  const hour = now.getHours();
  
  // JFK tends to have higher wait times than average
  let baseWaitTime;
  if (hour >= 6 && hour <= 9) {
    baseWaitTime = 30; // Morning rush
  } else if (hour >= 15 && hour <= 19) {
    baseWaitTime = 35; // Afternoon/evening rush
  } else if (hour >= 10 && hour <= 14) {
    baseWaitTime = 20; // Midday
  } else {
    baseWaitTime = 15; // Evening or early morning
  }
  
  // Generate wait times for each terminal
  return terminals.map(terminal => {
    // Add some randomness to make it realistic (±30%)
    const randomFactor = 0.7 + (Math.random() * 0.6);
    const waitMinutes = Math.floor(baseWaitTime * randomFactor);
    
    // Determine status based on wait time
    let status;
    if (waitMinutes < 15) {
      status = 'low';
    } else if (waitMinutes < 30) {
      status = 'medium';
    } else {
      status = 'high';
    }
    
    return {
      id: `security-${terminal.id}`,
      checkpoint: `${terminal.name} Security`,
      waitMinutes,
      status,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Fetch wait times for ORD (Chicago O'Hare) airport
async function fetchORDWaitTimes() {
  // Similar implementation for ORD
  const terminals = [
    { id: 'terminal-1', name: 'Terminal 1' },
    { id: 'terminal-2', name: 'Terminal 2' },
    { id: 'terminal-3', name: 'Terminal 3' },
    { id: 'terminal-5', name: 'Terminal 5' }
  ];
  
  // Get current time to generate realistic wait times based on time of day
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // O'Hare is busiest on Mondays and Fridays
  let dayMultiplier = 1;
  if (day === 1 || day === 5) {
    dayMultiplier = 1.3;
  } else if (day === 0 || day === 6) {
    dayMultiplier = 0.9; // Slightly less busy on weekends
  }
  
  let baseWaitTime;
  if (hour >= 6 && hour <= 9) {
    baseWaitTime = 27 * dayMultiplier; // Morning rush
  } else if (hour >= 15 && hour <= 19) {
    baseWaitTime = 32 * dayMultiplier; // Afternoon/evening rush
  } else if (hour >= 10 && hour <= 14) {
    baseWaitTime = 18 * dayMultiplier; // Midday
  } else {
    baseWaitTime = 12 * dayMultiplier; // Evening or early morning
  }
  
  // Generate wait times for each terminal
  return terminals.map(terminal => {
    // Add some randomness to make it realistic (±30%)
    const randomFactor = 0.7 + (Math.random() * 0.6);
    const waitMinutes = Math.floor(baseWaitTime * randomFactor);
    
    // Determine status based on wait time
    let status;
    if (waitMinutes < 15) {
      status = 'low';
    } else if (waitMinutes < 30) {
      status = 'medium';
    } else {
      status = 'high';
    }
    
    return {
      id: `security-${terminal.id}`,
      checkpoint: `${terminal.name} Security`,
      waitMinutes,
      status,
      lastUpdated: new Date().toISOString()
    };
  });
}

// Calculate estimated wait times based on flight schedules and historical data
async function calculateEstimatedWaitTimes(airportCode) {
  try {
    // In a real implementation, this would integrate with:
    // 1. FlightAware or similar API to get flight volumes
    // 2. Historical wait time patterns
    // 3. Airport-specific factors
    
    // For MVP demo purposes, we'll generate realistic data based on time of day
    
    // Get current time to generate realistic wait times based on time of day
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Base wait time depends on time of day
    let baseWaitTime;
    if (hour >= 6 && hour <= 9) {
      baseWaitTime = 25; // Morning rush
    } else if (hour >= 15 && hour <= 19) {
      baseWaitTime = 28; // Afternoon/evening rush
    } else if (hour >= 10 && hour <= 14) {
      baseWaitTime = 18; // Midday
    } else {
      baseWaitTime = 12; // Evening or early morning
    }
    
    // Adjust for day of week - busier on Monday and Friday
    if (day === 1 || day === 5) {
      baseWaitTime *= 1.2;
    } else if (day === 0 || day === 6) {
      baseWaitTime *= 0.9; // Slightly less busy on weekends
    }
    
    // Default terminals if we don't have specific data
    const terminals = [
      { id: 'main', name: 'Main Terminal' },
      { id: 'north', name: 'North Terminal' },
      { id: 'south', name: 'South Terminal' }
    ];
    
    // Generate wait times for each terminal
    return terminals.map(terminal => {
      // Add some randomness to make it realistic (±30%)
      const randomFactor = 0.7 + (Math.random() * 0.6);
      const waitMinutes = Math.floor(baseWaitTime * randomFactor);
      
      // Determine status based on wait time
      let status;
      if (waitMinutes < 15) {
        status = 'low';
      } else if (waitMinutes < 30) {
        status = 'medium';
      } else {
        status = 'high';
      }
      
      return {
        id: `security-${terminal.id}`,
        checkpoint: `${terminal.name} Security`,
        waitMinutes,
        status,
        lastUpdated: new Date().toISOString()
      };
    });
  } catch (err) {
    console.error(`Error calculating wait times for ${airportCode}:`, err);
    throw err;
  }
}

module.exports = router;
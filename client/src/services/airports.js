import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = '/api';

/**
 * Fetch list of available airports
 * @returns {Promise<Array>} List of airports
 */
export const fetchAirports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airports`);
    return response.data;
  } catch (error) {
    console.error('Error fetching airports:', error);
    
    // Mock data for MVP in case API fails
    return [
      { code: "sfo", name: "San Francisco International Airport" },
      { code: "jfk", name: "JFK International Airport" },
      { code: "ord", name: "O'Hare International Airport" }
    ];
  }
};

/**
 * Fetch data for a specific airport
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @returns {Promise<Object>} Airport data including floors, terminals, etc.
 */
export const fetchAirportData = async (airportCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airports/${airportCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching airport data for ${airportCode}:`, error);
    
    // Mock data for MVP in case API fails
    return {
      code: airportCode,
      name: `${airportCode.toUpperCase()} International Airport`,
      floors: [
        { id: "1", name: "Level 1 - Arrivals" },
        { id: "2", name: "Level 2 - Departures" },
        { id: "3", name: "Level 3 - Food Court" }
      ],
      terminals: [
        { id: "terminal-1", name: "Terminal 1" },
        { id: "terminal-2", name: "Terminal 2" },
        { id: "terminal-3", name: "Terminal 3" },
        { id: "international", name: "International Terminal" }
      ]
    };
  }
};

/**
 * Fetch data for a specific floor in an airport
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @param {string} floorId Floor ID (e.g., "2")
 * @returns {Promise<Object>} Floor data including nodes, connections, etc.
 */
export const fetchFloorData = async (airportCode, floorId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airports/${airportCode}/floors/${floorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching floor data for ${airportCode}/${floorId}:`, error);
    
    // Mock data for MVP in case API fails
    return {
      id: floorId,
      name: `Level ${floorId}`,
      airport: airportCode,
      center: [-122.3875, 37.6175],
      defaultZoom: 16,
      outline: {
        type: "Polygon",
        coordinates: [
          [
            [-122.3935, 37.6155],
            [-122.3935, 37.6195],
            [-122.3815, 37.6195],
            [-122.3815, 37.6155],
            [-122.3935, 37.6155]
          ]
        ]
      },
      nodes: [
        {
          id: "gate-a1",
          name: "Gate A1",
          type: "gate",
          terminal: "terminal-1",
          coordinates: [-122.3920, 37.6180]
        },
        {
          id: "gate-b2",
          name: "Gate B2",
          type: "gate",
          terminal: "terminal-2",
          coordinates: [-122.3880, 37.6185]
        },
        {
          id: "restaurant-1",
          name: "Napa Farms Market",
          type: "restaurant",
          terminal: "terminal-2",
          coordinates: [-122.3885, 37.6175]
        },
        {
          id: "bathroom-t1",
          name: "Terminal 1 Restroom",
          type: "bathroom",
          terminal: "terminal-1",
          coordinates: [-122.3918, 37.6172]
        },
        {
          id: "shop-1",
          name: "InMotion Entertainment",
          type: "shop",
          terminal: "terminal-2",
          coordinates: [-122.3880, 37.6176]
        },
        {
          id: "security-t1",
          name: "Terminal 1 Security",
          type: "security",
          terminal: "terminal-1",
          coordinates: [-122.3925, 37.6170]
        },
        {
          id: "junction-t1-main",
          name: "Terminal 1 Junction",
          type: "junction",
          coordinates: [-122.3922, 37.6175]
        },
        {
          id: "junction-central",
          name: "Central Junction",
          type: "junction",
          coordinates: [-122.3885, 37.6165]
        }
      ],
      connections: [
        {
          from: "gate-a1",
          to: "junction-t1-main",
          distance: 50,
          oneWay: false
        },
        {
          from: "junction-t1-main",
          to: "bathroom-t1",
          distance: 15,
          oneWay: false
        },
        {
          from: "junction-t1-main",
          to: "security-t1",
          distance: 40,
          oneWay: false
        },
        {
          from: "security-t1",
          to: "junction-central",
          distance: 80,
          oneWay: false
        },
        {
          from: "junction-central",
          to: "restaurant-1",
          distance: 35,
          oneWay: false
        },
        {
          from: "restaurant-1",
          to: "shop-1",
          distance: 20,
          oneWay: false
        },
        {
          from: "gate-b2",
          to: "shop-1",
          distance: 30,
          oneWay: false
        }
      ]
    };
  }
};
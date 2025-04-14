import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = '/api';

/**
 * Fetch security wait times for a specific airport
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @returns {Promise<Array>} List of security checkpoints with wait times
 */
export const fetchSecurityWaitTimes = async (airportCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/security/${airportCode}/wait-times`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching security wait times for ${airportCode}:`, error);
    
    // Mock data for MVP in case API fails
    return generateMockWaitTimes(airportCode);
  }
};

/**
 * Generate realistic mock wait times based on time of day
 * @param {string} airportCode Airport code
 * @returns {Array} Mock wait time data
 */
const generateMockWaitTimes = (airportCode) => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Base wait times depend on time of day
  let baseWaitTime;
  if (hour >= 6 && hour <= 9) {
    baseWaitTime = 25; // Morning rush
  } else if (hour >= 15 && hour <= 19) {
    baseWaitTime = 22; // Afternoon/evening rush
  } else if (hour >= 10 && hour <= 14) {
    baseWaitTime = 15; // Midday
  } else {
    baseWaitTime = 10; // Evening or early morning
  }
  
  // Adjust for day of week - busier on Monday and Friday
  if (day === 1 || day === 5) {
    baseWaitTime *= 1.2;
  } else if (day === 0 || day === 6) {
    baseWaitTime *= 0.9; // Slightly less busy on weekends
  }
  
  // Define terminals based on airport
  let terminals;
  
  switch (airportCode.toLowerCase()) {
    case 'sfo':
      terminals = [
        { id: 'terminal-1', name: 'Terminal 1' },
        { id: 'terminal-2', name: 'Terminal 2' },
        { id: 'terminal-3', name: 'Terminal 3' },
        { id: 'international', name: 'International Terminal' }
      ];
      break;
    case 'jfk':
      terminals = [
        { id: 'terminal-1', name: 'Terminal 1' },
        { id: 'terminal-4', name: 'Terminal 4' },
        { id: 'terminal-5', name: 'Terminal 5' },
        { id: 'terminal-7', name: 'Terminal 7' },
        { id: 'terminal-8', name: 'Terminal 8' }
      ];
      break;
    case 'ord':
      terminals = [
        { id: 'terminal-1', name: 'Terminal 1' },
        { id: 'terminal-2', name: 'Terminal 2' },
        { id: 'terminal-3', name: 'Terminal 3' },
        { id: 'terminal-5', name: 'Terminal 5' }
      ];
      break;
    default:
      terminals = [
        { id: 'main', name: 'Main Terminal' },
        { id: 'north', name: 'North Terminal' },
        { id: 'south', name: 'South Terminal' }
      ];
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
};
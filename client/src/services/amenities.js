import axios from 'axios';

// Base URL for API endpoints
const API_BASE_URL = '/api';

/**
 * Fetch all amenities for a specific airport
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @returns {Promise<Array>} List of amenities
 */
export const fetchAmenities = async (airportCode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/amenities/${airportCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching amenities for ${airportCode}:`, error);
    
    // Mock data for MVP in case API fails
    return [
      {
        id: "restaurant-1",
        name: "Napa Farms Market",
        type: "restaurant",
        terminal: "terminal-2",
        floor: "2",
        coordinates: [-122.3885, 37.6175],
        details: {
          cuisine: "American",
          description: "Farm-to-table marketplace offering fresh, local ingredients and prepared foods.",
          hours: "5:00 AM - 11:00 PM",
          price: "$$",
          rating: 4.2,
          waitTime: 10,
          tags: ["breakfast", "lunch", "dinner", "healthy", "organic"]
        }
      },
      {
        id: "restaurant-2",
        name: "Burger Joint",
        type: "restaurant",
        terminal: "terminal-1",
        floor: "2",
        coordinates: [-122.3915, 37.6175],
        details: {
          cuisine: "Burgers",
          description: "Classic burgers, fries, and shakes in a casual setting.",
          hours: "6:00 AM - 10:00 PM",
          price: "$",
          rating: 3.8,
          waitTime: 15,
          tags: ["burgers", "fast food", "kid-friendly"]
        }
      },
      {
        id: "restaurant-3",
        name: "Peet's Coffee",
        type: "restaurant",
        terminal: "terminal-3",
        floor: "2",
        coordinates: [-122.3845, 37.6175],
        details: {
          cuisine: "Coffee",
          description: "Premium coffees, teas, and light snacks.",
          hours: "4:30 AM - 11:30 PM",
          price: "$",
          rating: 4.0,
          waitTime: 5,
          tags: ["coffee", "breakfast", "snacks"]
        }
      },
      {
        id: "bathroom-t1",
        name: "Terminal 1 Restroom",
        type: "bathroom",
        terminal: "terminal-1",
        floor: "2",
        coordinates: [-122.3918, 37.6172],
        details: {
          amenities: ["changing tables", "accessible stalls"],
          family_friendly: true
        }
      },
      {
        id: "bathroom-t2",
        name: "Terminal 2 Restroom",
        type: "bathroom",
        terminal: "terminal-2",
        floor: "2",
        coordinates: [-122.3878, 37.6172],
        details: {
          amenities: ["changing tables", "accessible stalls", "nursing room"],
          family_friendly: true
        }
      },
      {
        id: "shop-1",
        name: "InMotion Entertainment",
        type: "shop",
        terminal: "terminal-2",
        floor: "2",
        coordinates: [-122.3880, 37.6176],
        details: {
          category: "Electronics",
          description: "Electronics store offering headphones, travel accessories, and gadgets.",
          hours: "6:00 AM - 10:00 PM",
          rating: 3.9,
          tags: ["electronics", "headphones", "accessories"]
        }
      },
      {
        id: "lounge-1",
        name: "United Club",
        type: "lounge",
        terminal: "terminal-3",
        floor: "2",
        coordinates: [-122.3850, 37.6175],
        details: {
          airline: "United Airlines",
          description: "Exclusive lounge for United Airlines premium passengers and club members.",
          hours: "5:00 AM - 10:30 PM",
          rating: 4.1,
          amenities: ["WiFi", "Food", "Beverages", "Showers", "Business Center"]
        }
      },
      {
        id: "gate-a1",
        name: "Gate A1",
        type: "gate",
        terminal: "terminal-1",
        floor: "2",
        coordinates: [-122.3920, 37.6180]
      },
      {
        id: "gate-b2",
        name: "Gate B2",
        type: "gate",
        terminal: "terminal-2",
        floor: "2",
        coordinates: [-122.3880, 37.6185]
      }
    ];
  }
};

/**
 * Fetch amenities for a specific floor in an airport
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @param {string} floorId Floor ID (e.g., "2")
 * @returns {Promise<Array>} List of amenities on the floor
 */
export const fetchFloorAmenities = async (airportCode, floorId) => {
  try {
    const allAmenities = await fetchAmenities(airportCode);
    return allAmenities.filter(amenity => amenity.floor === floorId);
  } catch (error) {
    console.error(`Error fetching floor amenities for ${airportCode}/${floorId}:`, error);
    throw error;
  }
};

/**
 * Fetch amenities of a specific type
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @param {string} amenityType Type of amenity (e.g., "restaurant")
 * @param {string} floorId Optional floor ID to filter by
 * @returns {Promise<Array>} List of amenities of the specified type
 */
export const fetchAmenitiesByType = async (airportCode, amenityType, floorId = null) => {
  try {
    const allAmenities = await fetchAmenities(airportCode);
    
    // Filter by type and optionally by floor
    return allAmenities.filter(amenity => {
      if (amenity.type !== amenityType) return false;
      if (floorId && amenity.floor !== floorId) return false;
      return true;
    });
  } catch (error) {
    console.error(`Error fetching amenities by type for ${airportCode}:`, error);
    throw error;
  }
};

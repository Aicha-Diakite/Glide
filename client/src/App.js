import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './components/Map';
import Navigation from './components/Navigation';
import FilterMenu from './components/FilterMenu';
import WaitTimes from './components/WaitTimes';
import FlightInfo from './components/FlightInfo';
import './styles.css';

function App() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState('');
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sidebarView, setSidebarView] = useState('navigation'); // 'navigation', 'filter', or 'flights'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available airports on component mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/airports');
        setAirports(response.data);
        
        // Set default airport if available
        if (response.data.length > 0) {
          setSelectedAirport(response.data[0].code);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching airports:', err);
        setError('Failed to load airports data');
        
        // Fallback to hardcoded data for testing
        console.log("Using hardcoded data instead of API call");
        setAirports([
          { code: "sfo", name: "San Francisco International Airport" },
          { code: "jfk", name: "JFK International Airport" },
          { code: "ord", name: "O'Hare International Airport" }
        ]);
        setSelectedAirport("sfo");
        setFloors([
          { id: "1", name: "Level 1 - Arrivals" },
          { id: "2", name: "Level 2 - Departures" },
          { id: "3", name: "Level 3 - Food Court" }
        ]);
        setSelectedFloor("2");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAirports();
  }, []);

  // Fetch floors for selected airport
  useEffect(() => {
    if (!selectedAirport) return;
    
    const fetchFloors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/airports/${selectedAirport}`);
        
        // Extract available floors
        if (response.data.floors && response.data.floors.length > 0) {
          setFloors(response.data.floors);
          setSelectedFloor(response.data.floors[0].id);
        } else {
          // Fallback to default floor
          setFloors([{ id: '1', name: 'Floor 1' }]);
          setSelectedFloor('1');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching floors:', err);
        setError('Failed to load airport data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFloors();
  }, [selectedAirport]);

  // Handle airport selection change
  const handleAirportChange = (e) => {
    setSelectedAirport(e.target.value);
    setSelectedFloor('');
    setSelectedRoute(null);
  };

  // Handle floor selection change
  const handleFloorChange = (e) => {
    setSelectedFloor(e.target.value);
    setSelectedRoute(null);
  };

  // Handle route selection from Navigation component
  const handleRouteSelected = (route) => {
    setSelectedRoute(route);
  };

  // Handle filter changes from FilterMenu component
  const handleFilterChange = (filters) => {
    // This would apply filters to the map display
    console.log('Filters applied:', filters);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Glide</h1>
        <p>Airport Navigation Made Simple</p>
        
        <div className="location-selector">
          <div className="selector-group">
            <label htmlFor="airport-select">Airport:</label>
            <select
              id="airport-select"
              value={selectedAirport}
              onChange={handleAirportChange}
              disabled={loading || airports.length === 0}
            >
              {airports.map(airport => (
                <option key={airport.code} value={airport.code}>
                  {airport.name || airport.code}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label htmlFor="floor-select">Floor:</label>
            <select
              id="floor-select"
              value={selectedFloor}
              onChange={handleFloorChange}
              disabled={loading || floors.length === 0 || sidebarView === 'flights'}
            >
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name || `Floor ${floor.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="app-content">
        <div className="sidebar">
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${sidebarView === 'navigation' ? 'active' : ''}`}
              onClick={() => setSidebarView('navigation')}
            >
              Navigation
            </button>
            <button
              className={`tab-button ${sidebarView === 'filter' ? 'active' : ''}`}
              onClick={() => setSidebarView('filter')}
            >
              Filter
            </button>
            <button
              className={`tab-button ${sidebarView === 'flights' ? 'active' : ''}`}
              onClick={() => setSidebarView('flights')}
            >
              Flights
            </button>
          </div>
          
          <div className="sidebar-content">
            {sidebarView === 'navigation' && (
              <Navigation
                airport={selectedAirport}
                floor={selectedFloor}
                onRouteSelected={handleRouteSelected}
              />
            )}
            {sidebarView === 'filter' && (
              <FilterMenu
                airport={selectedAirport}
                floor={selectedFloor}
                onFilterChange={handleFilterChange}
              />
            )}
            {sidebarView === 'flights' && (
              <FlightInfo airport={selectedAirport} />
            )}
          </div>
          
          {sidebarView !== 'flights' && (
            <div className="wait-times-panel">
              <WaitTimes airport={selectedAirport} />
            </div>
          )}
        </div>
        
        <div className="map-section">
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          )}
          
          {!error && selectedAirport && selectedFloor && sidebarView !== 'flights' && (
            <Map
              airport={selectedAirport}
              floor={selectedFloor}
              selectedRoute={selectedRoute}
              onSelectDestination={(nodeId) => {
                if (sidebarView !== 'navigation') {
                  setSidebarView('navigation');
                }
                // This would be handled by the Navigation component
                // through a ref or context in a full implementation
              }}
            />
          )}
          
          {sidebarView === 'flights' && !error && (
            <div className="flight-map-container">
              <h3>Real-time Flight Tracking</h3>
              <p>Flight tracking visualization would appear here in the full implementation.</p>
              <p>For the MVP, we're focusing on in-airport navigation and flight information.</p>
            </div>
          )}
          
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading airport data...</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Glide - Simplifying Airport Navigation</p>
      </footer>
    </div>
  );
}

export default App;
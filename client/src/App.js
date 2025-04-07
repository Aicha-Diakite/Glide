import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './components/Map';
import Navigation from './components/Navigation';
import FilterMenu from './components/FilterMenu';
import WaitTimes from './components/WaitTimes';
import './styles.css';

function App() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState('');
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sidebarView, setSidebarView] = useState('navigation'); // 'navigation' or 'filter'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load hardcoded airports data
  useEffect(() => {
    console.log("Using hardcoded data instead of API call");
    setAirports([
      { code: "sfo", name: "San Francisco International Airport" },
      { code: "jfk", name: "JFK International Airport" },
      { code: "ord", name: "O'Hare International Airport" }
    ]);
    setSelectedAirport("sfo");
    setLoading(false);
  }, []);

  // Load hardcoded floors data when
  // Load hardcoded floors data when airport changes
  useEffect(() => {
    if (!selectedAirport) return;
    
    // Don't make the API call at all
    // Instead, directly use mock data
    console.log("Using hardcoded floor data");
    
    const mockFloors = [
      { id: '1', name: 'Level 1 - Arrivals' },
      { id: '2', name: 'Level 2 - Departures' },
      { id: '3', name: 'Level 3 - Food Court' }
    ];
    
    setFloors(mockFloors);
    setSelectedFloor('2');
    setLoading(false);
    setError(null);
    
  }, [selectedAirport]);

  // Handle airport selection change
  const handleAirportChange = (e) => {
    setSelectedAirport(e.target.value);
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
              disabled={loading || floors.length === 0}
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
          </div>
          
          <div className="sidebar-content">
            {sidebarView === 'navigation' ? (
              <>
                <Navigation
                  airport={selectedAirport}
                  floor={selectedFloor}
                  onRouteSelected={handleRouteSelected}
                />
                <WaitTimes airport={selectedAirport} />
              </>
            ) : (
              <FilterMenu
                airport={selectedAirport}
                floor={selectedFloor}
                onFilterChange={handleFilterChange}
              />
            )}
          </div>
        </div>
        
        <div className="map-section">
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          )}
          
          {!error && selectedAirport && selectedFloor && (
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
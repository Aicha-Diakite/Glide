import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Map from '../components/Map';
import Navigation from '../components/Navigation';
import FilterMenu from '../components/FilterMenu';
import SecurityWait from '../components/SecurityWait';
import FlightInfo from '../components/FlightInfo';
import { fetchAirports, fetchAirportData } from '../services/airports';

const MainApp = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState('');
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [activeView, setActiveView] = useState('navigation'); // navigation, filter, flights
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch airports on first load
  useEffect(() => {
    const getAirports = async () => {
      try {
        setLoading(true);
        const airportsData = await fetchAirports();
        setAirports(airportsData);
        
        // Set default airport if available
        if (airportsData.length > 0) {
          setSelectedAirport(airportsData[0].code);
        }
      } catch (err) {
        console.error('Error fetching airports:', err);
        setError('Failed to load airports data');
        
        // Fallback to hardcoded data for MVP
        setAirports([
          { code: "sfo", name: "San Francisco International Airport" },
          { code: "jfk", name: "JFK International Airport" },
          { code: "ord", name: "O'Hare International Airport" }
        ]);
        setSelectedAirport("sfo");
      } finally {
        setLoading(false);
      }
    };
    
    getAirports();
  }, []);

  // Fetch floors for the selected airport
  useEffect(() => {
    if (!selectedAirport) return;
    
    const getAirportData = async () => {
      try {
        setLoading(true);
        const data = await fetchAirportData(selectedAirport);
        
        if (data.floors && data.floors.length > 0) {
          setFloors(data.floors);
          setSelectedFloor(data.floors[0].id);
        } else {
          // Fallback
          setFloors([{ id: '1', name: 'Floor 1' }]);
          setSelectedFloor('1');
        }
      } catch (err) {
        console.error('Error fetching airport data:', err);
        setError('Failed to load airport data');
        
        // Fallback for MVP
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
    
    getAirportData();
  }, [selectedAirport]);

  const handleAirportChange = (code) => {
    setSelectedAirport(code);
    setRoute(null); // Clear any existing route
  };

  const handleFloorChange = (floorId) => {
    setSelectedFloor(floorId);
    setRoute(null); // Clear any existing route
  };

  const handleRouteSelected = (routeData) => {
    setRoute(routeData);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="app-container">
      <Header 
        airports={airports}
        selectedAirport={selectedAirport}
        floors={floors}
        selectedFloor={selectedFloor}
        onAirportChange={handleAirportChange}
        onFloorChange={handleFloorChange}
        onProfileClick={handleProfileClick}
      />
      
      <div className="main-content">
        <div className="sidebar">
          <div className="tabs">
            <button 
              className={`tab ${activeView === 'navigation' ? 'active' : ''}`}
              onClick={() => setActiveView('navigation')}
            >
              Navigation
            </button>
            <button 
              className={`tab ${activeView === 'filter' ? 'active' : ''}`}
              onClick={() => setActiveView('filter')}
            >
              Filter
            </button>
            <button 
              className={`tab ${activeView === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveView('flights')}
            >
              Flights
            </button>
          </div>
          
          <div className="tab-content">
            {activeView === 'navigation' && (
              <Navigation 
                airport={selectedAirport}
                floor={selectedFloor}
                onRouteSelected={handleRouteSelected}
              />
            )}
            
            {activeView === 'filter' && (
              <FilterMenu 
                airport={selectedAirport} 
                floor={selectedFloor} 
              />
            )}
            
            {activeView === 'flights' && (
              <FlightInfo airport={selectedAirport} />
            )}
          </div>
          
          {/* Show wait times at bottom of sidebar except in flights view */}
          {activeView !== 'flights' && (
            <div className="wait-times-container">
              <SecurityWait airport={selectedAirport} />
            </div>
          )}
        </div>
        
        <div className="map-container">
          {loading && <div className="loading-indicator">Loading...</div>}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && selectedAirport && selectedFloor && activeView !== 'flights' && (
            <Map 
              airport={selectedAirport}
              floor={selectedFloor}
              route={route}
            />
          )}
          
          {activeView === 'flights' && (
            <div className="flights-map-placeholder">
              <h3>Flight Tracking</h3>
              <p>Flight tracking visualization would appear here in the full implementation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainApp;
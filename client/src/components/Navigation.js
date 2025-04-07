import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Navigation = ({ airport, floor, onRouteSelected }) => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [stops, setStops] = useState([]);
  const [availablePoints, setAvailablePoints] = useState([]);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use mock data instead of API call
  useEffect(() => {
    if (!airport || !floor) return;
    
    console.log("Using mock points data");
    
    // Mock data for available points
    const mockPoints = [
      {
        id: "gate-a1",
        name: "Gate A1",
        type: "gate",
        floor: floor
      },
      {
        id: "gate-b2",
        name: "Gate B2",
        type: "gate",
        floor: floor
      },
      {
        id: "restaurant-1",
        name: "Napa Farms Market",
        type: "restaurant",
        floor: floor
      },
      {
        id: "bathroom-t1",
        name: "Terminal 1 Restroom",
        type: "bathroom",
        floor: floor
      },
      {
        id: "security-t1",
        name: "Terminal 1 Security",
        type: "security",
        floor: floor
      },
      {
        id: "current_location",
        name: "Current Location",
        type: "location",
        floor: floor
      }
    ];
    
    setAvailablePoints(mockPoints);
  }, [airport, floor]);
  
  // Handle adding a stop to the route
  const handleAddStop = (stopId) => {
    if (stops.includes(stopId)) return;
    setStops([...stops, stopId]);
  };
  
  // Handle removing a stop from the route
  const handleRemoveStop = (stopId) => {
    setStops(stops.filter(id => id !== stopId));
  };
  
  // Find point by ID
  const findPointById = (id) => {
    return availablePoints.find(point => point.id === id);
  };
  
  // Calculate route when start and end points are selected
  useEffect(() => {
    if (!startPoint || !endPoint) return;
    
    // Create mock calculated route
    const mockRoute = {
      path: [startPoint, ...stops, endPoint],
      distance: 250 + (stops.length * 50)
    };
    
    setCalculatedRoute(mockRoute);
    
    // Pass the route up to parent component
    if (onRouteSelected) {
      onRouteSelected(mockRoute);
    }
  }, [startPoint, endPoint, stops, onRouteSelected]);
  
  // Format estimated time based on distance
  const formatEstimatedTime = (distance) => {
    // Assuming average walking speed of 1.4 meters per second
    const walkingSpeedMetersPerSecond = 1.4;
    const timeInSeconds = distance / walkingSpeedMetersPerSecond;
    
    if (timeInSeconds < 60) {
      return `${Math.round(timeInSeconds)} seconds`;
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.round(timeInSeconds % 60);
    
    return `${minutes} min${seconds > 0 ? ` ${seconds} sec` : ''}`;
  };
  
  return (
    <div className="navigation-panel">
      <h2 className="panel-title">Plan Your Route</h2>
      
      {/* Starting Point Selection */}
      <div className="form-group">
        <label htmlFor="start-point">Starting Point:</label>
        <select 
          id="start-point"
          value={startPoint}
          onChange={(e) => setStartPoint(e.target.value)}
          className="select-input"
        >
          <option value="">Select starting point</option>
          <option value="current_location">Current Location</option>
          {availablePoints
            .filter(point => point.id !== 'current_location')
            .map(point => (
              <option key={`start-${point.id}`} value={point.id}>
                {point.name} ({point.type})
              </option>
            ))}
        </select>
      </div>
      
      {/* Destination Selection */}
      <div className="form-group">
        <label htmlFor="end-point">Destination:</label>
        <select 
          id="end-point"
          value={endPoint}
          onChange={(e) => setEndPoint(e.target.value)}
          className="select-input"
        >
          <option value="">Select destination</option>
          {availablePoints.map(point => (
            <option key={`end-${point.id}`} value={point.id}>
              {point.name} ({point.type})
            </option>
          ))}
        </select>
      </div>
      
      {/* Stops Along the Way */}
      <div className="form-group">
        <label>Stops Along the Way:</label>
        <div className="stops-container">
          {stops.map(stopId => {
            const stop = findPointById(stopId);
            return (
              <div key={`stop-${stopId}`} className="stop-item">
                <span>{stop ? stop.name : stopId}</span>
                <button 
                  onClick={() => handleRemoveStop(stopId)}
                  className="remove-stop-btn"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
        
        <select 
          value=""
          onChange={(e) => {
            if (e.target.value) {
              handleAddStop(e.target.value);
              e.target.value = ""; // Reset dropdown
            }
          }}
          className="select-input"
        >
          <option value="">Add a stop</option>
          {availablePoints
            .filter(point => !stops.includes(point.id) && point.id !== startPoint && point.id !== endPoint)
            .map(point => (
              <option key={`add-${point.id}`} value={point.id}>
                {point.name} ({point.type})
              </option>
            ))}
        </select>
      </div>
      
      {/* Route Details */}
      {calculatedRoute && (
        <div className="route-details">
          <h3>Route Details</h3>
          
          <div className="route-stats">
            <div className="stat-item">
              <div>
                <span className="stat-label">Distance</span>
                <span className="stat-value">{Math.round(calculatedRoute.distance)} meters</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div>
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">{formatEstimatedTime(calculatedRoute.distance)}</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div>
                <span className="stat-label">Stops</span>
                <span className="stat-value">{stops.length} stops</span>
              </div>
            </div>
          </div>
          
          <div className="route-path">
            <h4>Path:</h4>
            <ol className="path-list">
              {calculatedRoute.path.map((nodeId, index) => {
                const point = findPointById(nodeId);
                return (
                  <li key={`path-${index}-${nodeId}`} className="path-item">
                    {point ? point.name : nodeId}
                    {point && <span className="point-type">({point.type})</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
      
      {loading && <div className="loading-message">Calculating optimal route...</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Navigation;
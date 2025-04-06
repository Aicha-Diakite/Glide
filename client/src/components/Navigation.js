import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactComponent as LocationIcon } from '../assets/icons/location.svg';
import { ReactComponent as ClockIcon } from '../assets/icons/clock.svg';
import { ReactComponent as RouteIcon } from '../assets/icons/route.svg';

const Navigation = ({ airport, floor, onRouteSelected }) => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [stops, setStops] = useState([]);
  const [availablePoints, setAvailablePoints] = useState([]);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch available points (gates, amenities) for the current airport and floor
  useEffect(() => {
    if (!airport || !floor) return;
    
    const fetchPoints = async () => {
      try {
        // Fetch gates
        const gatesResponse = await axios.get(`/api/airports/${airport}`);
        const gates = gatesResponse.data.gates.filter(gate => gate.floor.toString() === floor.toString());
        
        // Fetch amenities
        const amenitiesResponse = await axios.get(`/api/amenities/${airport}/filter`, {
          params: { floor }
        });
        
        // Combine points
        const points = [
          ...gates.map(gate => ({
            id: gate.id,
            name: gate.name,
            type: 'gate',
            floor: gate.floor
          })),
          ...amenitiesResponse.data.map(amenity => ({
            id: amenity.id,
            name: amenity.name,
            type: amenity.type,
            floor: amenity.floor
          }))
        ];
        
        setAvailablePoints(points);
      } catch (err) {
        console.error('Error fetching points:', err);
        setError('Failed to load available destinations');
      }
    };
    
    fetchPoints();
  }, [airport, floor]);
  
  // Calculate the route when start and end points are selected
  useEffect(() => {
    if (!startPoint || !endPoint) return;
    
    const calculateRoute = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post(`/api/airports/${airport}/route`, {
          floor,
          start: startPoint,
          end: endPoint,
          stops: stops
        });
        
        setCalculatedRoute(response.data);
        
        // Pass the route up to parent component (Map)
        if (onRouteSelected) {
          onRouteSelected(response.data);
        }
      } catch (err) {
        console.error('Error calculating route:', err);
        setError('Failed to calculate route');
        setCalculatedRoute(null);
      } finally {
        setLoading(false);
      }
    };
    
    calculateRoute();
  }, [airport, floor, startPoint, endPoint, stops, onRouteSelected]);
  
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
          value={startPoint || ''}
          onChange={(e) => setStartPoint(e.target.value)}
          className="select-input"
        >
          <option value="">Select starting point</option>
          <option value="current_location">Current Location</option>
          {availablePoints.map(point => (
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
          value={endPoint || ''}
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
      
      {/* Stops Selection */}
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
              <LocationIcon className="stat-icon" />
              <div>
                <span className="stat-label">Distance</span>
                <span className="stat-value">{Math.round(calculatedRoute.distance)} meters</span>
              </div>
            </div>
            
            <div className="stat-item">
              <ClockIcon className="stat-icon" />
              <div>
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">{formatEstimatedTime(calculatedRoute.distance)}</span>
              </div>
            </div>
            
            <div className="stat-item">
              <RouteIcon className="stat-icon" />
              <div>
                <span className="stat-label">Stops</span>
                <span className="stat-value">{calculatedRoute.path.length - 2} stops</span>
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
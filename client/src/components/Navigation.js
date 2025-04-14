import React, { useState, useEffect } from 'react';
import { Clock, Map as MapIcon, Navigation as NavigationIcon } from 'lucide-react';
import { fetchLocationPoints, calculateRoute } from '../services/pathfinding';

const Navigation = ({ airport, floor, onRouteSelected }) => {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
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
        setLoading(true);
        const points = await fetchLocationPoints(airport, floor);
        setAvailablePoints(points);
        setError(null);
      } catch (err) {
        console.error('Error fetching points:', err);
        setError('Failed to load available destinations');
        
        // Use mock data for MVP
        const mockPoints = [
          {
            id: "gate-a1",
            name: "Gate A1",
            type: "gate",
            coordinates: [-122.3920, 37.6180],
            terminal: "terminal-1"
          },
          {
            id: "restaurant-1",
            name: "Napa Farms Market",
            type: "restaurant",
            coordinates: [-122.3885, 37.6175],
            terminal: "terminal-2"
          },
          {
            id: "bathroom-t1",
            name: "Terminal 1 Restroom",
            type: "bathroom",
            coordinates: [-122.3918, 37.6172],
            terminal: "terminal-1"
          },
          {
            id: "shop-1",
            name: "InMotion Entertainment",
            type: "shop",
            coordinates: [-122.3880, 37.6176],
            terminal: "terminal-2"
          },
          {
            id: "lounge-1",
            name: "United Club",
            type: "lounge",
            coordinates: [-122.3850, 37.6175],
            terminal: "terminal-3"
          }
        ];
        
        setAvailablePoints(mockPoints);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoints();
  }, [airport, floor]);
  
  // Calculate the route when start and end points are selected
  useEffect(() => {
    if (!startPoint || !endPoint || !airport || !floor) return;
    
    const getRoute = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const routeData = await calculateRoute(airport, floor, startPoint, endPoint, stops);
        setCalculatedRoute(routeData);
        
        // Pass the route up to parent component
        if (onRouteSelected) {
          onRouteSelected(routeData);
        }
      } catch (err) {
        console.error('Error calculating route:', err);
        setError(err.response?.data?.message || 'Failed to calculate route');
        setCalculatedRoute(null);
        
        // Use mock route data for MVP
        const mockRoute = {
          path: [startPoint, "junction-t1-main", "security-t1", "junction-central", endPoint],
          distance: 280,
          estimatedTimeMinutes: 4,
          floor
        };
        
        setCalculatedRoute(mockRoute);
        
        if (onRouteSelected) {
          onRouteSelected(mockRoute);
        }
      } finally {
        setLoading(false);
      }
    };
    
    getRoute();
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
  const formatEstimatedTime = (minutes) => {
    if (minutes < 1) {
      return 'Less than a minute';
    }
    
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };
  
  // Group available points by type for easier selection
  const pointsByType = availablePoints.reduce((acc, point) => {
    if (!acc[point.type]) {
      acc[point.type] = [];
    }
    acc[point.type].push(point);
    return acc;
  }, {});
  
  // Get the label for a point type
  const getTypeLabel = (type) => {
    const labels = {
      gate: 'Gates',
      restaurant: 'Restaurants',
      shop: 'Shops',
      bathroom: 'Bathrooms',
      lounge: 'Lounges',
      security: 'Security'
    };
    
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
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
          
          {/* Group points by type */}
          {Object.entries(pointsByType).map(([type, points]) => (
            <optgroup key={`start-group-${type}`} label={getTypeLabel(type)}>
              {points.map(point => (
                <option key={`start-${point.id}`} value={point.id}>
                  {point.name}
                </option>
              ))}
            </optgroup>
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
          
          {/* Group points by type */}
          {Object.entries(pointsByType).map(([type, points]) => (
            <optgroup key={`end-group-${type}`} label={getTypeLabel(type)}>
              {points.map(point => (
                <option key={`end-${point.id}`} value={point.id}>
                  {point.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      
      {/* Stops Along the Way */}
      <div className="form-group">
        <label>Stops Along the Way:</label>
        
        {stops.length > 0 && (
          <div className="stops-container">
            {stops.map(stopId => {
              const stop = findPointById(stopId);
              return (
                <div key={`stop-${stopId}`} className="stop-item">
                  <span>{stop ? stop.name : stopId}</span>
                  <button 
                    onClick={() => handleRemoveStop(stopId)}
                    className="remove-stop-btn"
                    aria-label="Remove stop"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
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
          
          {/* Filter out points already selected as start, end, or stops */}
          {Object.entries(pointsByType).map(([type, points]) => {
            const availableForStops = points.filter(
              point => !stops.includes(point.id) && point.id !== startPoint && point.id !== endPoint
            );
            
            if (availableForStops.length === 0) return null;
            
            return (
              <optgroup key={`stop-group-${type}`} label={getTypeLabel(type)}>
                {availableForStops.map(point => (
                  <option key={`add-${point.id}`} value={point.id}>
                    {point.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>
      
      {/* Calculate Route Button */}
      <button
        className="calculate-route-btn"
        disabled={!startPoint || !endPoint || loading}
        onClick={() => {
          // Route calculation is triggered by the useEffect
        }}
      >
        {loading ? 'Calculating...' : 'Calculate Route'}
      </button>
      
      {/* Route Details */}
      {calculatedRoute && calculatedRoute.path.length > 0 && (
        <div className="route-details">
          <h3>Route Details</h3>
          
          <div className="route-stats">
            <div className="stat-item">
              <MapIcon className="stat-icon" />
              <div>
                <span className="stat-label">Distance</span>
                <span className="stat-value">{Math.round(calculatedRoute.distance)} meters</span>
              </div>
            </div>
            
            <div className="stat-item">
              <Clock className="stat-icon" />
              <div>
                <span className="stat-label">Est. Time</span>
                <span className="stat-value">{formatEstimatedTime(calculatedRoute.estimatedTimeMinutes)}</span>
              </div>
            </div>
            
            <div className="stat-item">
              <NavigationIcon className="stat-icon" />
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
      
      {/* Display this when no route is selected */}
      {!loading && !calculatedRoute && !error && (
        <div className="no-route-message">
          Select a starting point and destination to calculate a route.
        </div>
      )}
    </div>
  );
};

export default Navigation;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactComponent as LocationIcon } from '../assets/icons/location.svg';
import { ReactComponent as ClockIcon } from '../assets/icons/clock.svg';
import { ReactComponent as RouteIcon } from '../assets/icons/route.svg';

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
        
        // Get all available destinations from the floor data
        const response = await axios.get(`/api/airports/${airport}/floors/${floor}`);
        
        if (response.data && response.data.nodes) {
          const points = response.data.nodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            coordinates: node.coordinates,
            terminal: node.terminal
          }));
          
          setAvailablePoints(points);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching points:', err);
        setError('Failed to load available destinations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoints();
  }, [airport, floor]);
  
  // Calculate the route when start and end points are selected
  useEffect(() => {
    if (!startPoint || !endPoint || !airport || !floor) return;
    
    const calculateRoute = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Call the backend route API for pathfinding
        const response = await axios.post(`/api/airports/${airport}/route`, {
          floor,
          start: startPoint,
          end: endPoint,
          stops: stops
        });
        
        const routeData = response.data;
        setCalculatedRoute(routeData);
        
        // Pass the route up to parent component (Map)
        if (onRouteSelected) {
          onRouteSelected(routeData);
        }
      } catch (err) {
        console.error('Error calculating route:', err);
        setError(err.response?.data?.message || 'Failed to calculate route');
        setCalculatedRoute(null);
      } finally {
        setLoading(false);
      }
    };
    
    calculateRoute();
  }, [airport, floor, startPoint, endPoint, stops, onRouteSelected]);
  
  // Priority Queue implementation for Dijkstra's algorithm
  class PriorityQueue {
    constructor() {
      this.values = [];
    }
    
    enqueue(node, priority) {
      this.values.push({ node, priority });
      this.sort();
    }
    
    dequeue() {
      return this.values.shift();
    }
    
    sort() {
      this.values.sort((a, b) => a.priority - b.priority);
    }
    
    isEmpty() {
      return this.values.length === 0;
    }
  }
  
  // Simplified Dijkstra's algorithm for path finding
  const findShortestPath = (graph, start, end, intermediateStops = []) => {
    // If there are intermediate stops, calculate path through all stops
    if (intermediateStops && intermediateStops.length > 0) {
      const fullPath = [];
      let totalDistance = 0;
      let currentStart = start;
      
      // Calculate path from start to first stop, then from each stop to the next
      for (let i = 0; i <= intermediateStops.length; i++) {
        const currentEnd = i === intermediateStops.length ? end : intermediateStops[i];
        const segment = dijkstra(graph, currentStart, currentEnd);
        
        if (i > 0) {
          // Remove the first node from subsequent segments to avoid duplicates
          segment.path.shift();
        }
        
        fullPath.push(...segment.path);
        totalDistance += segment.distance;
        currentStart = currentEnd;
      }
      
      return {
        path: fullPath,
        distance: totalDistance
      };
    } else {
      // Direct path from start to end
      return dijkstra(graph, start, end);
    }
  };
  
  // Core Dijkstra's algorithm
  const dijkstra = (graph, start, end) => {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    
    // Initialize distances to Infinity
    for (let vertex in graph) {
      if (vertex === start) {
        distances[vertex] = 0;
        pq.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
      }
      previous[vertex] = null;
    }
    
    while (!pq.isEmpty()) {
      const { node: current } = pq.dequeue();
      
      if (current === end) {
        // Build path from end to start
        const path = [];
        let currentNode = end;
        
        while (currentNode) {
          path.unshift(currentNode);
          currentNode = previous[currentNode];
        }
        
        return {
          path,
          distance: distances[end]
        };
      }
      
      // Skip if no connections from this node
      if (!graph[current]) continue;
      
      // Check neighbors
      for (let neighbor in graph[current]) {
        const distance = graph[current][neighbor];
        
        // Calculate new distance
        const newDistance = distances[current] + distance;
        
        // If we found a better path
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = current;
          pq.enqueue(neighbor, newDistance);
        }
      }
    }
    
    // No path found
    return {
      path: [],
      distance: Infinity
    };
  };
  
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
  
  // Group available points by type for easier selection
  const pointsByType = availablePoints.reduce((acc, point) => {
    if (!acc[point.type]) {
      acc[point.type] = [];
    }
    acc[point.type].push(point);
    return acc;
  }, {});
  
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
            <optgroup key={`start-group-${type}`} label={type.charAt(0).toUpperCase() + type.slice(1)}>
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
            <optgroup key={`end-group-${type}`} label={type.charAt(0).toUpperCase() + type.slice(1)}>
              {points.map(point => (
                <option key={`end-${point.id}`} value={point.id}>
                  {point.name}
                </option>
              ))}
            </optgroup>
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
                  aria-label="Remove stop"
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
          
          {/* Filter out points already selected as start, end, or stops */}
          {Object.entries(pointsByType).map(([type, points]) => {
            const availableForStops = points.filter(
              point => !stops.includes(point.id) && point.id !== startPoint && point.id !== endPoint
            );
            
            if (availableForStops.length === 0) return null;
            
            return (
              <optgroup key={`stop-group-${type}`} label={type.charAt(0).toUpperCase() + type.slice(1)}>
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
      
      {/* Route Details */}
      {calculatedRoute && calculatedRoute.path.length > 0 && (
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
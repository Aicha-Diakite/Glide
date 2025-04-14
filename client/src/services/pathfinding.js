import axios from 'axios';
import { fetchFloorData } from './airports';

// Base URL for API endpoints
const API_BASE_URL = '/api';

/**
 * Fetch available location points for route planning
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @param {string} floorId Floor ID (e.g., "2")
 * @returns {Promise<Array>} List of points (gates, amenities, etc.)
 */
export const fetchLocationPoints = async (airportCode, floorId) => {
  try {
    // In a production app, there would be a dedicated endpoint for points
    // For MVP, we'll extract them from floor data
    const floorData = await fetchFloorData(airportCode, floorId);
    
    if (floorData && floorData.nodes) {
      return floorData.nodes;
    }
    
    throw new Error('No floor data available');
  } catch (error) {
    console.error(`Error fetching location points for ${airportCode}/${floorId}:`, error);
    throw error;
  }
};

/**
 * Calculate route between two points
 * @param {string} airportCode Airport code (e.g., "sfo")
 * @param {string} floorId Floor ID (e.g., "2")
 * @param {string} startId Starting point ID
 * @param {string} endId Ending point ID
 * @param {Array} stopIds Array of intermediate stop IDs
 * @returns {Promise<Object>} Route data with path, distance, and time
 */
export const calculateRoute = async (airportCode, floorId, startId, endId, stopIds = []) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/airports/${airportCode}/route`, {
      floor: floorId,
      start: startId,
      end: endId,
      stops: stopIds
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calculating route for ${airportCode}:`, error);
    
    // For MVP, if the API fails, use client-side pathfinding
    try {
      const floorData = await fetchFloorData(airportCode, floorId);
      return findRouteClientSide(floorData, startId, endId, stopIds);
    } catch (fallbackError) {
      console.error('Client-side pathfinding also failed:', fallbackError);
      throw error;
    }
  }
};

/**
 * Find shortest path client-side using Dijkstra's algorithm
 * @param {Object} floorData Floor data with nodes and connections
 * @param {string} startId Starting point ID
 * @param {string} endId Ending point ID
 * @param {Array} stopIds Array of intermediate stop IDs
 * @returns {Object} Route data with path, distance, and time
 */
const findRouteClientSide = (floorData, startId, endId, stopIds = []) => {
  // Build graph from floor data
  const graph = buildGraph(floorData);
  
  if (!graph[startId] || !graph[endId]) {
    throw new Error('Start or end point not found in graph');
  }
  
  // If there are stops, calculate path through all stops
  if (stopIds && stopIds.length > 0) {
    return optimizeRoute(graph, startId, endId, stopIds, floorData.id);
  }
  
  // Otherwise, find direct path
  return findShortestPath(graph, startId, endId, floorData.id);
};

/**
 * Build graph from floor data for pathfinding
 * @param {Object} floorData Floor data with nodes and connections
 * @returns {Object} Graph representation for pathfinding
 */
const buildGraph = (floorData) => {
  const graph = {};
  
  // Initialize nodes
  floorData.nodes.forEach(node => {
    graph[node.id] = {};
  });
  
  // Add connections
  floorData.connections.forEach(connection => {
    const { from, to, distance } = connection;
    graph[from][to] = distance;
    
    // If the connection is bidirectional
    if (!connection.oneWay) {
      graph[to][from] = distance;
    }
  });
  
  return graph;
};

/**
 * Priority Queue implementation for Dijkstra's algorithm
 */
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

/**
 * Find the shortest path between two points using Dijkstra's algorithm
 * @param {Object} graph Graph representation of the floor
 * @param {string} start Start point ID
 * @param {string} end End point ID
 * @param {string} floorId Floor ID
 * @returns {Object} Path and distance
 */
const findShortestPath = (graph, start, end, floorId) => {
  // Initialize distances and previous nodes
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();
  
  // Set initial distances to Infinity except for start node
  for (let vertex in graph) {
    if (vertex === start) {
      distances[vertex] = 0;
      pq.enqueue(vertex, 0);
    } else {
      distances[vertex] = Infinity;
    }
    previous[vertex] = null;
  }
  
  // Main algorithm loop
  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();
    
    // If we've reached the end, build and return the path
    if (current === end) {
      const path = [];
      let currentNode = end;
      
      while (currentNode) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
      }
      
      return {
        path,
        distance: distances[end],
        estimatedTimeMinutes: Math.round(distances[end] / 84), // Assuming 1.4m/s walking speed
        floor: floorId
      };
    }
    
    // If current node exists in graph
    if (graph[current]) {
      // Check each connected node
      for (let neighbor in graph[current]) {
        const distance = graph[current][neighbor];
        
        // Calculate new distance to neighbor
        const newDistance = distances[current] + distance;
        
        // If we found a better path
        if (newDistance < distances[neighbor]) {
          // Update distance and previous
          distances[neighbor] = newDistance;
          previous[neighbor] = current;
          
          // Enqueue with new priority
          pq.enqueue(neighbor, newDistance);
        }
      }
    }
  }
  
  // If no path was found
  return {
    path: [],
    distance: Infinity,
    estimatedTimeMinutes: 0,
    floor: floorId
  };
};

/**
 * Optimize a route with multiple stops
 * @param {Object} graph Graph representation of the floor
 * @param {string} start Start point ID
 * @param {string} end End point ID
 * @param {Array} stops Array of stop IDs to visit
 * @param {string} floorId Floor ID
 * @returns {Object} Optimized path and total distance
 */
const optimizeRoute = (graph, start, end, stops, floorId) => {
  // If no intermediate stops, just find the direct path
  if (stops.length === 0) {
    return findShortestPath(graph, start, end, floorId);
  }
  
  // Include start and end in the points to visit
  const points = [start, ...stops, end];
  const totalPath = [];
  let totalDistance = 0;
  
  // Connect each point to the next one
  for (let i = 0; i < points.length - 1; i++) {
    const { path, distance } = findShortestPath(graph, points[i], points[i + 1], floorId);
    
    // If any segment has no path, the whole route is impossible
    if (distance === Infinity) {
      return {
        path: [],
        distance: Infinity,
        estimatedTimeMinutes: 0,
        floor: floorId
      };
    }
    
    // Add the path segment (excluding the last point except for the final segment)
    if (i < points.length - 2) {
      totalPath.push(...path.slice(0, -1));
    } else {
      totalPath.push(...path);
    }
    
    totalDistance += distance;
  }
  
  return {
    path: totalPath,
    distance: totalDistance,
    estimatedTimeMinutes: Math.round(totalDistance / 84), // Assuming 1.4m/s walking speed
    floor: floorId
  };
};
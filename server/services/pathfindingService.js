/**
 * Pathfinding Service
 * Handles route optimization for airport navigation
 */

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
  
  /**
   * Finds the shortest path between two points in an airport
   * 
   * @param {Object} graph - Graph representation of the airport floor
   * @param {String} start - ID of the starting point
   * @param {String} end - ID of the destination
   * @returns {Object} - Path and distance
   */
  function findShortestPath(graph, start, end) {
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
          distance: distances[end]
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
      distance: Infinity
    };
  }
  
  /**
   * Optimizes a route with multiple stops
   * 
   * @param {Object} graph - Graph representation of the airport floor
   * @param {String} start - ID of the starting point
   * @param {String} end - ID of the final destination
   * @param {Array} stops - Array of stop IDs to visit
   * @returns {Object} - Optimized path and total distance
   */
  function optimizeRoute(graph, start, end, stops = []) {
    // If no intermediate stops, just find the direct path
    if (stops.length === 0) {
      return findShortestPath(graph, start, end);
    }
    
    // Include start and end in the points to visit
    const points = [start, ...stops, end];
    const totalPath = [];
    let totalDistance = 0;
    
    // Connect each point to the next one
    for (let i = 0; i < points.length - 1; i++) {
      const { path, distance } = findShortestPath(graph, points[i], points[i + 1]);
      
      // If any segment has no path, the whole route is impossible
      if (distance === Infinity) {
        return {
          path: [],
          distance: Infinity
        };
      }
      
      // Add the path segment (excluding the last point to avoid duplicates)
      if (i < points.length - 2) {
        totalPath.push(...path.slice(0, -1));
      } else {
        totalPath.push(...path);
      }
      
      totalDistance += distance;
    }
    
    return {
      path: totalPath,
      distance: totalDistance
    };
  }
  
  /**
   * Builds a graph from floor map data
   * 
   * @param {Object} floorData - Floor data with nodes and connections
   * @returns {Object} - Graph representation for pathfinding
   */
  function buildGraph(floorData) {
    const graph = {};
    
    // Process nodes
    floorData.nodes.forEach(node => {
      graph[node.id] = {};
    });
    
    // Process connections
    floorData.connections.forEach(connection => {
      const { from, to, distance } = connection;
      graph[from][to] = distance;
      
      // If the connection is bidirectional
      if (!connection.oneWay) {
        graph[to][from] = distance;
      }
    });
    
    return graph;
  }
  
  // Export the service functions
  module.exports = {
    findShortestPath,
    optimizeRoute,
    buildGraph
  };
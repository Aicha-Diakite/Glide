import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

// Mapbox access token would normally be in environment variables
// For demo purposes, we'll use a placeholder value
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2xpZGUyMDI1IiwiYSI6ImNtOTNuNjR4djA0b3cyam9nN3M4MW1jZnYifQ.FrUimsF4NgG6zbz2NJaFQw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const Map = ({ airport, floor, onSelectDestination = () => {} }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [floorData, setFloorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-122.3875, 37.6175], // Default center (SFO)
      zoom: 15,
      minZoom: 14,
      maxZoom: 19
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Clean up on unmount
    return () => map.current.remove();
  }, []);
  
  // Load airport floor data when airport or floor changes
  useEffect(() => {
    if (!airport || !floor || !map.current) return;
    
    const fetchFloorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/airports/${airport}/floors/${floor}`);
        setFloorData(response.data);
        
        // Update map center to this airport
        if (response.data.center) {
          map.current.flyTo({
            center: response.data.center,
            zoom: 16,
            duration: 1000
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching floor data:', err);
        setError('Failed to load airport map data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFloorData();
  }, [airport, floor]);
  
  // Render floor data on the map
  useEffect(() => {
    if (!map.current || !floorData) return;
    
    // Wait for map to be fully loaded
    if (!map.current.loaded()) {
      map.current.on('load', renderFloorData);
    } else {
      renderFloorData();
    }
    
    function renderFloorData() {
      // Clear previous layers
      clearMapLayers();
      
      // Add terminal outline
      if (floorData.outline) {
        map.current.addSource('terminal-outline', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: floorData.outline
          }
        });
        
        map.current.addLayer({
          id: 'terminal-fill',
          type: 'fill',
          source: 'terminal-outline',
          paint: {
            'fill-color': '#f8f8f8',
            'fill-opacity': 0.8
          }
        });
        
        map.current.addLayer({
          id: 'terminal-line',
          type: 'line',
          source: 'terminal-outline',
          paint: {
            'line-color': '#ccc',
            'line-width': 2
          }
        });
      }
      
      // Add nodes (gates, POIs, etc.)
      if (floorData.nodes && floorData.nodes.length > 0) {
        const nodesGeojson = {
          type: 'FeatureCollection',
          features: floorData.nodes.map(node => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: node.coordinates
            },
            properties: {
              id: node.id,
              name: node.name,
              type: node.type
            }
          }))
        };
        
        map.current.addSource('nodes', {
          type: 'geojson',
          data: nodesGeojson
        });
        
        // Gates layer
        map.current.addLayer({
          id: 'gates',
          type: 'circle',
          source: 'nodes',
          filter: ['==', ['get', 'type'], 'gate'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#2563eb',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        
        // Restaurants layer
        map.current.addLayer({
          id: 'restaurants',
          type: 'circle',
          source: 'nodes',
          filter: ['==', ['get', 'type'], 'restaurant'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#e11d48',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        
        // Shops layer
        map.current.addLayer({
          id: 'shops',
          type: 'circle',
          source: 'nodes',
          filter: ['==', ['get', 'type'], 'shop'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#c026d3',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        
        // Bathrooms layer
        map.current.addLayer({
          id: 'bathrooms',
          type: 'circle',
          source: 'nodes',
          filter: ['==', ['get', 'type'], 'bathroom'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#65a30d',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        
        // Other POIs layer
        map.current.addLayer({
          id: 'other-pois',
          type: 'circle',
          source: 'nodes',
          filter: ['!in', ['get', 'type'], 'gate', 'restaurant', 'shop', 'bathroom'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#0891b2',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
        
        // Add labels for all nodes
        map.current.addLayer({
          id: 'node-labels',
          type: 'symbol',
          source: 'nodes',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-offset': [0, 1.5],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#333',
            'text-halo-color': '#fff',
            'text-halo-width': 1
          }
        });
        
        // Add click interaction for nodes
        map.current.on('click', 'gates', handleNodeClick);
        map.current.on('click', 'restaurants', handleNodeClick);
        map.current.on('click', 'shops', handleNodeClick);
        map.current.on('click', 'bathrooms', handleNodeClick);
        map.current.on('click', 'other-pois', handleNodeClick);
      }
      
      // Add connections (walkways, corridors)
      if (floorData.connections && floorData.connections.length > 0) {
        const connectionsGeojson = {
          type: 'FeatureCollection',
          features: floorData.connections.map(conn => {
            // Find the nodes for this connection
            const fromNode = floorData.nodes.find(n => n.id === conn.from);
            const toNode = floorData.nodes.find(n => n.id === conn.to);
            
            if (!fromNode || !toNode) return null;
            
            return {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [fromNode.coordinates, toNode.coordinates]
              },
              properties: {
                id: `${conn.from}-${conn.to}`,
                distance: conn.distance,
                oneWay: conn.oneWay || false
              }
            };
          }).filter(Boolean)
        };
        
        map.current.addSource('connections', {
          type: 'geojson',
          data: connectionsGeojson
        });
        
        map.current.addLayer({
          id: 'walkways',
          type: 'line',
          source: 'connections',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#d1d5db',
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
      }
    }
    
    // Handle node click events
    function handleNodeClick(e) {
      const feature = e.features[0];
      const coordinates = feature.geometry.coordinates.slice();
      const { id, name, type } = feature.properties;
      
      // Create popup content
      const popupContent = `
        <div>
          <h3>${name}</h3>
          <p>Type: ${type}</p>
          <button id="select-destination" data-id="${id}">Set as destination</button>
        </div>
      `;
      
      // Create and add popup
      const popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(map.current);
      
      // Add event listener to the button in the popup
      setTimeout(() => {
        const button = document.getElementById('select-destination');
        if (button) {
          button.addEventListener('click', () => {
            const nodeId = button.getAttribute('data-id');
            // Emit event to parent component
            if (onSelectDestination) {
              onSelectDestination(nodeId);
            }
            popup.remove();
          });
        }
      }, 0);
    }
    
    // Clean up function
    return () => {
      clearMapLayers();
    };
  }, [floorData]);
  
  // Render route on the map when selected
  useEffect(() => {
    if (!map.current || !selectedRoute || !floorData) return;
    
    // Clear any existing route
    if (map.current.getSource('route')) {
      map.current.removeLayer('route-line');
      map.current.removeSource('route');
    }
    
    // Create a GeoJSON LineString from the route points
    const routePoints = selectedRoute.path.map(nodeId => {
      const node = floorData.nodes.find(n => n.id === nodeId);
      return node ? node.coordinates : null;
    }).filter(Boolean);
    
    if (routePoints.length < 2) return;
    
    const routeGeojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routePoints
      }
    };
    
    // Add the route to the map
    map.current.addSource('route', {
      type: 'geojson',
      data: routeGeojson
    });
    
    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
    
    // Fit the map to the route bounds
    const bounds = routePoints.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(routePoints[0], routePoints[0]));
    
    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }, [selectedRoute, floorData]);
  
  // Helper function to clear map layers
  const clearMapLayers = () => {
    if (!map.current) return;
    
    const layersToRemove = [
      'terminal-fill', 'terminal-line',
      'gates', 'restaurants', 'shops', 'bathrooms', 'other-pois',
      'node-labels', 'walkways', 'route-line'
    ];
    
    const sourcesToRemove = [
      'terminal-outline', 'nodes', 'connections', 'route'
    ];
    
    // Remove layers
    layersToRemove.forEach(layer => {
      if (map.current.getLayer(layer)) {
        map.current.removeLayer(layer);
      }
    });
    
    // Remove sources
    sourcesToRemove.forEach(source => {
      if (map.current.getSource(source)) {
        map.current.removeSource(source);
      }
    });
  };
  
  return (
    <div className="map-container">
      {loading && <div className="loading-overlay">Loading map...</div>}
      {error && <div className="error-message">{error}</div>}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Map;
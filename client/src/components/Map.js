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
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    try {
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
      
      // Set flag when map is loaded
      map.current.on('load', () => {
        setMapLoaded(true);
        console.log("Map loaded successfully");
      });
      
      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please check your Mapbox token.');
    }
  }, []);
  
  // Load airport floor data when airport or floor changes
  useEffect(() => {
    if (!airport || !floor || !map.current) return;
    
    const fetchFloorData = async () => {
      try {
        setLoading(true);
        // Comment out API call
        /*
        const response = await axios.get(`/api/airports/${airport}/floors/${floor}`);
        setFloorData(response.data);
        */
        
        // Use mock data instead
        console.log("Using mock floor data");
        const mockFloorData = {
          id: floor,
          name: `Level ${floor}`,
          airport: airport,
          center: [-122.3875, 37.6175],
          defaultZoom: 16,
          outline: {
            type: "Polygon",
            coordinates: [
              [
                [-122.3935, 37.6155],
                [-122.3935, 37.6195],
                [-122.3815, 37.6195],
                [-122.3815, 37.6155],
                [-122.3935, 37.6155]
              ]
            ]
          },
          nodes: [
            {
              id: "gate-a1",
              name: "Gate A1",
              type: "gate",
              terminal: "terminal-1",
              coordinates: [-122.3920, 37.6180]
            },
            {
              id: "gate-b2",
              name: "Gate B2",
              type: "gate",
              terminal: "terminal-2",
              coordinates: [-122.3880, 37.6185]
            },
            {
              id: "restaurant-1",
              name: "Napa Farms Market",
              type: "restaurant",
              terminal: "terminal-2",
              coordinates: [-122.3885, 37.6175]
            },
            {
              id: "bathroom-t1",
              name: "Terminal 1 Restroom",
              type: "bathroom",
              terminal: "terminal-1",
              coordinates: [-122.3918, 37.6172]
            }
          ],
          connections: [
            {
              from: "gate-a1",
              to: "restaurant-1",
              distance: 50,
              oneWay: false
            },
            {
              from: "gate-b2",
              to: "bathroom-t1",
              distance: 60,
              oneWay: false
            }
          ]
        };
        
        setFloorData(mockFloorData);
        
        // Update map center if map is loaded
        if (map.current && mapLoaded) {
          map.current.flyTo({
            center: mockFloorData.center,
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
  }, [airport, floor, mapLoaded]);
  
  // Render floor data on the map
  useEffect(() => {
    if (!map.current || !floorData || !mapLoaded) return;
    
    const renderFloorData = () => {
      try {
        // Clear previous layers safely
        clearMapLayers();
        
        // Add terminal outline
        if (floorData.outline) {
          if (!map.current.getSource('terminal-outline')) {
            map.current.addSource('terminal-outline', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: floorData.outline
              }
            });
          }
          
          if (!map.current.getLayer('terminal-fill')) {
            map.current.addLayer({
              id: 'terminal-fill',
              type: 'fill',
              source: 'terminal-outline',
              paint: {
                'fill-color': '#f8f8f8',
                'fill-opacity': 0.8
              }
            });
          }
          
          if (!map.current.getLayer('terminal-line')) {
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
          
          if (!map.current.getSource('nodes')) {
            map.current.addSource('nodes', {
              type: 'geojson',
              data: nodesGeojson
            });
          } else {
            map.current.getSource('nodes').setData(nodesGeojson);
          }
          
          // Gates layer
          if (!map.current.getLayer('gates')) {
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
          }
          
          // Restaurants layer
          if (!map.current.getLayer('restaurants')) {
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
          }
          
          // Shops layer
          if (!map.current.getLayer('shops')) {
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
          }
          
          // Bathrooms layer
          if (!map.current.getLayer('bathrooms')) {
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
          }
          
          // Other POIs layer
          if (!map.current.getLayer('other-pois')) {
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
          }
          
          // Add labels for all nodes
          if (!map.current.getLayer('node-labels')) {
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
          }
          
          // Remove any existing listeners to avoid duplicates
          try {
            map.current.off('click', 'gates', handleNodeClick);
            map.current.off('click', 'restaurants', handleNodeClick);
            map.current.off('click', 'shops', handleNodeClick);
            map.current.off('click', 'bathrooms', handleNodeClick);
            map.current.off('click', 'other-pois', handleNodeClick);
          } catch (err) {
            console.log('Error removing event handlers:', err);
          }
          
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
          
          if (!map.current.getSource('connections')) {
            map.current.addSource('connections', {
              type: 'geojson',
              data: connectionsGeojson
            });
          } else {
            map.current.getSource('connections').setData(connectionsGeojson);
          }
          
          if (!map.current.getLayer('walkways')) {
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
      } catch (err) {
        console.error('Error rendering floor data:', err);
      }
    };
    
    // Handle node click events
    function handleNodeClick(e) {
      if (!map.current || !e.features || e.features.length === 0) return;
      
      try {
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
      } catch (err) {
        console.error('Error handling node click:', err);
      }
    }
    
    // If map is loaded, render the floor data
    if (map.current.loaded()) {
      renderFloorData();
    } else {
      // Wait for the map to load before rendering
      map.current.once('load', renderFloorData);
    }
    
    // Clean up function
    return () => {
      if (map.current) {
        try {
          // Remove event listeners
          map.current.off('click', 'gates', handleNodeClick);
          map.current.off('click', 'restaurants', handleNodeClick);
          map.current.off('click', 'shops', handleNodeClick);
          map.current.off('click', 'bathrooms', handleNodeClick);
          map.current.off('click', 'other-pois', handleNodeClick);
        } catch (err) {
          console.log('Error removing event listeners:', err);
        }
      }
    };
  }, [floorData, mapLoaded, onSelectDestination]);
  
  // Render route on the map when selected
  useEffect(() => {
    if (!map.current || !selectedRoute || !floorData || !mapLoaded) return;
    
    try {
      // Clear any existing route
      if (map.current.getSource('route')) {
        if (map.current.getLayer('route-line')) {
          map.current.removeLayer('route-line');
        }
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
    } catch (err) {
      console.error('Error rendering route:', err);
    }
  }, [selectedRoute, floorData, mapLoaded]);
  
  // Helper function to clear map layers
  const clearMapLayers = () => {
    if (!map.current) return;
    
    try {
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
        if (map.current && map.current.getLayer && map.current.getLayer(layer)) {
          map.current.removeLayer(layer);
        }
      });
      
      // Remove sources
      sourcesToRemove.forEach(source => {
        if (map.current && map.current.getSource && map.current.getSource(source)) {
          map.current.removeSource(source);
        }
      });
    } catch (err) {
      console.error('Error clearing map layers:', err);
    }
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
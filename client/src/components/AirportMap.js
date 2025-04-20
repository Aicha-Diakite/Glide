import React, { useEffect, useRef, useState } from 'react';
import { getMapData, show3dMap } from '@mappedin/mappedin-js';
import '@mappedin/mappedin-js/lib/index.css';

const AirportMap = ({ onMapInitialized }) => {
  const mapContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize the map when component mounts
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        setLoading(true);
        console.log("Initializing MappedIn map...");
        
        // Airport demo map credentials
        const options = {
          key: 'mik_yeBk0Vf0nNJtpesfu560e07e5',
          secret: 'mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022',
          mapId: '6686b845c9f6d6000bc30300', // Airport Map ID
          headers: {
            'X-Mappedin-JSSDKVersion': '6.x'
          }
        };

        // Get the map data first
        console.log("Fetching map data...");
        const mapData = await getMapData(options);
        console.log("Map data received successfully");
        
        // Show the map with config options
        console.log("Showing 3D map...");
        const view = await show3dMap(mapContainer.current, mapData, {
          backgroundColor: "#FFFFFF",
          multiBuffering: true,
          xRayPath: true,
          floorVisibility: true,
          camera: {
            initialZoom: 600,
            initialPitch: 40
          }
        });
        
        console.log("Map view created successfully");
        
        // Since we're working with spaces directly, let's enhance them
        try {
          console.log("Setting up airport demo features...");
          
          // Check for spaces in the map data
          const spaces = mapData.getByType ? mapData.getByType('space') : [];
          console.log(`Found ${spaces.length} spaces`);
          
          if (spaces.length > 0) {
            // Create a mapping of space types for coloring
            const spaceTypeColors = {
              'food': '#FF9800',      // Orange
              'restaurant': '#FF9800',
              'cafe': '#FF9800',
              'gate': '#2196F3',      // Blue
              'restroom': '#4CAF50',  // Green
              'bathroom': '#4CAF50',
              'shop': '#9C27B0',      // Purple
              'retail': '#9C27B0',
              'security': '#F44336',  // Red
              'checkin': '#795548',   // Brown
              'baggage': '#607D8B'    // Gray
            };
            
            // Process each space
            spaces.forEach(space => {
              try {
                const name = space.name ? space.name.toLowerCase() : '';
                let spaceType = 'unknown';
                
                // Determine space type from name
                if (name.includes('gate')) {
                  spaceType = 'gate';
                } else if (name.includes('restaurant') || name.includes('cafe') || 
                           name.includes('food') || name.includes('bar') || 
                           name.includes('juice') || name.includes('starbucks') ||
                           name.includes('burger') || name.includes('mountain')) {
                  spaceType = 'food';
                } else if (name.includes('restroom') || name.includes('bathroom') || 
                           name.includes('toilet')) {
                  spaceType = 'restroom';
                } else if (name.includes('shop') || name.includes('store') || 
                           name.includes('retail') || name.includes('attitude') || 
                           name.includes('smith') || name.includes('sterling')) {
                  spaceType = 'shop';
                } else if (name.includes('security') || name.includes('checkpoint')) {
                  spaceType = 'security';
                } else if (name.includes('check') && name.includes('in')) {
                  spaceType = 'checkin';
                } else if (name.includes('baggage') || name.includes('claim')) {
                  spaceType = 'baggage';
                }
                
                // Get color for space type
                const color = spaceTypeColors[spaceType] || null;
                
                console.log(`Space: ${space.name}, Type: ${spaceType}, Color: ${color}`);
                
                // Apply color and enable interaction for the space's polygons
                if (space.polygons && space.polygons.length > 0) {
                  space.polygons.forEach(polygon => {
                    try {
                      // Enable interaction
                      view.Space.enableInteraction(polygon.id);
                      
                      // Set color if determined
                      if (color) {
                        view.Space.setColor(polygon.id, color);
                      }
                    } catch (polyErr) {
                      console.warn(`Error processing polygon for ${space.name}:`, polyErr);
                    }
                  });
                }
                
                // No longer trying to add labels since that's causing errors
              } catch (spaceErr) {
                console.warn(`Error processing space ${space.name}:`, spaceErr);
              }
            });
          }
          
          // Call the onMapInitialized callback with the map view and data
          if (onMapInitialized) {
            console.log("Calling onMapInitialized callback");
            onMapInitialized(view, mapData);
          }
          
          // Enable debug mode for development
          console.log("Enabling debug mode...");
          view.enableDebug();
        } catch (setupErr) {
          console.error("Error setting up airport demo:", setupErr);
        }
        
        setLoading(false);
        console.log("Map initialization complete");
      } catch (err) {
        console.error('Error initializing MappedIn:', err);
        setError(`Failed to load airport map: ${err.message}`);
        setLoading(false);
      }
    };

    initMap();
  }, [onMapInitialized]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10
        }}>
          <div>Loading airport map...</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 100, 100, 0.7)',
          zIndex: 10
        }}>
          <div>{error}</div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        id="mappedin-map"
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />
    </div>
  );
};

export default AirportMap;
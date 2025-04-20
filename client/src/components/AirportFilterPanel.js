import React from 'react';

const AirportFilterPanel = ({ mapView, mapData }) => {
  // These are the main categories we saw in the MappedIn demo
  const categories = [
    { id: 'flights', name: 'Flights', icon: '✈️' },
    { id: 'checkin', name: 'Check-in', icon: '🧳' },
    { id: 'gates', name: 'Gates', icon: '🚪' },
    { id: 'food', name: 'Food & Drinks', icon: '🍽️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'baggage', name: 'Baggage Claim', icon: '🧳' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'parking', name: 'Parking', icon: '🅿️' },
    { id: 'shops', name: 'Shops', icon: '🛍️' },
    { id: 'washrooms', name: 'Washrooms', icon: '🚻' },
    { id: 'services', name: 'Services', icon: '💼' },
    { id: 'atm', name: 'ATM / Exchange', icon: '💰' },
    { id: 'accessible', name: 'Accessibility', icon: '♿' },
    { id: 'terminals', name: 'Terminals', icon: '🏢' },
    { id: 'connections', name: 'Connections', icon: '🔄' }
  ];

  // Handle filter button click
  const handleFilterClick = (categoryId) => {
    if (!mapView || !mapData) return;
    
    console.log(`Filtering for category: ${categoryId}`);

    try {
      // Basic filter logic based on category
      // This needs to be customized based on how your actual map data is structured
      if (categoryId === 'all') {
        // Reset any filters and show all
        const locations = mapData.locations;
        if (locations) {
          locations.forEach(location => {
            if (location.polygons) {
              location.polygons.forEach(polygon => {
                try {
                  mapView.Space.setColor(polygon.id, undefined);
                  mapView.Space.setOpacity(polygon.id, 1);
                } catch (err) {
                  console.warn(`Error resetting polygon ${polygon.id}:`, err);
                }
              });
            }
          });
        }
      } else {
        // This is a simplified example for filtering
        // In a real implementation, you would use the MappedIn SDK's filtering capabilities
        
        // First, dim all locations
        const allLocations = mapData.locations;
        if (allLocations) {
          allLocations.forEach(location => {
            if (location.polygons) {
              location.polygons.forEach(polygon => {
                try {
                  mapView.Space.setOpacity(polygon.id, 0.3);
                } catch (err) {
                  console.warn(`Error dimming polygon ${polygon.id}:`, err);
                }
              });
            }
          });
        }
        
        // Then highlight the matching ones
        const matchingLocations = mapData.locations.filter(location => {
          // Simplified matching logic - in reality, you'd check location types
          // or use mapData's categorization properties
          const lcName = location.name.toLowerCase();
          
          switch(categoryId) {
            case 'flights':
              return lcName.includes('flight') || lcName.includes('airline');
            case 'checkin':
              return lcName.includes('check') || lcName.includes('counter');
            case 'gates':
              return lcName.includes('gate');
            case 'food':
              return lcName.includes('food') || lcName.includes('restaurant') || 
                     lcName.includes('cafe') || lcName.includes('bar');
            case 'security':
              return lcName.includes('security') || lcName.includes('checkpoint');
            case 'baggage':
              return lcName.includes('baggage') || lcName.includes('claim');
            case 'shops':
              return lcName.includes('shop') || lcName.includes('store');
            case 'washrooms':
              return lcName.includes('washroom') || lcName.includes('restroom') || 
                     lcName.includes('bathroom') || lcName.includes('toilet');
            default:
              return false;
          }
        });
        
        if (matchingLocations) {
          matchingLocations.forEach(location => {
            if (location.polygons) {
              location.polygons.forEach(polygon => {
                try {
                  mapView.Space.setColor(polygon.id, '#4285F4');
                  mapView.Space.setOpacity(polygon.id, 1);
                } catch (err) {
                  console.warn(`Error highlighting polygon ${polygon.id}:`, err);
                }
              });
            }
          });
        }
      }
    } catch (err) {
      console.error(`Error filtering for ${categoryId}:`, err);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '10px',
      zIndex: 100,
      maxWidth: '300px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Filter Map</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '8px' 
      }}>
        <button
          onClick={() => handleFilterClick('all')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 5px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '20px', marginBottom: '5px' }}>🔍</span>
          <span style={{ fontSize: '12px' }}>All</span>
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleFilterClick(category.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 5px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '5px' }}>{category.icon}</span>
            <span style={{ fontSize: '12px' }}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AirportFilterPanel;
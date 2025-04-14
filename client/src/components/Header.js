import React from 'react';
import { User } from 'lucide-react';

const Header = ({ 
  airports, 
  selectedAirport, 
  floors, 
  selectedFloor, 
  onAirportChange, 
  onFloorChange,
  onProfileClick
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="app-branding">
          <h1 className="app-title">
            Glide <span className="app-icon">✈</span>
          </h1>
          <p className="app-tagline">Airport Navigation Made Simple</p>
        </div>
        
        <div className="selector-container">
          <div className="selector-group">
            <label htmlFor="airport-select">Airport:</label>
            <select
              id="airport-select"
              value={selectedAirport}
              onChange={(e) => onAirportChange(e.target.value)}
              disabled={!airports || airports.length === 0}
              className="airport-select"
            >
              {airports && airports.map(airport => (
                <option key={airport.code} value={airport.code}>
                  {airport.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label htmlFor="floor-select">Floor:</label>
            <select
              id="floor-select"
              value={selectedFloor}
              onChange={(e) => onFloorChange(e.target.value)}
              disabled={!floors || floors.length === 0}
              className="floor-select"
            >
              {floors && floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          className="profile-button"
          onClick={onProfileClick}
          aria-label="User Profile"
        >
          <User size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
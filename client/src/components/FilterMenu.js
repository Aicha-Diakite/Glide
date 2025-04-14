import React, { useState, useEffect } from 'react';
import { fetchAmenities } from '../services/amenities';

const FilterMenu = ({ airport, floor, onFilterChange }) => {
  const [amenityTypes, setAmenityTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [waitTimeFilter, setWaitTimeFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available amenity types for the current airport and floor
  useEffect(() => {
    if (!airport || !floor) return;

    const getAmenityTypes = async () => {
      try {
        setLoading(true);
        const amenities = await fetchAmenities(airport, floor);
        
        // Extract unique amenity types
        const types = [...new Set(amenities.map(item => item.type))];
        setAmenityTypes(types);
        setError(null);
      } catch (err) {
        console.error('Error fetching amenity types:', err);
        setError('Failed to load amenity types');
        
        // Mock data for MVP
        setAmenityTypes(['restaurant', 'shop', 'bathroom', 'lounge', 'gate']);
      } finally {
        setLoading(false);
      }
    };

    getAmenityTypes();
  }, [airport, floor]);

  // Apply filters and notify parent component
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        types: selectedTypes,
        distance: distanceFilter,
        rating: ratingFilter,
        waitTime: waitTimeFilter
      });
    }
  }, [selectedTypes, distanceFilter, ratingFilter, waitTimeFilter, onFilterChange]);

  // Handle toggling amenity type in filter
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSelectedTypes([]);
    setDistanceFilter(null);
    setRatingFilter(null);
    setWaitTimeFilter(null);
  };

  // Format type name for display
  const formatTypeName = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="filter-menu">
      <h2 className="filter-title">Filter Amenities</h2>

      {/* Amenity Types Filter */}
      <div className="filter-section">
        <h3>Amenity Types</h3>
        <div className="type-filters">
          {loading ? (
            <p>Loading amenity types...</p>
          ) : (
            amenityTypes.map(type => (
              <div key={type} className="type-filter-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                  />
                  <span className="type-name">
                    {formatTypeName(type)}
                  </span>
                </label>
              </div>
            ))
          )}

          {amenityTypes.length === 0 && !loading && (
            <p>No amenities available on this floor</p>
          )}
        </div>
      </div>

      {/* Distance Filter */}
      <div className="filter-section">
        <h3>Distance</h3>
        <div className="radio-filters">
          <label className="radio-label">
            <input
              type="radio"
              name="distance"
              checked={distanceFilter === 'near'}
              onChange={() => setDistanceFilter('near')}
            />
            <span>Nearby (5 min walk)</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="distance"
              checked={distanceFilter === 'medium'}
              onChange={() => setDistanceFilter('medium')}
            />
            <span>Medium (5-10 min walk)</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="distance"
              checked={distanceFilter === 'far'}
              onChange={() => setDistanceFilter('far')}
            />
            <span>All distances</span>
          </label>

          {distanceFilter && (
            <button
              className="clear-filter-btn"
              onClick={() => setDistanceFilter(null)}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="filter-section">
        <h3>Rating</h3>
        <div className="rating-slider">
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={ratingFilter || 3}
            onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
          />
          <div className="rating-value">
            {ratingFilter ? `${ratingFilter}+ stars` : 'Any rating'}
          </div>

          {ratingFilter && (
            <button
              className="clear-filter-btn"
              onClick={() => setRatingFilter(null)}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Wait Time Filter (for restaurants) */}
      <div className="filter-section">
        <h3>Wait Time</h3>
        <div className="radio-filters">
          <label className="radio-label">
            <input
              type="radio"
              name="waitTime"
              checked={waitTimeFilter === 'short'}
              onChange={() => setWaitTimeFilter('short')}
            />
            <span>Short (&lt; 15 min)</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="waitTime"
              checked={waitTimeFilter === 'medium'}
              onChange={() => setWaitTimeFilter('medium')}
            />
            <span>Medium (15-30 min)</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              name="waitTime"
              checked={waitTimeFilter === 'any'}
              onChange={() => setWaitTimeFilter('any')}
            />
            <span>Any wait time</span>
          </label>

          {waitTimeFilter && (
            <button
              className="clear-filter-btn"
              onClick={() => setWaitTimeFilter(null)}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Clear All Filters Button */}
      <button
        className="clear-all-btn"
        onClick={handleClearFilters}
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterMenu;
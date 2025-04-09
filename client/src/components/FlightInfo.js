import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ReactComponent as ClockIcon } from '../assets/icons/clock.svg';

const FlightInfo = ({ airport }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'departures', 'arrivals'
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  // Fetch flights for the selected airport
  useEffect(() => {
    if (!airport) return;
    
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/flights/${airport}`);
        setFlights(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setError('Unable to load flight information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
    
    // Set up refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchFlights, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [airport]);
  
  // Fetch flight details when a flight is selected
  useEffect(() => {
    if (!selectedFlight) return;
    
    const fetchFlightDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/flights/details/${selectedFlight}`);
        
        // Update the flight in the flights list with detailed information
        setFlights(prevFlights => 
          prevFlights.map(flight => 
            flight.flightNumber === selectedFlight ? { ...flight, details: response.data } : flight
          )
        );
        
        setError(null);
      } catch (err) {
        console.error('Error fetching flight details:', err);
        setError('Unable to load flight details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlightDetails();
  }, [selectedFlight]);
  
  // Format the time for display
  const formatTime = (isoTime) => {
    if (!isoTime) return 'N/A';
    
    const date = new Date(isoTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  
  // Format date for display
  const formatDate = (isoTime) => {
    if (!isoTime) return '';
    
    const date = new Date(isoTime);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Filter flights based on search term and filter type
  const filteredFlights = flights.filter(flight => {
    const matchesSearch = searchTerm === '' || 
      flight.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      (filterType === 'departures' && flight.type === 'departure') ||
      (filterType === 'arrivals' && flight.type === 'arrival');
    
    return matchesSearch && matchesType;
  });
  
  // Get status color based on flight status
  const getStatusColor = (status) => {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case 'on time':
      case 'landed':
      case 'arrived':
      case 'boarding':
      case 'in air':
        return 'status-low';
      case 'delayed':
        return 'status-medium';
      case 'cancelled':
      case 'diverted':
        return 'status-high';
      default:
        return '';
    }
  };
  
  // Handle click on a flight row
  const handleFlightClick = (flightNumber) => {
    setSelectedFlight(flightNumber === selectedFlight ? null : flightNumber);
  };
  
  return (
    <div className="flight-info-widget">
      <h3 className="widget-title">Flight Information</h3>
      
      <div className="flight-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by flight #, city, or airline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${filterType === 'departures' ? 'active' : ''}`}
            onClick={() => setFilterType('departures')}
          >
            Departures
          </button>
          <button 
            className={`filter-button ${filterType === 'arrivals' ? 'active' : ''}`}
            onClick={() => setFilterType('arrivals')}
          >
            Arrivals
          </button>
        </div>
      </div>
      
      {loading && flights.length === 0 ? (
        <div className="loading-message">Loading flight information...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredFlights.length === 0 ? (
        <div className="no-data-message">No flight data available</div>
      ) : (
        <div className="flights-list">
          <div className="flight-header">
            <div className="flight-col flight-airline">Airline</div>
            <div className="flight-col flight-number">Flight</div>
            <div className="flight-col flight-destination">
              {filterType === 'arrivals' ? 'Origin' : 'Destination'}
            </div>
            <div className="flight-col flight-time">
              {filterType === 'arrivals' ? 'Arrival' : 'Departure'}
            </div>
            <div className="flight-col flight-gate">Gate</div>
            <div className="flight-col flight-status">Status</div>
          </div>
          
          {filteredFlights.map(flight => (
            <React.Fragment key={flight.id}>
              <div 
                className={`flight-item ${selectedFlight === flight.flightNumber ? 'expanded' : ''}`}
                onClick={() => handleFlightClick(flight.flightNumber)}
              >
                <div className="flight-col flight-airline">{flight.airline}</div>
                <div className="flight-col flight-number">{flight.flightNumber}</div>
                <div className="flight-col flight-destination">
                  {flight.type === 'arrival' ? flight.origin : flight.destination}
                </div>
                <div className="flight-col flight-time">
                  <ClockIcon className="time-icon" />
                  {formatTime(flight.type === 'arrival' ? flight.scheduledArrival : flight.scheduledDeparture)}
                </div>
                <div className="flight-col flight-gate">{flight.gate || 'TBD'}</div>
                <div className={`flight-col flight-status ${getStatusColor(flight.status)}`}>
                  {flight.status}
                </div>
              </div>
              
              {/* Expanded flight details */}
              {selectedFlight === flight.flightNumber && flight.details && (
                <div className="flight-details">
                  <div className="flight-details-grid">
                    <div className="detail-group">
                      <h4>Flight Information</h4>
                      <p><strong>Aircraft:</strong> {flight.details.aircraft?.model || 'Unknown'}</p>
                      <p><strong>Registration:</strong> {flight.details.aircraft?.registration || 'Unknown'}</p>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Origin</h4>
                      <p><strong>Airport:</strong> {flight.details.origin?.name || flight.origin}</p>
                      <p><strong>Terminal:</strong> {flight.details.origin?.terminal || 'Unknown'}</p>
                      <p><strong>Gate:</strong> {flight.details.origin?.gate || flight.gate || 'TBD'}</p>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Destination</h4>
                      <p><strong>Airport:</strong> {flight.details.destination?.name || flight.destination}</p>
                      <p><strong>Terminal:</strong> {flight.details.destination?.terminal || 'Unknown'}</p>
                      <p><strong>Gate:</strong> {flight.details.destination?.gate || 'TBD'}</p>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Departure</h4>
                      <p><strong>Scheduled:</strong> {formatDate(flight.details.schedule?.scheduledDeparture)} {formatTime(flight.details.schedule?.scheduledDeparture)}</p>
                      <p><strong>Estimated:</strong> {formatDate(flight.details.schedule?.estimatedDeparture)} {formatTime(flight.details.schedule?.estimatedDeparture)}</p>
                      {flight.details.schedule?.actualDeparture && (
                        <p><strong>Actual:</strong> {formatDate(flight.details.schedule?.actualDeparture)} {formatTime(flight.details.schedule?.actualDeparture)}</p>
                      )}
                    </div>
                    
                    <div className="detail-group">
                      <h4>Arrival</h4>
                      <p><strong>Scheduled:</strong> {formatDate(flight.details.schedule?.scheduledArrival)} {formatTime(flight.details.schedule?.scheduledArrival)}</p>
                      <p><strong>Estimated:</strong> {formatDate(flight.details.schedule?.estimatedArrival)} {formatTime(flight.details.schedule?.estimatedArrival)}</p>
                      {flight.details.schedule?.actualArrival && (
                        <p><strong>Actual:</strong> {formatDate(flight.details.schedule?.actualArrival)} {formatTime(flight.details.schedule?.actualArrival)}</p>
                      )}
                    </div>
                  </div>
                  
                  {flight.details.delay && (flight.details.delay.departure > 0 || flight.details.delay.arrival > 0) && (
                    <div className="delay-information">
                      <h4>Delay Information</h4>
                      {flight.details.delay.departure > 0 && (
                        <p>Departure Delay: {flight.details.delay.departure} minutes</p>
                      )}
                      {flight.details.delay.arrival > 0 && (
                        <p>Arrival Delay: {flight.details.delay.arrival} minutes</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      
      <div className="flight-info-footer">
        <button 
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            axios.get(`/api/flights/${airport}`)
              .then(response => {
                setFlights(response.data);
                setError(null);
              })
              .catch(err => {
                console.error('Error refreshing flights:', err);
                setError('Failed to refresh flight information');
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default FlightInfo;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WaitTimes = ({ airport }) => {
  const [waitTimes, setWaitTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch wait times for the selected airport
  useEffect(() => {
    if (!airport) return;
    
    const fetchWaitTimes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/security/${airport}/wait-times`);
        setWaitTimes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching wait times:', err);
        setError('Unable to load security wait times');
        
        // For demo/development purposes, generate mock data if API fails
        generateMockWaitTimes();
      } finally {
        setLoading(false);
      }
    };
    
    // Generate mock wait times (for demo/development)
    const generateMockWaitTimes = () => {
      const checkpoints = ['Terminal 1', 'Terminal 2', 'Terminal 3', 'International'];
      const mockTimes = checkpoints.map(checkpoint => {
        // Random wait time between 5 and 45 minutes
        const waitMinutes = Math.floor(Math.random() * 40) + 5;
        
        // Determine status based on wait time
        let status;
        if (waitMinutes < 15) {
          status = 'low';
        } else if (waitMinutes < 30) {
          status = 'medium';
        } else {
          status = 'high';
        }
        
        return {
          id: checkpoint.toLowerCase().replace(/\s+/g, '-'),
          checkpoint,
          waitMinutes,
          status,
          lastUpdated: new Date().toISOString()
        };
      });
      
      setWaitTimes(mockTimes);
    };
    
    fetchWaitTimes();
    
    // Set up refresh interval (every 5 minutes)
    const refreshInterval = setInterval(fetchWaitTimes, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [airport]);
  
  // Format the time since last update
  const formatLastUpdated = (isoDate) => {
    const lastUpdate = new Date(isoDate);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastUpdate) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes === 1) {
      return '1 minute ago';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="wait-times-widget">
      <h3 className="widget-title">Security Wait Times</h3>
      
      {loading && waitTimes.length === 0 ? (
        <div className="loading-message">Loading wait times...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : waitTimes.length === 0 ? (
        <div className="no-data-message">No wait time data available</div>
      ) : (
        <div className="wait-times-list">
          {waitTimes.map(checkpoint => (
            <div 
              key={checkpoint.id} 
              className={`wait-time-item status-${checkpoint.status}`}
            >
              <div className="checkpoint-info">
                <h4 className="checkpoint-name">{checkpoint.checkpoint}</h4>
                <div className="wait-time">
                  <span className="wait-minutes">{checkpoint.waitMinutes}</span>
                  <span className="minutes-label">min</span>
                </div>
              </div>
              
              <div className="status-indicator">
                <div className={`status-bar status-${checkpoint.status}`}>
                  <div 
                    className="status-fill"
                    style={{ 
                      width: `${Math.min(100, (checkpoint.waitMinutes / 45) * 100)}%` 
                    }}
                  ></div>
                </div>
                <span className="status-label">
                  {checkpoint.status === 'low' ? 'Low' : 
                   checkpoint.status === 'medium' ? 'Moderate' : 'High'}
                </span>
              </div>
              
              <div className="update-time">
                Updated {formatLastUpdated(checkpoint.lastUpdated)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="wait-times-footer">
        <button 
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            axios.get(`/api/security/${airport}/wait-times`)
              .then(response => {
                setWaitTimes(response.data);
                setError(null);
              })
              .catch(err => {
                console.error('Error refreshing wait times:', err);
                setError('Failed to refresh wait times');
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

export default WaitTimes;
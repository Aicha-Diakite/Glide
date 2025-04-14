import React, { useState, useEffect } from 'react';
import { fetchSecurityWaitTimes } from '../services/security';

const SecurityWait = ({ airport }) => {
  const [waitTimes, setWaitTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch wait times for the selected airport
  useEffect(() => {
    if (!airport) return;
    
    const getWaitTimes = async () => {
      try {
        setLoading(true);
        const data = await fetchSecurityWaitTimes(airport);
        setWaitTimes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching wait times:', err);
        setError('Failed to load security wait times');
        
        // Mock data for MVP
        const mockTimes = [
          {
            id: "security-t1",
            checkpoint: "Terminal 1 Security",
            waitMinutes: Math.floor(Math.random() * 40) + 5,
            status: "low",
            lastUpdated: new Date().toISOString()
          },
          {
            id: "security-t2",
            checkpoint: "Terminal 2 Security",
            waitMinutes: Math.floor(Math.random() * 40) + 5,
            status: "medium",
            lastUpdated: new Date().toISOString()
          },
          {
            id: "security-t3",
            checkpoint: "Terminal 3 Security",
            waitMinutes: Math.floor(Math.random() * 40) + 5,
            status: "high",
            lastUpdated: new Date().toISOString()
          }
        ];
        
        // Update status based on wait time
        mockTimes.forEach(checkpoint => {
          if (checkpoint.waitMinutes < 15) {
            checkpoint.status = 'low';
          } else if (checkpoint.waitMinutes < 30) {
            checkpoint.status = 'medium';
          } else {
            checkpoint.status = 'high';
          }
        });
        
        setWaitTimes(mockTimes);
      } finally {
        setLoading(false);
      }
    };
    
    getWaitTimes();
    
    // Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(getWaitTimes, 5 * 60 * 1000);
    
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
  
  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await fetchSecurityWaitTimes(airport);
      setWaitTimes(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing wait times:', err);
      setError('Failed to refresh wait times');
    } finally {
      setLoading(false);
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
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default SecurityWait;
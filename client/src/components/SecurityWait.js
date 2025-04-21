import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSecurityWaitTimes } from '../services/security';
import AirplaneLogo from '../components/AirplaneLogo';

const SecurityWait = ({ standalone = false }) => {
  const navigate = useNavigate();
  const [waitTimes, setWaitTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch wait times for the selected airport (default to SFO)
  useEffect(() => {
    const airport = 'sfo'; // Default to SFO
    
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
  }, []);
  
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
      const data = await fetchSecurityWaitTimes('sfo');
      setWaitTimes(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing wait times:', err);
      setError('Failed to refresh wait times');
    } finally {
      setLoading(false);
    }
  };

  // Handle back button click (for standalone mode only)
  const handleBack = () => {
    navigate('/app');
  };
  
  // Render in standalone mode (full page)
  if (standalone) {
    return (
      <div className="app-container">
        <header className="app-header" style={{ backgroundColor: '#0096FF' }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AirplaneLogo width={32} height={32} color="white" />
            <h1 className="app-title">Glide</h1>
            <p className="app-tagline" style={{ marginLeft: '10px' }}>Airport Navigation Made Simple</p>
          </div>
          
          <div className="header-right">
            <button 
              className="profile-button"
              onClick={() => {}}
              aria-label="User Profile"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>
        </header>
        
        <div className="security-page">
          <div className="back-button-container" style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <button 
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#0096FF',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Map
            </button>
          </div>
          
          <div className="security-content" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', textAlign: 'center' }}>Security Wait Times</h2>
            
            {loading && waitTimes.length === 0 ? (
              <div className="loading-spinner-container" style={{ textAlign: 'center', padding: '30px' }}>
                <div className="loading-spinner"></div>
                <p>Loading wait times...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : waitTimes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>No wait time data available</p>
              </div>
            ) : (
              <div className="wait-times-list">
                {waitTimes.map(checkpoint => (
                  <div 
                    key={checkpoint.id} 
                    className={`wait-time-item status-${checkpoint.status}`}
                    style={{ marginBottom: '16px' }}
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
                          style={{ width: `${Math.min(100, (checkpoint.waitMinutes / 45) * 100)}%` }}
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
            
            <div className="wait-times-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="refresh-button"
                onClick={handleRefresh}
                disabled={loading}
                style={{ maxWidth: '200px' }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '15px' }}>
                Security wait times are updated in real-time based on current passenger volume.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render as widget (embedded in sidebar)
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
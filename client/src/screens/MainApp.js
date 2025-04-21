import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileIcon from '../components/ProfileIcon';

const MainApp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSecurityClick = () => {
    navigate('/security-wait-times');
  };

  return (
    <div className="app-container" style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#0096FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>
            Glide <span style={{ color: '#2563eb' }}>✈</span>
          </h1>
          
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={handleSecurityClick}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Security Wait Times
          </button>
          <ProfileIcon />
        </div>
      </header>
  
      {/* Main content that overflows */}
      <main style={{ flexGrow: 1 }}>
        {/* Huge map section */}
        <div style={{ width: '95%', height: '85vh' }}>
          <iframe
            src="https://app.mappedin.com/map/6686b845c9f6d6000bc30300?embedded=true"
            title="Mappedin Airport Demo Map"
            allow="clipboard-write; web-share"
            style={{
              width: '95%',
              height: '100%',
              border: 'none'
            }}
          />
        </div>
  
 
        {/* Footer */}
        <footer style={{
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e5e7eb',
          padding: '40px 20px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            {/* Shortened footer sections for clarity */}
            <div>
              <h3>Glide <span style={{ color: '#2563eb' }}>✈</span></h3>
              <p>Making airport navigation simple and stress-free.</p>
            </div>
            <div>
              <h3>Quick Links</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#">Home</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Supported Airports</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3>Legal</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3>Contact</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li><a href="mailto:support@glideapp.com">support@glideapp.com</a></li>
                
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
  
};

export default MainApp;
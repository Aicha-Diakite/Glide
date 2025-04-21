import React from 'react';

const AirplaneLogo = () => {
  return (
    <div className="app-logo-container">
      <h1 className="app-title">
        Glide <span className="app-icon">
          <img 
            src="/airplane-icon.jpg" 
            alt="Airplane icon" 
            className="airplane-icon"
          />
        </span>
      </h1>
      <style jsx>{`
        .app-logo-container {
          display: flex;
          align-items: center;
        }
        
        .app-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .app-icon {
          display: inline-flex;
        }
        
        .airplane-icon {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </div>
  );
};

export default AirplaneLogo;
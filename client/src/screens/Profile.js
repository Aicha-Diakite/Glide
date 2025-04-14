import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, MapPin, Heart, HelpCircle, Settings } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  
  // Mock user data
  const user = {
    name: 'Adams',
    email: 'adams@example.com',
    recentAirports: ['SFO', 'JFK', 'ORD'],
    favorites: [
      { id: 'restaurant-1', name: 'Napa Farms Market', type: 'restaurant', airport: 'SFO' },
      { id: 'lounge-1', name: 'United Club', type: 'lounge', airport: 'SFO' },
      { id: 'shop-1', name: 'InMotion Entertainment', type: 'shop', airport: 'JFK' }
    ]
  };
  
  const goBack = () => {
    navigate('/app');
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>
      </div>
      
      <div className="profile-content">
        <div className="user-info">
          <div className="user-avatar">
            <User size={48} />
          </div>
          <div className="user-details">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <button className="edit-profile-button">Edit Profile</button>
          </div>
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <h3>
              <FileText size={20} />
              <span>Travel Documentation</span>
            </h3>
            <p className="section-description">View your travel documentation</p>
          </div>
          
          <div className="profile-section">
            <h3>
              <MapPin size={20} />
              <span>Recent Visits</span>
            </h3>
            <p className="section-description">View your recently visited airports and travel destinations</p>
            {user.recentAirports.length > 0 && (
              <div className="recent-airports">
                {user.recentAirports.map((airport, index) => (
                  <div key={`recent-${index}`} className="recent-airport-item">
                    {airport}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <h3>
              <Heart size={20} />
              <span>User Favorites</span>
            </h3>
            <p className="section-description">View your favorited airport locations (restaurants, lounges, gift shops, etc.)</p>
            {user.favorites.length > 0 && (
              <div className="favorite-items">
                {user.favorites.map((favorite) => (
                  <div key={favorite.id} className="favorite-item">
                    <span className="favorite-name">{favorite.name}</span>
                    <span className="favorite-details">
                      {favorite.type} at {favorite.airport}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <h3>
              <HelpCircle size={20} />
              <span>Support Center</span>
            </h3>
            <p className="section-description">Answer any support questions here</p>
          </div>
          
          <div className="profile-section">
            <h3>
              <Settings size={20} />
              <span>Settings</span>
            </h3>
            <p className="section-description">View and set your account preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
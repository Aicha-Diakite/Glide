import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import '../styles/ProfileIcon.css';

const ProfileIcon = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  const userEmail = localStorage.getItem('userEmail') || 'No email set';
  const userName = localStorage.getItem('userName') || 'User';

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const navigateToProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const handleSignOut = () => {
    // Clear auth data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Redirect to sign in
    navigate('/signin');
  };

  return (
    <div className="profile-icon-container" ref={dropdownRef}>
      <button 
        className="profile-icon-button" 
        onClick={handleProfileClick}
        aria-label="Profile"
      >
        <User size={24} color="white" />
      </button>

      {dropdownOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <h3 className="profile-name">{userName}</h3>
            <p className="profile-email">{userEmail}</p>
          </div>

          <div className="profile-dropdown-items">
            <button 
              className="profile-dropdown-item" 
              onClick={navigateToProfile}
            >
              View Profile
            </button>
            
            <button 
              className="profile-dropdown-item" 
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
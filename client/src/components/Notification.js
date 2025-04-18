import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ type = 'success', message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300); // Allow time for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  return (
    <div className={`notification ${type} ${visible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <p>{message}</p>
        <button className="notification-close" onClick={handleClose}>×</button>
      </div>
    </div>
  );
};

export default Notification;
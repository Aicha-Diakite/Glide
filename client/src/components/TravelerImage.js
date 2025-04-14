import React from 'react';

const TravelerImage = () => {
  return (
    <svg 
      width="300" 
      height="300" 
      viewBox="0 0 300 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Person's head */}
      <path d="M139 40C139 40 120 45 115 65C110 85 115 100 125 105C135 110 150 105 155 95C160 85 155 65 139 40Z" fill="#2D3648" />
      
      {/* Face */}
      <path d="M145 70C145 70 155 75 155 90C155 105 145 110 145 110" fill="#F8A195" />
      <path d="M135 65C135 65 125 75 125 90C125 105 135 115 135 115" fill="#F8A195" />
      <ellipse cx="135" cy="90" rx="15" ry="25" fill="#F8A195" />
      
      {/* Shirt */}
      <rect x="115" y="120" width="60" height="80" rx="5" fill="#F0C674" />
      
      {/* Backpack */}
      <ellipse cx="95" cy="140" rx="25" ry="40" fill="#4A89DC" />
      <path d="M115 120C115 120 95 120 95 140C95 160 95 180 95 180" stroke="#4A89DC" strokeWidth="10" />
      
      {/* Pants */}
      <rect x="115" y="200" width="30" height="80" fill="#2D3648" />
      <rect x="145" y="200" width="30" height="80" fill="#2D3648" />
      
      {/* Shoes */}
      <ellipse cx="130" cy="285" rx="15" ry="5" fill="#1F2D3D" />
      <ellipse cx="160" cy="285" rx="15" ry="5" fill="#1F2D3D" />
      
      {/* Suitcase */}
      <rect x="175" y="225" width="50" height="70" rx="5" fill="#4A89DC" />
      <rect x="185" y="220" width="30" height="5" fill="#4A89DC" />
      <rect x="175" y="245" width="50" height="5" fill="#2D3648" />
      <rect x="175" y="265" width="50" height="5" fill="#2D3648" />
      
      {/* Suitcase handle */}
      <rect x="195" y="200" width="5" height="20" fill="#D8D8D8" />
      <rect x="200" y="195" width="20" height="5" fill="#D8D8D8" />
      <path d="M200 195C200 195 195 190 190 200" stroke="#D8D8D8" strokeWidth="5" />
    </svg>
  );
};

export default TravelerImage;
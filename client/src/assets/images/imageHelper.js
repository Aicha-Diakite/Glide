// Convert traveler SVG to component

export const TravelerSVG = () => (
    <svg 
      width="240" 
      height="240" 
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Person's head */}
      <path d="M110 50C110 50 95 55 90 70C85 85 90 95 100 100C110 105 120 100 125 90C130 80 125 65 110 50Z" fill="#2D3648" />
      
      {/* Face */}
      <path d="M100 65C100 65 95 70 95 85C95 100 100 105 100 105" fill="#F8A195" />
      <ellipse cx="105" cy="80" rx="10" ry="20" fill="#F8A195" />
      
      {/* Body */}
      <rect x="90" y="110" width="40" height="60" rx="5" fill="#F0C674" />
      
      {/* Backpack */}
      <ellipse cx="75" cy="125" rx="20" ry="25" fill="#4A89DC" />
      <path d="M90 110C90 110 75 110 75 125C75 140 75 160 75 160" stroke="#4A89DC" strokeWidth="8" />
      
      {/* Pants */}
      <rect x="90" y="170" width="20" height="60" fill="#2D3648" />
      <rect x="110" y="170" width="20" height="60" fill="#2D3648" />
      
      {/* Shoes */}
      <ellipse cx="100" cy="230" rx="10" ry="5" fill="#1F2D3D" />
      <ellipse cx="120" cy="230" rx="10" ry="5" fill="#1F2D3D" />
      
      {/* Suitcase */}
      <rect x="140" y="180" width="40" height="55" rx="5" fill="#4A89DC" />
      <rect x="145" y="175" width="30" height="5" fill="#4A89DC" />
      <rect x="140" y="190" width="40" height="5" fill="#2D3648" />
      <rect x="140" y="210" width="40" height="5" fill="#2D3648" />
      
      {/* Suitcase handle */}
      <rect x="160" y="160" width="4" height="15" fill="#D8D8D8" />
      <rect x="160" y="155" width="15" height="5" fill="#D8D8D8" />
    </svg>
  );
  
  export default {
    TravelerSVG
  };
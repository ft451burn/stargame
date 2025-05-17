import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const zoomStarAnimation = keyframes`
  0% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.2; transform: scale(0.8); }
`;

const blinkLaserAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${floatAnimation} 6s ease-in-out infinite;
`;

const TitleText = styled.h1`
  color: #FFD700;
  font-size: 5rem;
  margin: 1rem 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  text-align: center;
  letter-spacing: 0.15em;
  animation: ${pulseAnimation} 4s infinite ease-in-out;
`;

// SVG styled components
const StyledSVG = styled.svg`
  .cosmic-ring-1 {
    animation: ${rotateAnimation} 60s linear infinite;
  }
  
  .cosmic-ring-2 {
    animation: ${rotateAnimation} 40s linear infinite reverse;
  }
  
  .center-planet {
    animation: ${pulseAnimation} 3s infinite ease-in-out;
  }
  
  .star {
    animation: ${zoomStarAnimation} 5s infinite;
    animation-delay: var(--delay, 0s);
  }
  
  .laser {
    animation: ${blinkLaserAnimation} 1s infinite;
  }
  
  .ship {
    animation: ${floatAnimation} 4s ease-in-out infinite;
  }
  
  .cosmic-plane {
    animation: ${pulseAnimation} 8s infinite ease-in-out;
  }
`;

interface RetroLogoProps {
  width?: number;
  height?: number;
}

const RetroLogo: React.FC<RetroLogoProps> = ({ width = 300, height = 200 }) => {
  return (
    <LogoContainer>
      <StyledSVG width={width} height={height} viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        {/* Background elements - stars */}
        <circle className="star" style={{ '--delay': '0s' } as React.CSSProperties} cx="50" cy="30" r="2" fill="#FFD700" />
        <circle className="star" style={{ '--delay': '1s' } as React.CSSProperties} cx="90" cy="70" r="1.5" fill="#FFF" />
        <circle className="star" style={{ '--delay': '2s' } as React.CSSProperties} cx="150" cy="20" r="2" fill="#FFF" />
        <circle className="star" style={{ '--delay': '0.5s' } as React.CSSProperties} cx="200" cy="40" r="1.5" fill="#FFD700" />
        <circle className="star" style={{ '--delay': '1.5s' } as React.CSSProperties} cx="270" cy="60" r="2" fill="#FFF" />
        <circle className="star" style={{ '--delay': '2.5s' } as React.CSSProperties} cx="30" cy="120" r="1.5" fill="#FFD700" />
        <circle className="star" style={{ '--delay': '1.2s' } as React.CSSProperties} cx="80" cy="180" r="2" fill="#FFF" />
        <circle className="star" style={{ '--delay': '0.7s' } as React.CSSProperties} cx="230" cy="170" r="1.5" fill="#FFD700" />
        <circle className="star" style={{ '--delay': '1.7s' } as React.CSSProperties} cx="260" cy="130" r="2" fill="#FFF" />
        
        {/* Abstract cosmic elements */}
        <ellipse className="cosmic-plane" cx="150" cy="120" rx="130" ry="10" fill="#611D8D" opacity="0.5" />
        <ellipse className="cosmic-plane" cx="150" cy="140" rx="100" ry="8" fill="#1E88E5" opacity="0.4" />
        
        {/* Atomic/orbital rings - Lem-inspired cosmic elements */}
        <ellipse className="cosmic-ring-1" cx="150" cy="100" rx="70" ry="60" stroke="#FFD700" strokeWidth="1" fill="none" />
        <ellipse className="cosmic-ring-2" cx="150" cy="100" rx="50" ry="40" stroke="#F50057" strokeWidth="1" fill="none" />
        
        {/* Center cosmic element */}
        <circle className="center-planet" cx="150" cy="100" r="10" fill="#FF3D00" />
        
        {/* Retro spaceship - simple geometric shapes */}
        <g className="ship" transform="translate(110, 45) rotate(15)">
          {/* Ship main body */}
          <ellipse cx="40" cy="40" rx="30" ry="12" fill="#B0BEC5" />
          
          {/* Cockpit */}
          <circle cx="60" cy="40" r="10" fill="#29B6F6" />
          
          {/* Engine/thruster */}
          <rect x="5" y="35" width="10" height="10" fill="#F50057" />
          
          {/* Wings */}
          <polygon points="25,28 55,25 45,35" fill="#FFA000" />
          <polygon points="25,52 55,55 45,45" fill="#FFA000" />
          
          {/* Antenna */}
          <line x1="65" y1="35" x2="70" y2="30" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="70" cy="30" r="2" fill="#FF3D00" />
        </g>
        
        {/* Laser beam */}
        <line className="laser" x1="175" y1="45" x2="260" y2="20" stroke="#F50057" strokeWidth="2" strokeDasharray="3,2" />
      </StyledSVG>
      <TitleText>STARGAME</TitleText>
    </LogoContainer>
  );
};

export default RetroLogo; 
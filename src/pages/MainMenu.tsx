import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import RetroLogo from '../components/RetroLogo';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #000;
  overflow: hidden;
`;

const Title = styled.h1`
  color: #FFD700;
  font-size: 5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  text-align: center;
`;

const MenuButton = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 1rem 2rem;
  margin: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #FFD700;
    color: #FFD700;
    transform: scale(1.05);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
`;

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [logoSize, setLogoSize] = useState({ width: 400, height: 300 });
  
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth * 0.8, 500);
      const height = width * 0.75;
      setLogoSize({ width, height });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleStartGame = () => {
    navigate('/game');
  };
  
  const handleOptions = () => {
    navigate('/options');
  };
  
  return (
    <MenuContainer>
      <RetroLogo width={logoSize.width} height={logoSize.height} />
      <ButtonContainer>
        <MenuButton onClick={handleStartGame}>START</MenuButton>
        <MenuButton onClick={handleOptions}>OPTIONS</MenuButton>
      </ButtonContainer>
    </MenuContainer>
  );
};

export default MainMenu; 
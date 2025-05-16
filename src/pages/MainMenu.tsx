import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #000;
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

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  
  const handleStartGame = () => {
    navigate('/game');
  };
  
  const handleOptions = () => {
    navigate('/options');
  };
  
  return (
    <MenuContainer>
      <Title>STARGAME</Title>
      <MenuButton onClick={handleStartGame}>START</MenuButton>
      <MenuButton onClick={handleOptions}>OPTIONS</MenuButton>
    </MenuContainer>
  );
};

export default MainMenu; 
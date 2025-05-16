import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const OptionsContainer = styled.div`
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
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  width: 300px;
`;

const OptionLabel = styled.span`
  color: white;
  font-size: 1.2rem;
  flex: 1;
`;

const OptionControl = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1.5rem;
  margin-top: 2rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #FFD700;
    color: #FFD700;
  }
`;

const OptionsScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <OptionsContainer>
      <Title>OPTIONS</Title>
      
      <OptionRow>
        <OptionLabel>Music Volume:</OptionLabel>
        <OptionControl>
          <input type="range" min="0" max="100" defaultValue="70" />
        </OptionControl>
      </OptionRow>
      
      <OptionRow>
        <OptionLabel>Sound Effects:</OptionLabel>
        <OptionControl>
          <input type="range" min="0" max="100" defaultValue="80" />
        </OptionControl>
      </OptionRow>
      
      <OptionRow>
        <OptionLabel>Difficulty:</OptionLabel>
        <OptionControl>
          <select defaultValue="medium">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </OptionControl>
      </OptionRow>
      
      <Button onClick={handleBack}>BACK</Button>
    </OptionsContainer>
  );
};

export default OptionsScreen; 
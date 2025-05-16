import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GameEngine } from '../game/GameEngine';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: #000;
  position: relative;
`;

const StyledCanvas = styled.canvas`
  background-color: #000;
  border: 1px solid #333;
`;

const GameOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
`;

const OverlayText = styled.h2`
  color: #FFD700;
  font-size: 3rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #FFD700;
    color: #FFD700;
  }
`;

const GameScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    
    // Initialize game engine
    const gameEngine = new GameEngine(canvas);
    gameEngineRef.current = gameEngine;
    
    // Start the game
    gameEngine.start();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;
      gameEngine.resize(canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);
  
  const handleMainMenu = () => {
    navigate('/');
  };
  
  const handleRetry = () => {
    setGameOver(false);
    if (gameEngineRef.current) {
      // Reset game logic would go here
      gameEngineRef.current.start();
    }
  };
  
  return (
    <GameContainer>
      <StyledCanvas ref={canvasRef} />
      
      {gameOver && (
        <GameOverlay>
          <OverlayText>Game Over</OverlayText>
          <Button onClick={handleRetry}>Retry</Button>
          <Button onClick={handleMainMenu} style={{ marginTop: '1rem' }}>Main Menu</Button>
        </GameOverlay>
      )}
    </GameContainer>
  );
};

export default GameScreen; 
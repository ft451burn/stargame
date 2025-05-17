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

const ScoreText = styled.h3`
  color: #FFD700;
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  gap: 1rem;
`;

const Button = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #FFD700;
    color: #FFD700;
  }
`;

const ControlsText = styled.p`
  color: #FFD700;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

interface HighScore {
  score: number;
  date: string;
}

const GameScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
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
    
    // Check game state periodically
    const gameStateInterval = setInterval(() => {
      if (gameEngine.isGameOver()) {
        setGameOver(true);
        const finalScore = gameEngine.getScore();
        setScore(finalScore);
        saveHighScore(finalScore);
        clearInterval(gameStateInterval);
      }
    }, 500);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth * 0.8;
      canvas.height = window.innerHeight * 0.8;
      gameEngine.resize(canvas.width, canvas.height);
    };
    
    // Handle pause with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameStateInterval);
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);
  
  const saveHighScore = (score: number) => {
    if (scoreSaved) return;
    
    try {
      // Get existing scores
      const existingScoresJSON = localStorage.getItem('stargame_highscores') || '[]';
      const existingScores = JSON.parse(existingScoresJSON) as HighScore[];
      
      // Add new score
      const newScore: HighScore = {
        score,
        date: new Date().toISOString()
      };
      
      existingScores.push(newScore);
      
      // Sort scores (highest first)
      existingScores.sort((a, b) => b.score - a.score);
      
      // Keep only top 10 scores
      const topScores = existingScores.slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem('stargame_highscores', JSON.stringify(topScores));
      
      setScoreSaved(true);
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };
  
  const handleMainMenu = () => {
    navigate('/');
  };
  
  const handleRetry = () => {
    setGameOver(false);
    setIsPaused(false);
    setScoreSaved(false);
    if (gameEngineRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Reinitialize the game engine
      const gameEngine = new GameEngine(canvas);
      gameEngineRef.current = gameEngine;
      gameEngine.start();
    }
  };
  
  const handleContinue = () => {
    setIsPaused(false);
  };
  
  const handleHighScores = () => {
    navigate('/highscores');
  };
  
  return (
    <GameContainer>
      <StyledCanvas ref={canvasRef} />
      
      {gameOver && (
        <GameOverlay>
          <OverlayText>Game Over</OverlayText>
          <ScoreText>Your Score: {score}</ScoreText>
          <ButtonContainer>
            <Button onClick={handleRetry}>Retry</Button>
            <Button onClick={handleHighScores}>High Scores</Button>
            <Button onClick={handleMainMenu}>Main Menu</Button>
          </ButtonContainer>
        </GameOverlay>
      )}
      
      {isPaused && !gameOver && (
        <GameOverlay>
          <OverlayText>Paused</OverlayText>
          <ControlsText>
            <strong>Controls:</strong>
            <br />
            Arrow Keys - Move ship
            <br />
            Space - Fire weapon
            <br />
            Escape - Pause/Resume
          </ControlsText>
          <ControlsText>
            <strong>Power-ups:</strong>
            <br />
            🔴 Red - Weapon upgrade
            <br />
            🔵 Blue - Shield
            <br />
            🟢 Green - Extra life
            <br />
            🟡 Yellow - Speed boost
            <br />
            🟣 Purple - Multishot
          </ControlsText>
          <ButtonContainer>
            <Button onClick={handleContinue}>Continue</Button>
            <Button onClick={handleMainMenu}>Main Menu</Button>
          </ButtonContainer>
        </GameOverlay>
      )}
    </GameContainer>
  );
};

export default GameScreen; 
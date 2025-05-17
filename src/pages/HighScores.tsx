import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ScoresContainer = styled.div`
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
  font-size: 4rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  text-align: center;
`;

const ScoresList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid #FFD700;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  min-width: 300px;
  max-width: 500px;
  max-height: 400px;
  overflow-y: auto;
`;

const ScoreItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScoreRank = styled.span`
  color: #FFD700;
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 30px;
`;

const ScoreValue = styled.span`
  color: white;
  font-size: 1.2rem;
  margin-left: 1rem;
  text-align: right;
`;

const Button = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 0.8rem 2rem;
  font-size: 1.3rem;
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

const NoScores = styled.p`
  color: #FFD700;
  font-size: 1.2rem;
  text-align: center;
  margin: 1rem 0;
`;

interface HighScore {
  score: number;
  date: string;
}

const HighScores: React.FC = () => {
  const [scores, setScores] = useState<HighScore[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load scores from localStorage
    const loadScores = () => {
      const savedScores = localStorage.getItem('stargame_highscores');
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          // Sort scores in descending order
          parsedScores.sort((a: HighScore, b: HighScore) => b.score - a.score);
          setScores(parsedScores);
        } catch (error) {
          console.error('Error parsing high scores:', error);
          setScores([]);
        }
      }
    };
    
    loadScores();
  }, []);
  
  const handleBackToMenu = () => {
    navigate('/');
  };
  
  return (
    <ScoresContainer>
      <Title>High Scores</Title>
      <ScoresList>
        {scores.length > 0 ? (
          scores.slice(0, 10).map((score, index) => (
            <ScoreItem key={index}>
              <ScoreRank>#{index + 1}</ScoreRank>
              <ScoreValue>{score.score.toLocaleString()}</ScoreValue>
            </ScoreItem>
          ))
        ) : (
          <NoScores>No scores yet. Play the game to set some records!</NoScores>
        )}
      </ScoresList>
      <Button onClick={handleBackToMenu}>Back to Menu</Button>
    </ScoresContainer>
  );
};

export default HighScores; 
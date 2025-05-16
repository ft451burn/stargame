import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import OptionsScreen from './pages/OptionsScreen';
import './App.css';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
`;

function App() {
  return (
    <AppContainer>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/options" element={<OptionsScreen />} />
        </Routes>
      </Router>
    </AppContainer>
  );
}

export default App;

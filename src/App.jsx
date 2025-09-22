import React, { useState } from 'react';
import Menu from './components/Menu.jsx';
import Game from './components/Game.jsx';

/**
 * App Component - Main application component
 * Manages navigation between Menu and Game screens
 */
function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  const startGame = () => {
    setCurrentScreen('game');
  };

  const returnToMenu = () => {
    setCurrentScreen('menu');
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      {currentScreen === 'menu' && (
        <Menu onStartGame={startGame} />
      )}
      {currentScreen === 'game' && (
        <Game onReturnToMenu={returnToMenu} />
      )}
    </div>
  );
}

export default App;

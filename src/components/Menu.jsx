import React, { useState, useEffect } from 'react';

/**
 * Menu Component - Main menu screen for Ofek's Game
 * Displays the game title and start button with cheerful animations
 */
const Menu = ({ onStartGame }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize global game settings
  useEffect(() => {
    if (!window.gameSettings) {
      window.gameSettings = { soundEnabled: true };
    }
    setSoundEnabled(window.gameSettings.soundEnabled);
  }, []);

  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    window.gameSettings = { soundEnabled: newSoundEnabled };
  };
  return (
    <div className="menu-container fade-in">
      {/* Animated background elements */}
      <div className="menu-background">
        <div className="floating-shape yellow"></div>
        <div className="floating-shape orange"></div>
        <div className="floating-shape green"></div>
        <div className="floating-shape pink"></div>
      </div>

      {/* Main content */}
      <div className="menu-content">
        <h1 className="game-title">
          Ofek's Game
        </h1>
        
        <button
          onClick={onStartGame}
          className="game-button"
          aria-label="Start the game"
        >
          🌟 Start 🌟
        </button>
        
        <p className="game-instructions">
          Press any key to make ripples! 🌊
        </p>
        
        {/* Sound control */}
        <div className="sound-control">
          <label className="sound-checkbox">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleSoundToggle}
            />
            <span className="checkmark"></span>
            <span className="sound-label">🔊 Sound Effects</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Menu;

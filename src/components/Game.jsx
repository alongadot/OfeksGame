import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '../scenes/GameScene.js';

/**
 * Game Component - React wrapper for the Phaser game
 * Manages Phaser game lifecycle and communication with React
 */
const Game = ({ onReturnToMenu }) => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      backgroundColor: '#60A5FA',
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    // Create Phaser game instance
    phaserGameRef.current = new Phaser.Game(config);

    // Listen for return to menu event from the game scene
    const setupEventListener = () => {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene');
      if (gameScene && gameScene.scene.isActive()) {
        gameScene.events.on('returnToMenu', onReturnToMenu);
      } else {
        // Retry after a short delay if scene isn't ready
        setTimeout(setupEventListener, 100);
      }
    };
    
    setupEventListener();

    // Handle window resize
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [onReturnToMenu]);

  return (
    <div 
      ref={gameRef} 
      className="game-container"
    />
  );
};

export default Game;

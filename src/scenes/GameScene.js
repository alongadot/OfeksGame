import Phaser from 'phaser';

/**
 * GameScene - Main Phaser scene for the ripple game
 * Handles water-like background, ripple effects, click counting, and sound
 */
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.clickCount = 0;
    this.ripples = [];
    this.clickCounters = [];
  }

  preload() {
    // Create a simple beep sound using Web Audio API
    this.createSplashSound();
  }

  create() {
    // Set up the water-like animated background
    this.createWaterBackground();
    
    // Set up keyboard input for any key press
    this.input.keyboard.on('keydown', this.handleKeyPress, this);
    
    // Set up pointer (mouse/touch) input for mobile and desktop
    this.input.on('pointerdown', this.handlePointerDown, this);
    
    // Set up ESC key to return to menu - using multiple methods for better compatibility
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', this.returnToMenu, this);
    
    // Also listen for ESC key via direct keyboard events
    this.input.keyboard.on('keydown-ESC', this.returnToMenu, this);
    
    // Add browser-level ESC key listener as backup
    const handleEscKey = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        event.preventDefault();
        this.returnToMenu();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Store reference for cleanup
    this.escKeyHandler = handleEscKey;
  }

  createWaterBackground() {
    // Create multiple layers of animated gradients to simulate water
    const { width, height } = this.cameras.main;
    
    // Background gradient layers
    this.backgroundLayers = [];
    
    for (let i = 0; i < 3; i++) {
      const layer = this.add.graphics();
      this.backgroundLayers.push(layer);
    }
    
    // Start the background animation
    this.animateBackground();
  }

  animateBackground() {
    const { width, height } = this.cameras.main;
    const time = this.time.now * 0.001; // Convert to seconds
    
    // Clear all layers
    this.backgroundLayers.forEach(layer => layer.clear());
    
    // Layer 1: Base gradient using fillGradientStyle
    const layer1 = this.backgroundLayers[0];
    const color1 = Phaser.Display.Color.HSVToRGB((Math.sin(time * 0.3) * 0.1 + 0.6) % 1, 0.7, 0.9);
    const color2 = Phaser.Display.Color.HSVToRGB((Math.sin(time * 0.2) * 0.1 + 0.8) % 1, 0.6, 0.8);
    const color3 = Phaser.Display.Color.HSVToRGB((Math.sin(time * 0.25) * 0.1 + 0.7) % 1, 0.65, 0.85);
    const color4 = Phaser.Display.Color.HSVToRGB((Math.sin(time * 0.35) * 0.1 + 0.75) % 1, 0.6, 0.9);
    
    layer1.fillGradientStyle(color1.color, color2.color, color3.color, color4.color, 1);
    layer1.fillRect(0, 0, width, height);
    
    // Layer 2: Moving waves
    const layer2 = this.backgroundLayers[1];
    layer2.fillStyle(0xffffff, 0.1);
    for (let i = 0; i < 5; i++) {
      const waveY = height * 0.5 + Math.sin(time * 0.5 + i * 2) * height * 0.3;
      const waveHeight = 60 + Math.sin(time * 0.7 + i) * 20;
      layer2.fillEllipse(width * (i / 4), waveY, width * 0.8, waveHeight);
    }
    
    // Layer 3: Floating particles
    const layer3 = this.backgroundLayers[2];
    layer3.fillStyle(0xffffff, 0.15);
    for (let i = 0; i < 8; i++) {
      const x = (width * (i / 7) + Math.sin(time * 0.4 + i) * 50) % width;
      const y = (height * 0.3 + Math.sin(time * 0.6 + i * 1.5) * height * 0.4) % height;
      const size = 10 + Math.sin(time * 0.8 + i) * 5;
      layer3.fillCircle(x, y, size);
    }
  }

  createSplashSound() {
    // Create multiple pleasant sounds for variety
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Different sound configurations for variety
    const soundConfigs = [
      { freq1: 800, freq2: 400, type: 'sine', duration: 0.3 },      // Bubble 1
      { freq1: 600, freq2: 300, type: 'sine', duration: 0.25 },     // Bubble 2
      { freq1: 1000, freq2: 500, type: 'triangle', duration: 0.2 }, // Pop 1
      { freq1: 700, freq2: 350, type: 'sine', duration: 0.35 },     // Bubble 3
      { freq1: 900, freq2: 450, type: 'triangle', duration: 0.28 }, // Pop 2
      { freq1: 650, freq2: 325, type: 'sine', duration: 0.32 },     // Bubble 4
    ];
    
    this.playSplashSound = () => {
      // Check if sound is enabled (will be set from menu)
      if (window.gameSettings && !window.gameSettings.soundEnabled) {
        return;
      }
      
      // Pick a random sound configuration
      const config = soundConfigs[Math.floor(Math.random() * soundConfigs.length)];
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create the sound with random configuration
      oscillator.frequency.setValueAtTime(config.freq1, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(config.freq2, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      
      oscillator.type = config.type;
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
    };
  }

  handleKeyPress(event) {
    // Ignore ESC key as it's handled separately
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
      return;
    }
    
    this.clickCount++;
    
    // Play splash sound
    if (this.playSplashSound) {
      this.playSplashSound();
    }
    
    // Create ripple at random position
    this.createRipple();
    
    // Show click counter
    this.showClickCounter();
  }

  handlePointerDown(pointer) {
    this.clickCount++;
    
    // Play splash sound
    if (this.playSplashSound) {
      this.playSplashSound();
    }
    
    // Create ripple at the exact click/touch position
    this.createRippleAt(pointer.x, pointer.y);
    
    // Show click counter at the click/touch position
    this.showClickCounterAt(pointer.x, pointer.y);
  }

  createRipple() {
    const { width, height } = this.cameras.main;
    
    // Random position for the ripple
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(100, height - 100);
    
    this.createRippleAt(x, y);
  }

  createRippleAt(x, y) {
    // Create ripple graphics at specific position
    const ripple = this.add.graphics();
    ripple.x = x;
    ripple.y = y;
    
    // Animate the ripple
    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onUpdate: () => {
        ripple.clear();
        ripple.lineStyle(4, 0xffffff, ripple.alpha * 0.8);
        ripple.strokeCircle(0, 0, 30);
        ripple.lineStyle(2, 0xffffff, ripple.alpha * 0.4);
        ripple.strokeCircle(0, 0, 50);
      },
      onComplete: () => {
        ripple.destroy();
      }
    });
    
    this.ripples.push(ripple);
  }

  showClickCounter() {
    const { width, height } = this.cameras.main;
    
    // Position near the last ripple or center if no ripples
    const lastRipple = this.ripples[this.ripples.length - 1];
    const x = lastRipple ? lastRipple.x + 60 : width * 0.5;
    const y = lastRipple ? lastRipple.y - 40 : height * 0.5;
    
    this.showClickCounterAt(x, y);
  }

  showClickCounterAt(x, y) {
    // Create text object at specific position
    const counterText = this.add.text(x, y, this.clickCount.toString(), {
      fontSize: '48px',
      fontFamily: 'Fredoka, Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    
    counterText.setOrigin(0.5);
    
    // Animate the counter
    this.tweens.add({
      targets: counterText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      y: y - 50,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        counterText.destroy();
      }
    });
    
    this.clickCounters.push(counterText);
  }

  returnToMenu() {
    // Clean up event listener
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
    }
    
    // Emit event to parent component to return to menu
    this.scene.pause();
    this.events.emit('returnToMenu');
  }

  destroy() {
    // Clean up event listener when scene is destroyed
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
    }
    super.destroy();
  }

  update() {
    // Continuously animate the background
    this.animateBackground();
  }
}

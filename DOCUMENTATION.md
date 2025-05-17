# STARGAME Technical Documentation

This document provides technical details about the implementation of STARGAME, a space shooter game built with React and TypeScript.

## Architecture Overview

The game is structured with a clear separation between:
- UI components (React)
- Game engine (TypeScript)
- Routing and state management

### Project Structure

```
stargame/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React UI components
│   ├── game/               # Game engine
│   │   └── GameEngine.ts   # Core game logic
│   ├── pages/              # Page components
│   │   ├── GameScreen.tsx  # Game screen
│   │   ├── MainMenu.tsx    # Main menu
│   │   └── OptionsScreen.tsx # Options screen
│   ├── styles/             # Styled components
│   ├── App.tsx             # Main App component
│   └── index.tsx           # Entry point
└── package.json            # Dependencies
```

## Game Engine Design

The game engine is implemented in `GameEngine.ts` and follows a component-based design. The main components are:

### Vector2D

Represents a 2D vector with x and y coordinates, used for positions and velocities.

```typescript
export interface Vector2D {
  x: number;
  y: number;
}
```

### GameObject

Base interface for all game objects (ship, asteroids, bullets, power-ups).

```typescript
export interface GameObject {
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  rotation: number;
  render: (ctx: CanvasRenderingContext2D) => void;
  update: (deltaTime: number) => void;
}
```

### Specialized Game Objects

- **Spaceship**: Player-controlled spacecraft with physics-based movement
- **Asteroid**: Obstacles with health points
- **Bullet**: Projectiles fired by the spaceship
- **PowerUp**: Collectible items that provide temporary advantages

### Game Loop

The game uses a standard game loop pattern:

1. Process input
2. Update game state
3. Check collisions
4. Render objects
5. Request next animation frame

```typescript
private gameLoop = (timestamp: number) => {
  // Calculate delta time
  const deltaTime = (timestamp - this.lastTime) / 1000;
  this.lastTime = timestamp;
  
  // Process input
  this.processInput(deltaTime);
  
  // Update game objects
  this.update(deltaTime);
  
  // Check collisions
  this.checkCollisions();
  
  // Clean up inactive objects
  this.cleanupInactiveObjects();
  
  // Handle power-up spawning
  this.updatePowerUpSpawn(deltaTime);
  
  // Render game objects
  this.render();
  
  // Request next frame
  requestAnimationFrame(this.gameLoop);
};
```

## Physics Implementation

The game implements simplified Newtonian physics:

### Movement

- Objects move based on their velocity
- Velocity is affected by thrust and friction
- Position is updated each frame: `position += velocity * deltaTime`

### Rotation

- Rotation is updated directly based on user input
- Thrust is applied in the direction of rotation

### Collision Detection

Uses simple circle-circle collision detection:
```typescript
const distance = Math.sqrt(
  Math.pow(obj1.position.x - obj2.position.x, 2) +
  Math.pow(obj1.position.y - obj2.position.y, 2)
);

if (distance < obj1.size + obj2.size) {
  // Collision detected
}
```

## Weapon System

### Weapon Interface

Weapons are defined by:
- Fire rate (shots per second)
- Bullet speed
- Bullet size
- Bullet damage
- Last fire time (for rate limiting)

### Types of Weapons

1. **Basic Weapon**:
   - Moderate fire rate (3 shots/sec)
   - Standard damage (1 point)
   - White bullets

2. **Advanced Weapon** (from power-up):
   - Higher fire rate (5 shots/sec)
   - Double damage (2 points)
   - Red bullets
   - Limited duration (10 seconds)

## Power-up System

### PowerUp Types

Four types of power-ups with distinct visual appearances:
- Weapon upgrade (red star)
- Shield (blue circle)
- Extra life (green heart)
- Speed boost (yellow lightning)

### Spawn Mechanics

- 20% chance to spawn when destroying an asteroid
- Maximum of 3 power-ups at once
- Regular spawning interval (10 seconds)

### Collection and Effects

When collected:
- Weapon upgrade: Replaces the basic weapon with the advanced weapon
- Shield: Activates a shield around the ship that protects from collisions
- Extra life: Increases the player's life count by 1
- Speed boost: Increases maximum thrust by 50%

All power-ups except Extra Life expire after 10 seconds.

## Integration with React

### Canvas Handling

The game engine interacts with an HTML5 Canvas element that is managed by a React component:

```typescript
const GameScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gameEngine = new GameEngine(canvas);
    gameEngineRef.current = gameEngine;
    gameEngine.start();
    
    // Cleanup
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);
  
  return <StyledCanvas ref={canvasRef} />;
};
```

### Game State Management

- Game state (score, lives, game over) is checked periodically
- React state is updated based on game engine state
- UI overlays (pause menu, game over screen) are shown conditionally

## Performance Considerations

- Delta time used for frame-rate independent movement
- Inactive objects (bullets, power-ups) are filtered out regularly
- Objects outside the visible area wrap around rather than being destroyed and recreated
- Canvas rendering optimized by only drawing visible objects

## Future Enhancements

- Implement a component-based entity system for better scalability
- Add particle effects for explosions, thrusters
- Implement spatial partitioning for more efficient collision detection
- Add sound effects and background music
- Support for touch controls 
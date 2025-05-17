# STARGAME

A simple space shooter game built with React. Control your spaceship, avoid asteroids, collect power-ups, and survive in space!

## Play Online

You can play the game online at: [https://ft451burn.github.io/stargame/](https://ft451burn.github.io/stargame/)

## Features

- Main menu with start and options
- Realistic spaceship physics with thrust and friction
- Asteroid obstacles that drift in space
- Weapons system with upgradable firepower
- Power-up system with multiple types:
  - 🔴 Red - Weapon upgrade (faster firing, stronger bullets)
  - 🔵 Blue - Shield (temporary protection from asteroids)
  - 🟢 Green - Extra life
  - 🟡 Yellow - Speed boost (temporary thrust increase)
- Lives system
- Scoring system
- Responsive design
- Pause functionality

## Controls

- **Left Arrow** - Rotate spaceship left
- **Right Arrow** - Rotate spaceship right  
- **Up Arrow** - Apply thrust to move forward
- **Space** - Fire weapon
- **Escape** - Pause/Resume game

## Gameplay

Navigate your spaceship through an asteroid field, shooting asteroids to gain points. Each asteroid destroyed is worth 100 points. 

When you destroy asteroids, there's a chance (20%) of spawning a power-up. Collect these to gain temporary advantages:

- Weapon upgrade: More powerful bullets that deal double damage and fire faster
- Shield: Temporary protection from asteroid collisions
- Extra life: Adds one life to your count
- Speed boost: Increases your maximum thrust

The game ends when you lose all your lives by colliding with asteroids.

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode with live reload.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm test`

Launches the test runner in the interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder.

## Planned Features

- Multiple levels with increasing difficulty
- Enemy ships that attack the player
- More varied weapons system
- Sound effects and background music
- Mobile-friendly touch controls

## Technical Details

The game is built using:
- React with TypeScript
- Styled Components for UI styling
- HTML5 Canvas for game rendering
- React Router for navigation

Game state is managed within the GameEngine class, which handles:
- Physics calculations
- Collision detection
- Game object rendering
- Input processing

## License

MIT

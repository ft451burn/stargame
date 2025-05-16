export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  rotation: number;
  render: (ctx: CanvasRenderingContext2D) => void;
  update: (deltaTime: number) => void;
}

export interface Spaceship extends GameObject {
  thrust: number;
  maxThrust: number;
  rotationSpeed: number;
  friction: number;
  isThrusting: boolean;
  lives: number;
  isInvulnerable: boolean;
  invulnerabilityTime: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface Asteroid extends GameObject {
  rotationSpeed: number;
  canvasWidth: number;
  canvasHeight: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private ship: Spaceship;
  private asteroids: Asteroid[] = [];
  private keys: { [key: string]: boolean } = {};
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // Initialize ship
    this.ship = this.createShip();
    
    // Generate initial asteroids
    this.generateAsteroids(5);
    
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key] = true;
  };
  
  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key] = false;
  };
  
  private createShip(): Spaceship {
    return {
      position: { x: this.canvas.width / 2, y: this.canvas.height / 2 },
      velocity: { x: 0, y: 0 },
      size: 20,
      rotation: 0,
      thrust: 0,
      maxThrust: 200,
      rotationSpeed: 3,
      friction: 0.98,
      isThrusting: false,
      lives: 3,
      isInvulnerable: false,
      invulnerabilityTime: 0,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      
      update(deltaTime: number) {
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Apply thrust if thrusting
        if (this.isThrusting && this.thrust < this.maxThrust) {
          this.thrust += this.maxThrust * deltaTime;
          if (this.thrust > this.maxThrust) this.thrust = this.maxThrust;
        } else if (!this.isThrusting) {
          this.thrust *= this.friction;
        }
        
        // Apply thrust to velocity
        if (this.thrust > 0) {
          this.velocity.x += Math.cos(this.rotation) * this.thrust * deltaTime;
          this.velocity.y += Math.sin(this.rotation) * this.thrust * deltaTime;
        }
        
        // Screen wrapping
        if (this.position.x < 0) this.position.x = this.canvasWidth;
        if (this.position.x > this.canvasWidth) this.position.x = 0;
        if (this.position.y < 0) this.position.y = this.canvasHeight;
        if (this.position.y > this.canvasHeight) this.position.y = 0;
        
        // Update invulnerability
        if (this.isInvulnerable) {
          this.invulnerabilityTime -= deltaTime;
          if (this.invulnerabilityTime <= 0) {
            this.isInvulnerable = false;
          }
        }
      },
      
      render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Draw ship
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // If invulnerable, flash the ship
        if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        }
        
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size / 2, -this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.stroke();
        
        // Draw thrust if thrusting
        if (this.isThrusting) {
          ctx.beginPath();
          ctx.moveTo(-this.size / 2, 0);
          ctx.lineTo(-this.size - 5 - Math.random() * 5, 0);
          ctx.stroke();
        }
        
        ctx.restore();
      }
    };
  }
  
  private generateAsteroids(count: number) {
    for (let i = 0; i < count; i++) {
      const safeDistance = 100; // Minimum distance from ship
      let position: Vector2D;
      
      // Ensure asteroids don't spawn too close to the ship
      do {
        position = {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height
        };
      } while (
        Math.sqrt(
          Math.pow(position.x - this.ship.position.x, 2) +
          Math.pow(position.y - this.ship.position.y, 2)
        ) < safeDistance
      );
      
      const asteroid: Asteroid = {
        position,
        velocity: {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50
        },
        size: 20 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 1,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height,
        
        update(deltaTime: number) {
          // Update position
          this.position.x += this.velocity.x * deltaTime;
          this.position.y += this.velocity.y * deltaTime;
          
          // Update rotation
          this.rotation += this.rotationSpeed * deltaTime;
          
          // Screen wrapping
          if (this.position.x - this.size > this.canvasWidth) this.position.x = -this.size;
          if (this.position.x + this.size < 0) this.position.x = this.canvasWidth + this.size;
          if (this.position.y - this.size > this.canvasHeight) this.position.y = -this.size;
          if (this.position.y + this.size < 0) this.position.y = this.canvasHeight + this.size;
        },
        
        render(ctx: CanvasRenderingContext2D) {
          ctx.save();
          ctx.translate(this.position.x, this.position.y);
          ctx.rotate(this.rotation);
          
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          // Create irregular asteroid shape
          const vertices = 8;
          const irregularity = 0.4;
          
          for (let i = 0; i < vertices; i++) {
            const angle = (i / vertices) * Math.PI * 2;
            const radius = this.size * (1 + irregularity * (Math.cos(i * 3) + Math.sin(i * 5)));
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      };
      
      this.asteroids.push(asteroid);
    }
  }
  
  private checkCollisions() {
    if (this.ship.isInvulnerable) return;
    
    for (let i = 0; i < this.asteroids.length; i++) {
      const asteroid = this.asteroids[i];
      const distance = Math.sqrt(
        Math.pow(asteroid.position.x - this.ship.position.x, 2) +
        Math.pow(asteroid.position.y - this.ship.position.y, 2)
      );
      
      if (distance < this.ship.size + asteroid.size) {
        this.handleShipCollision();
        break;
      }
    }
  }
  
  private handleShipCollision() {
    this.ship.lives--;
    this.ship.isInvulnerable = true;
    this.ship.invulnerabilityTime = 3; // 3 seconds of invulnerability
    
    // Reset ship position
    this.ship.position = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.ship.velocity = { x: 0, y: 0 };
    this.ship.thrust = 0;
  }
  
  public start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }
  
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
    
    // Render game objects
    this.render();
    
    // Request next frame
    requestAnimationFrame(this.gameLoop);
  };
  
  private processInput(deltaTime: number) {
    // Rotation
    if (this.keys['ArrowLeft']) {
      this.ship.rotation -= this.ship.rotationSpeed * deltaTime;
    }
    if (this.keys['ArrowRight']) {
      this.ship.rotation += this.ship.rotationSpeed * deltaTime;
    }
    
    // Thrust
    this.ship.isThrusting = this.keys['ArrowUp'] === true;
  }
  
  private update(deltaTime: number) {
    // Update ship
    this.ship.update(deltaTime);
    
    // Update asteroids
    for (const asteroid of this.asteroids) {
      asteroid.update(deltaTime);
    }
  }
  
  private render() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render ship
    this.ship.render(this.ctx);
    
    // Render asteroids
    for (const asteroid of this.asteroids) {
      asteroid.render(this.ctx);
    }
    
    // Render HUD
    this.renderHUD();
  }
  
  private renderHUD() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Lives: ${this.ship.lives}`, 20, 30);
  }
  
  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
} 
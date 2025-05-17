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

export enum PowerUpType {
  WEAPON = 'weapon',
  SHIELD = 'shield',
  LIFE = 'life',
  SPEED = 'speed'
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  active: boolean;
  duration: number;
  currentDuration: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface Bullet extends GameObject {
  active: boolean;
  lifeTime: number;
  damage: number;
}

export interface Weapon {
  fireRate: number; // Shots per second
  lastFireTime: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletDamage: number;
  canFire: () => boolean;
  fire: (position: Vector2D, rotation: number) => Bullet;
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
  weapon: Weapon | null;
  hasShield: boolean;
  shieldTime: number;
}

export interface Asteroid extends GameObject {
  rotationSpeed: number;
  canvasWidth: number;
  canvasHeight: number;
  health: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private ship: Spaceship;
  private asteroids: Asteroid[] = [];
  private powerUps: PowerUp[] = [];
  private bullets: Bullet[] = [];
  private keys: { [key: string]: boolean } = {};
  private score: number = 0;
  private powerUpSpawnTime: number = 0;
  private powerUpSpawnInterval: number = 10; // Spawn power-up every 10 seconds
  
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
    
    // Fire weapon with space key
    if (e.key === ' ' && this.ship.weapon) {
      this.fireWeapon();
    }
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
      weapon: this.createBasicWeapon(),
      hasShield: false,
      shieldTime: 0,
      
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
        
        // Update shield
        if (this.hasShield) {
          this.shieldTime -= deltaTime;
          if (this.shieldTime <= 0) {
            this.hasShield = false;
          }
        }
      },
      
      render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        
        // Draw shield if active
        if (this.hasShield) {
          ctx.strokeStyle = 'rgba(0, 150, 255, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        
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
  
  private createBasicWeapon(): Weapon {
    return {
      fireRate: 3,
      lastFireTime: 0,
      bulletSpeed: 400,
      bulletSize: 3,
      bulletDamage: 1,
      
      canFire(): boolean {
        const now = performance.now();
        if (now - this.lastFireTime >= 1000 / this.fireRate) {
          return true;
        }
        return false;
      },
      
      fire(position: Vector2D, rotation: number): Bullet {
        this.lastFireTime = performance.now();
        
        return {
          position: { x: position.x, y: position.y },
          velocity: {
            x: Math.cos(rotation) * this.bulletSpeed,
            y: Math.sin(rotation) * this.bulletSpeed
          },
          size: this.bulletSize,
          rotation: rotation,
          active: true,
          lifeTime: 2, // Bullet lives for 2 seconds
          damage: this.bulletDamage,
          
          update(deltaTime: number) {
            // Update position
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            
            // Update lifetime
            this.lifeTime -= deltaTime;
            if (this.lifeTime <= 0) {
              this.active = false;
            }
          },
          
          render(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        };
      }
    };
  }
  
  private createAdvancedWeapon(): Weapon {
    return {
      fireRate: 5,
      lastFireTime: 0,
      bulletSpeed: 500,
      bulletSize: 4,
      bulletDamage: 2,
      
      canFire(): boolean {
        const now = performance.now();
        if (now - this.lastFireTime >= 1000 / this.fireRate) {
          return true;
        }
        return false;
      },
      
      fire(position: Vector2D, rotation: number): Bullet {
        this.lastFireTime = performance.now();
        
        return {
          position: { x: position.x, y: position.y },
          velocity: {
            x: Math.cos(rotation) * this.bulletSpeed,
            y: Math.sin(rotation) * this.bulletSpeed
          },
          size: this.bulletSize,
          rotation: rotation,
          active: true,
          lifeTime: 3, // Bullet lives for 3 seconds
          damage: this.bulletDamage,
          
          update(deltaTime: number) {
            // Update position
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            
            // Update lifetime
            this.lifeTime -= deltaTime;
            if (this.lifeTime <= 0) {
              this.active = false;
            }
          },
          
          render(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 100, 100, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        };
      }
    };
  }
  
  private fireWeapon() {
    if (this.ship.weapon && this.ship.weapon.canFire()) {
      const bullet = this.ship.weapon.fire(
        { 
          x: this.ship.position.x + Math.cos(this.ship.rotation) * this.ship.size, 
          y: this.ship.position.y + Math.sin(this.ship.rotation) * this.ship.size 
        }, 
        this.ship.rotation
      );
      
      this.bullets.push(bullet);
    }
  }
  
  private generatePowerUp(): void {
    const types = [
      PowerUpType.WEAPON,
      PowerUpType.SHIELD,
      PowerUpType.LIFE,
      PowerUpType.SPEED
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const position = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height
    };
    
    // Make sure power-up doesn't spawn too close to the ship
    const distanceToShip = Math.sqrt(
      Math.pow(position.x - this.ship.position.x, 2) +
      Math.pow(position.y - this.ship.position.y, 2)
    );
    
    if (distanceToShip < 100) {
      // Try again
      return this.generatePowerUp();
    }
    
    const powerUp: PowerUp = {
      position,
      velocity: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
      size: 15,
      rotation: 0,
      type: randomType,
      active: true,
      duration: 10, // 10 seconds
      currentDuration: 0,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      
      update(deltaTime: number) {
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Handle wrapping around the screen
        if (this.position.x < -this.size) this.position.x = this.canvasWidth + this.size;
        if (this.position.x > this.canvasWidth + this.size) this.position.x = -this.size;
        if (this.position.y < -this.size) this.position.y = this.canvasHeight + this.size;
        if (this.position.y > this.canvasHeight + this.size) this.position.y = -this.size;
      },
      
      render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Use different colors for different power-up types
        switch (this.type) {
          case PowerUpType.WEAPON:
            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            break;
          case PowerUpType.SHIELD:
            ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
            break;
          case PowerUpType.LIFE:
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            break;
          case PowerUpType.SPEED:
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            break;
        }
        
        // Draw the power-up
        ctx.beginPath();
        
        // Use different shapes for different power-up types
        switch (this.type) {
          case PowerUpType.WEAPON:
            // Draw a star
            for (let i = 0; i < 5; i++) {
              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
              const x = Math.cos(angle) * this.size;
              const y = Math.sin(angle) * this.size;
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            break;
          case PowerUpType.SHIELD:
            // Draw a shield shape
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            break;
          case PowerUpType.LIFE:
            // Draw a heart shape
            ctx.moveTo(0, -this.size / 2);
            ctx.bezierCurveTo(
              this.size / 2, -this.size, 
              this.size, -this.size / 4, 
              0, this.size / 2
            );
            ctx.bezierCurveTo(
              -this.size, -this.size / 4, 
              -this.size / 2, -this.size, 
              0, -this.size / 2
            );
            break;
          case PowerUpType.SPEED:
            // Draw a lightning bolt
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size / 2, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(this.size / 2, this.size);
            ctx.lineTo(-this.size / 2, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(-this.size / 2, -this.size);
            break;
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }
    };
    
    this.powerUps.push(powerUp);
  }
  
  private collectPowerUp(powerUp: PowerUp) {
    switch (powerUp.type) {
      case PowerUpType.WEAPON:
        this.ship.weapon = this.createAdvancedWeapon();
        setTimeout(() => {
          this.ship.weapon = this.createBasicWeapon();
        }, powerUp.duration * 1000);
        break;
      case PowerUpType.SHIELD:
        this.ship.hasShield = true;
        this.ship.shieldTime = powerUp.duration;
        break;
      case PowerUpType.LIFE:
        this.ship.lives++;
        break;
      case PowerUpType.SPEED:
        const originalMaxThrust = this.ship.maxThrust;
        this.ship.maxThrust *= 1.5;
        setTimeout(() => {
          this.ship.maxThrust = originalMaxThrust;
        }, powerUp.duration * 1000);
        break;
    }
    
    // Remove the power-up
    powerUp.active = false;
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
        health: 2, // It takes 2 hits to destroy an asteroid
        
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
    // Ship-Asteroid collision
    if (!this.ship.isInvulnerable && !this.ship.hasShield) {
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
    
    // Bullet-Asteroid collision
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      if (!bullet.active) continue;
      
      for (let j = 0; j < this.asteroids.length; j++) {
        const asteroid = this.asteroids[j];
        const distance = Math.sqrt(
          Math.pow(asteroid.position.x - bullet.position.x, 2) +
          Math.pow(asteroid.position.y - bullet.position.y, 2)
        );
        
        if (distance < bullet.size + asteroid.size) {
          // Deactivate the bullet
          bullet.active = false;
          
          // Damage the asteroid
          asteroid.health -= bullet.damage;
          
          // If asteroid health is 0 or less, remove it
          if (asteroid.health <= 0) {
            this.asteroids.splice(j, 1);
            this.score += 100;
            
            // Randomly spawn a power-up (20% chance)
            if (Math.random() < 0.2) {
              this.generatePowerUp();
            }
            
            // If there are too few asteroids, spawn more
            if (this.asteroids.length < 3) {
              this.generateAsteroids(2);
            }
          }
          
          break;
        }
      }
    }
    
    // Ship-PowerUp collision
    for (let i = 0; i < this.powerUps.length; i++) {
      const powerUp = this.powerUps[i];
      if (!powerUp.active) continue;
      
      const distance = Math.sqrt(
        Math.pow(powerUp.position.x - this.ship.position.x, 2) +
        Math.pow(powerUp.position.y - this.ship.position.y, 2)
      );
      
      if (distance < this.ship.size + powerUp.size) {
        this.collectPowerUp(powerUp);
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
    
    // Check for game over
    if (this.ship.lives <= 0) {
      // Implement game over logic
      console.log("Game Over");
      // You would typically emit an event to the game screen to show game over
    }
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
    
    // Clean up inactive objects
    this.cleanupInactiveObjects();
    
    // Handle power-up spawning
    this.updatePowerUpSpawn(deltaTime);
    
    // Render game objects
    this.render();
    
    // Request next frame
    requestAnimationFrame(this.gameLoop);
  };
  
  private updatePowerUpSpawn(deltaTime: number) {
    this.powerUpSpawnTime += deltaTime;
    
    if (this.powerUpSpawnTime >= this.powerUpSpawnInterval) {
      this.powerUpSpawnTime = 0;
      
      // Don't spawn too many power-ups
      if (this.powerUps.length < 3) {
        this.generatePowerUp();
      }
    }
  }
  
  private cleanupInactiveObjects() {
    // Remove inactive bullets
    this.bullets = this.bullets.filter(bullet => bullet.active);
    
    // Remove inactive power-ups
    this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
  }
  
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
    
    // Fire weapon
    if (this.keys[' '] && this.ship.weapon) {
      this.fireWeapon();
    }
  }
  
  private update(deltaTime: number) {
    // Update ship
    this.ship.update(deltaTime);
    
    // Update asteroids
    for (const asteroid of this.asteroids) {
      asteroid.update(deltaTime);
    }
    
    // Update bullets
    for (const bullet of this.bullets) {
      bullet.update(deltaTime);
    }
    
    // Update power-ups
    for (const powerUp of this.powerUps) {
      powerUp.update(deltaTime);
    }
  }
  
  private render() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render bullets (render bullets first so they appear behind everything else)
    for (const bullet of this.bullets) {
      bullet.render(this.ctx);
    }
    
    // Render asteroids
    for (const asteroid of this.asteroids) {
      asteroid.render(this.ctx);
    }
    
    // Render ship
    this.ship.render(this.ctx);
    
    // Render power-ups
    for (const powerUp of this.powerUps) {
      powerUp.render(this.ctx);
    }
    
    // Render HUD
    this.renderHUD();
  }
  
  private renderHUD() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    
    // Display lives
    this.ctx.fillText(`Lives: ${this.ship.lives}`, 20, 30);
    
    // Display score
    this.ctx.fillText(`Score: ${this.score}`, 20, 60);
    
    // Display active power-ups
    let powerUpText = '';
    
    if (this.ship.hasShield) {
      powerUpText += 'SHIELD ';
    }
    
    if (this.ship.weapon && this.ship.weapon.bulletDamage > 1) {
      powerUpText += 'WEAPON ';
    }
    
    if (this.ship.maxThrust > 200) {
      powerUpText += 'SPEED ';
    }
    
    if (powerUpText) {
      this.ctx.fillText(`Active: ${powerUpText}`, 20, 90);
    }
  }
  
  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Update ship and asteroid canvas dimensions
    this.ship.canvasWidth = width;
    this.ship.canvasHeight = height;
    
    for (const asteroid of this.asteroids) {
      asteroid.canvasWidth = width;
      asteroid.canvasHeight = height;
    }
  }
  
  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  
  // Add method to check if game is over
  public isGameOver(): boolean {
    return this.ship.lives <= 0;
  }
  
  // Add method to get current score
  public getScore(): number {
    return this.score;
  }
} 
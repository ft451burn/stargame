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
  update: (deltaTime: number, ...args: any[]) => void;
}

export enum PowerUpType {
  WEAPON = 'weapon',
  SHIELD = 'shield',
  LIFE = 'life',
  SPEED = 'speed',
  MULTISHOT = 'multishot'
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
  fromEnemy?: boolean;
}

export interface Weapon {
  fireRate: number; // Shots per second
  lastFireTime: number;
  bulletSpeed: number;
  bulletSize: number;
  bulletDamage: number;
  canFire: () => boolean;
  fire: (position: Vector2D, rotation: number, fromEnemy?: boolean) => Bullet;
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
  multiShotLevel: number;
}

export enum EnemyBehavior {
  CHASE, // Chase the player
  PATROL, // Move around in patterns
  AMBUSH // Stay still until player is close, then attack
}

export interface EnemyShip extends GameObject {
  health: number;
  behavior: EnemyBehavior;
  weapon: Weapon;
  detectionRadius: number; // How far away they can see the player
  fireRadius: number; // How close they need to be to fire
  active: boolean;
  rotationSpeed: number;
  speed: number;
  lastDirectionChange: number;
  directionChangeInterval: number;
  canvasWidth: number;
  canvasHeight: number;
  targetPosition: Vector2D | null;
  color: string;
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
  private enemies: EnemyShip[] = [];
  private keys: { [key: string]: boolean } = {};
  private score: number = 0;
  private powerUpSpawnTime: number = 0;
  private powerUpSpawnInterval: number = 10; // Spawn power-up every 10 seconds
  private enemySpawnTime: number = 0;
  private enemySpawnInterval: number = 15; // Spawn enemy every 15 seconds
  private level: number = 1;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    // Initialize ship
    this.ship = this.createShip();
    
    // Generate initial asteroids
    this.generateAsteroids(5);
    
    // Generate initial enemies
    this.generateEnemies(1);
    
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
      multiShotLevel: 0,
      
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
      
      fire(position: Vector2D, rotation: number, fromEnemy: boolean = false): Bullet {
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
          fromEnemy,
          
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
            ctx.fillStyle = this.fromEnemy ? 'red' : 'white';
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
      
      fire(position: Vector2D, rotation: number, fromEnemy: boolean = false): Bullet {
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
          fromEnemy,
          
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
            ctx.fillStyle = this.fromEnemy ? 'rgba(255, 50, 50, 1)' : 'rgba(255, 100, 100, 1)';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        };
      }
    };
  }
  
  private createEnemyWeapon(): Weapon {
    return {
      fireRate: 1.5, // Slower fire rate than player
      lastFireTime: 0,
      bulletSpeed: 350 / 3, // 3 times slower than before
      bulletSize: 5, // Larger bullet size
      bulletDamage: 1,
      
      canFire(): boolean {
        const now = performance.now();
        if (now - this.lastFireTime >= 1000 / this.fireRate) {
          return true;
        }
        return false;
      },
      
      fire(position: Vector2D, rotation: number, fromEnemy: boolean = true): Bullet {
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
          lifeTime: 3, // Increased lifetime due to slower speed
          damage: this.bulletDamage,
          fromEnemy,
          
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
            ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.strokeStyle = 'rgba(255, 200, 200, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        };
      }
    };
  }
  
  private fireWeapon() {
    if (this.ship.weapon && this.ship.weapon.canFire()) {
      // Standard shot (always fires)
      const bullet = this.ship.weapon.fire(
        { 
          x: this.ship.position.x + Math.cos(this.ship.rotation) * this.ship.size, 
          y: this.ship.position.y + Math.sin(this.ship.rotation) * this.ship.size 
        }, 
        this.ship.rotation
      );
      
      this.bullets.push(bullet);
      
      // Add multiple shots based on multiShotLevel
      if (this.ship.multiShotLevel > 0) {
        const spreadAngles = [];
        
        // Calculate spread angles based on multiShotLevel
        switch (this.ship.multiShotLevel) {
          case 1: // Double shot (center + 1 to the side)
            spreadAngles.push(this.ship.rotation + Math.PI / 12);
            break;
          case 2: // Triple shot (center + 2 to the sides)
            spreadAngles.push(this.ship.rotation - Math.PI / 12);
            spreadAngles.push(this.ship.rotation + Math.PI / 12);
            break;
          case 3: // Quad shot (center + 3 to the sides)
            spreadAngles.push(this.ship.rotation - Math.PI / 10);
            spreadAngles.push(this.ship.rotation + Math.PI / 10);
            spreadAngles.push(this.ship.rotation - Math.PI / 5);
            break;
          case 4: // Five shots (center + 4 to the sides)
            spreadAngles.push(this.ship.rotation - Math.PI / 12);
            spreadAngles.push(this.ship.rotation + Math.PI / 12);
            spreadAngles.push(this.ship.rotation - Math.PI / 6);
            spreadAngles.push(this.ship.rotation + Math.PI / 6);
            break;
          default: // If level > 4, add even more shots with wider spread
            spreadAngles.push(this.ship.rotation - Math.PI / 12);
            spreadAngles.push(this.ship.rotation + Math.PI / 12);
            spreadAngles.push(this.ship.rotation - Math.PI / 6);
            spreadAngles.push(this.ship.rotation + Math.PI / 6);
            spreadAngles.push(this.ship.rotation - Math.PI / 4);
            spreadAngles.push(this.ship.rotation + Math.PI / 4);
            break;
        }
        
        // Fire additional bullets at spread angles
        for (const angle of spreadAngles) {
          const spreadBullet = this.ship.weapon.fire(
            { 
              x: this.ship.position.x + Math.cos(angle) * this.ship.size, 
              y: this.ship.position.y + Math.sin(angle) * this.ship.size 
            }, 
            angle
          );
          
          this.bullets.push(spreadBullet);
        }
      }
    }
  }
  
  private enemyFireWeapon(enemy: EnemyShip) {
    if (enemy.weapon && enemy.weapon.canFire()) {
      // Calculate angle to player for targeting
      const angleToPlayer = Math.atan2(
        this.ship.position.y - enemy.position.y,
        this.ship.position.x - enemy.position.x
      );
      
      // Calculate difference between enemy's facing direction and angle to player
      const angleDiff = angleToPlayer - enemy.rotation;
      const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      
      // Only fire if enemy is somewhat facing the player (within ~30 degrees)
      const firingAngleThreshold = Math.PI / 6;
      
      if (Math.abs(normalizedAngleDiff) < firingAngleThreshold) {
        // Add some inaccuracy to enemy shots
        const inaccuracy = (Math.random() - 0.5) * 0.3;
        const firingAngle = enemy.rotation + inaccuracy;
        
        // Fire in the enemy's current facing direction (with slight inaccuracy)
        const bullet = enemy.weapon.fire(
          { 
            x: enemy.position.x + Math.cos(firingAngle) * enemy.size, 
            y: enemy.position.y + Math.sin(firingAngle) * enemy.size 
          }, 
          firingAngle,
          true
        );
        
        this.bullets.push(bullet);
      }
    }
  }
  
  private generatePowerUp(): void {
    // Define power-up types with their spawn weights
    const powerUpOptions = [
      { type: PowerUpType.WEAPON, weight: 30 },
      { type: PowerUpType.SHIELD, weight: 30 },
      { type: PowerUpType.LIFE, weight: 15 },
      { type: PowerUpType.SPEED, weight: 20 },
      { type: PowerUpType.MULTISHOT, weight: 5 }
    ];
    
    // Calculate total weight
    const totalWeight = powerUpOptions.reduce((sum, option) => sum + option.weight, 0);
    
    // Pick a random number within the total weight
    let randomValue = Math.random() * totalWeight;
    let selectedType = PowerUpType.WEAPON; // Default
    
    // Find the selected type based on weights
    for (const option of powerUpOptions) {
      randomValue -= option.weight;
      if (randomValue <= 0) {
        selectedType = option.type;
        break;
      }
    }
    
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
      type: selectedType,
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
          case PowerUpType.MULTISHOT:
            ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
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
          case PowerUpType.MULTISHOT:
            // Draw a spread pattern
            for (let i = 0; i < 3; i++) {
              const angle = (i * Math.PI) / 2 - Math.PI / 4;
              const x = Math.cos(angle) * this.size;
              const y = Math.sin(angle) * this.size;
              ctx.beginPath();
              ctx.arc(0, 0, this.size, 0, Math.PI * 2);
              ctx.moveTo(x, y);
              ctx.lineTo(0, 0);
              ctx.lineTo(x, y);
              ctx.closePath();
            }
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
      case PowerUpType.MULTISHOT:
        // Increase multishot level, capping at 5
        if (this.ship.multiShotLevel < 5) {
          this.ship.multiShotLevel++;
          
          // Add score bonus for upgrading multishot
          this.score += 50 * this.ship.multiShotLevel;
        }
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
  
  private generateEnemies(count: number) {
    const behaviors = [EnemyBehavior.CHASE, EnemyBehavior.PATROL, EnemyBehavior.AMBUSH];
    const colors = ['#ff4444', '#ff9944', '#ffdd44'];
    
    for (let i = 0; i < count; i++) {
      const safeDistance = 200; // Minimum distance from ship
      let position: Vector2D;
      
      // Ensure enemies don't spawn too close to the ship
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
      
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const enemy: EnemyShip = {
        position,
        velocity: { x: 0, y: 0 },
        size: 18,
        rotation: Math.random() * Math.PI * 2,
        health: 2,
        behavior,
        weapon: this.createEnemyWeapon(),
        detectionRadius: 300,
        fireRadius: 250,
        active: true,
        rotationSpeed: 1 + Math.random() * 0.8, // Reduced rotation speed for smoother turning
        speed: 50 + Math.random() * 30,
        lastDirectionChange: 0,
        directionChangeInterval: 2 + Math.random() * 3,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height,
        targetPosition: null,
        color,
        
        update(deltaTime: number, playerPosition: Vector2D) {
          // Calculate distance and angle to player
          const distanceToPlayer = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.y - this.position.y, 2)
          );
          
          const angleToPlayer = Math.atan2(
            playerPosition.y - this.position.y,
            playerPosition.x - this.position.x
          );
          
          // Update based on behavior
          switch (this.behavior) {
            case EnemyBehavior.CHASE:
              // Gradually turn towards player if within detection radius
              if (distanceToPlayer < this.detectionRadius) {
                // Calculate the angle difference for smooth rotation
                const angleDiff = angleToPlayer - this.rotation;
                const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                
                // Rotate gradually toward player
                this.rotation += normalizedAngleDiff * this.rotationSpeed * deltaTime;
                
                // Move forward in current rotation direction, not directly at player
                this.velocity.x = Math.cos(this.rotation) * this.speed * deltaTime;
                this.velocity.y = Math.sin(this.rotation) * this.speed * deltaTime;
              } else {
                // Slow down if player is not detected
                this.velocity.x *= 0.98;
                this.velocity.y *= 0.98;
              }
              break;
              
            case EnemyBehavior.PATROL:
              // Update direction change timer
              this.lastDirectionChange += deltaTime;
              
              if (this.lastDirectionChange > this.directionChangeInterval || !this.targetPosition) {
                this.lastDirectionChange = 0;
                
                // Set a new random target position
                this.targetPosition = {
                  x: Math.random() * this.canvasWidth,
                  y: Math.random() * this.canvasHeight
                };
              }
              
              // If player is in detection range, set player as target but don't immediately turn
              if (distanceToPlayer < this.detectionRadius) {
                // Only update target position, not rotation
                this.targetPosition = { x: playerPosition.x, y: playerPosition.y };
              }
              
              if (this.targetPosition) {
                // Calculate angle to target
                const angleToTarget = Math.atan2(
                  this.targetPosition.y - this.position.y,
                  this.targetPosition.x - this.position.x
                );
                
                // Gradually rotate towards target
                const angleDiff = angleToTarget - this.rotation;
                const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                
                // Slower rotation for smoother movement
                this.rotation += normalizedAngleDiff * this.rotationSpeed * deltaTime;
                
                // Move towards target in current rotation direction
                this.velocity.x = Math.cos(this.rotation) * this.speed * deltaTime;
                this.velocity.y = Math.sin(this.rotation) * this.speed * deltaTime;
              }
              break;
              
            case EnemyBehavior.AMBUSH:
              // Stay still until player is close, then attack gradually
              if (distanceToPlayer < this.detectionRadius) {
                // Calculate angle difference for smooth rotation
                const angleDiff = angleToPlayer - this.rotation;
                const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
                
                // Rotate with slightly increased speed when ambushing
                this.rotation += normalizedAngleDiff * this.rotationSpeed * 1.2 * deltaTime;
                
                // Start slowly and accelerate
                const ambushSpeed = Math.min(this.speed * 1.5, 
                                          this.speed * (1 + (this.detectionRadius - distanceToPlayer) / this.detectionRadius));
                
                // Move in current rotation direction
                this.velocity.x = Math.cos(this.rotation) * ambushSpeed * deltaTime;
                this.velocity.y = Math.sin(this.rotation) * ambushSpeed * deltaTime;
              } else {
                // Almost no movement when not detected
                this.velocity.x *= 0.9;
                this.velocity.y *= 0.9;
              }
              break;
          }
          
          // Add slight wandering effect to make movement less predictable
          const wanderStrength = 0.2;
          this.rotation += (Math.random() - 0.5) * wanderStrength * deltaTime;
          
          // Update position based on velocity
          this.position.x += this.velocity.x;
          this.position.y += this.velocity.y;
          
          // Screen wrapping
          if (this.position.x < 0) this.position.x = this.canvasWidth;
          if (this.position.x > this.canvasWidth) this.position.x = 0;
          if (this.position.y < 0) this.position.y = this.canvasHeight;
          if (this.position.y > this.canvasHeight) this.position.y = 0;
        },
        
        render(ctx: CanvasRenderingContext2D) {
          ctx.save();
          ctx.translate(this.position.x, this.position.y);
          ctx.rotate(this.rotation);
          
          // Draw ship body
          ctx.strokeStyle = this.color;
          ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          // Different shape from player ship
          ctx.moveTo(this.size, 0);
          ctx.lineTo(-this.size / 2, -this.size / 2);
          ctx.lineTo(-this.size / 3, 0);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Draw engine glow
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255, 100, 50, 0.7)';
          ctx.moveTo(-this.size / 2, 0);
          ctx.lineTo(-this.size - Math.random() * 5, -3);
          ctx.lineTo(-this.size - Math.random() * 5, 3);
          ctx.closePath();
          ctx.fill();
          
          // Draw direction indicator
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.moveTo(this.size, 0);
          ctx.lineTo(this.size + 5, 0);
          ctx.stroke();
          
          ctx.restore();
        }
      };
      
      this.enemies.push(enemy);
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
      
      // Ship-Enemy collision
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        const distance = Math.sqrt(
          Math.pow(enemy.position.x - this.ship.position.x, 2) +
          Math.pow(enemy.position.y - this.ship.position.y, 2)
        );
        
        if (distance < this.ship.size + enemy.size) {
          this.handleShipCollision();
          break;
        }
      }
    }
    
    // Bullet-Asteroid collision
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      if (!bullet.active || bullet.fromEnemy) continue;
      
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
    
    // Bullet-Enemy collision
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      if (!bullet.active || bullet.fromEnemy) continue;
      
      for (let j = 0; j < this.enemies.length; j++) {
        const enemy = this.enemies[j];
        const distance = Math.sqrt(
          Math.pow(enemy.position.x - bullet.position.x, 2) +
          Math.pow(enemy.position.y - bullet.position.y, 2)
        );
        
        if (distance < bullet.size + enemy.size) {
          // Deactivate the bullet
          bullet.active = false;
          
          // Damage the enemy
          enemy.health -= bullet.damage;
          
          // If enemy health is 0 or less, remove it
          if (enemy.health <= 0) {
            this.enemies.splice(j, 1);
            this.score += 250; // More points for destroying enemy ships
            
            // Randomly spawn a power-up (30% chance)
            if (Math.random() < 0.3) {
              this.generatePowerUp();
            }
            
            // Check if level should increase
            if (this.score >= this.level * 1000) {
              this.level++;
              this.generateEnemies(this.level);
            }
          }
          
          break;
        }
      }
    }
    
    // Enemy bullet-Ship collision
    if (!this.ship.isInvulnerable) {
      for (let i = 0; i < this.bullets.length; i++) {
        const bullet = this.bullets[i];
        if (!bullet.active || !bullet.fromEnemy) continue;
        
        const distance = Math.sqrt(
          Math.pow(this.ship.position.x - bullet.position.x, 2) +
          Math.pow(this.ship.position.y - bullet.position.y, 2)
        );
        
        if (distance < this.ship.size + bullet.size) {
          // Deactivate the bullet
          bullet.active = false;
          
          if (this.ship.hasShield) {
            // Shield absorbs the hit
            this.ship.shieldTime -= 1;
            if (this.ship.shieldTime <= 0) {
              this.ship.hasShield = false;
            }
          } else {
            // Handle ship collision
            this.handleShipCollision();
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
    
    // Handle enemy spawning
    this.updateEnemySpawn(deltaTime);
    
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
  
  private updateEnemySpawn(deltaTime: number) {
    this.enemySpawnTime += deltaTime;
    
    // Spawn enemies more frequently as level increases
    const adjustedInterval = Math.max(this.enemySpawnInterval - (this.level * 0.5), 5);
    
    if (this.enemySpawnTime >= adjustedInterval) {
      this.enemySpawnTime = 0;
      
      // Don't spawn too many enemies at once
      const maxEnemies = 5 + this.level;
      if (this.enemies.length < maxEnemies) {
        this.generateEnemies(1);
      }
    }
  }
  
  private cleanupInactiveObjects() {
    // Remove inactive bullets
    this.bullets = this.bullets.filter(bullet => bullet.active);
    
    // Remove inactive power-ups
    this.powerUps = this.powerUps.filter(powerUp => powerUp.active);
    
    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);
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
    
    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, this.ship.position);
      
      // Check if enemy can fire at player
      const distanceToPlayer = Math.sqrt(
        Math.pow(this.ship.position.x - enemy.position.x, 2) +
        Math.pow(this.ship.position.y - enemy.position.y, 2)
      );
      
      // Only attempt to fire if within range and on a reduced probability
      if (distanceToPlayer < enemy.fireRadius && Math.random() < 0.02) {
        this.enemyFireWeapon(enemy);
      }
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
    
    // Render enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx);
    }
    
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
    
    // Display level
    this.ctx.fillText(`Level: ${this.level}`, 20, 90);
    
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
    
    if (this.ship.multiShotLevel > 0) {
      powerUpText += `MULTISHOT-${this.ship.multiShotLevel} `;
    }
    
    if (powerUpText) {
      this.ctx.fillText(`Active: ${powerUpText}`, 20, 120);
    }
    
    // Display enemies left
    this.ctx.fillText(`Enemies: ${this.enemies.length}`, 20, 150);
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
    
    for (const enemy of this.enemies) {
      enemy.canvasWidth = width;
      enemy.canvasHeight = height;
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
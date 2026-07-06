let canvas, ctx;
let startScreen, levelTransitionEl, transitionTextEl, gameoverScreen, winScreen;
let hudLevel, hudHp;

let gameState = 'start'; // start | playing | levelTransition | gameover | win
let currentLevel = 0;
let hero;
let enemies = [];
let bullets = [];
let princess = null;
let lastTime = 0;
let transitionTimer = 0;

function init() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');

  startScreen = document.getElementById('start-screen');
  levelTransitionEl = document.getElementById('level-transition');
  transitionTextEl = document.getElementById('transition-text');
  gameoverScreen = document.getElementById('gameover-screen');
  winScreen = document.getElementById('win-screen');
  hudLevel = document.getElementById('hud-level');
  hudHp = document.getElementById('hud-hp');

  initInput();
  hero = createHero(CANVAS_W / 2, CANVAS_H - 80);

  requestAnimationFrame(loop);
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt) {
  switch (gameState) {
    case 'start':
      updateStart();
      break;
    case 'playing':
      updatePlaying(dt);
      break;
    case 'levelTransition':
      updateLevelTransition(dt);
      break;
    case 'gameover':
      updateGameover();
      break;
    case 'win':
      updateWin(dt);
      break;
  }
}

function updateStart() {
  if (keys['Space'] || keys['Enter']) {
    startGame();
  }
}

function startGame() {
  currentLevel = 0;
  hero = createHero(CANVAS_W / 2, CANVAS_H - 80);
  const loaded = loadLevel(0, hero);
  enemies = loaded.enemies;
  bullets = loaded.bullets;
  gameState = 'playing';
}

function restartGame() {
  princess = null;
  startGame();
}

function updatePlaying(dt) {
  if (hero.alive) {
    updateHeroMovement(dt);
    updateHeroShooting(dt);
  } else {
    hero.deathTimer += dt;
  }
  hero.muzzleFlashTimer = Math.max(0, hero.muzzleFlashTimer - dt);

  updateBullets(dt);

  enemies.forEach((enemy) => {
    if (enemy.alive) {
      updateEnemyAI(enemy, dt);
    } else {
      enemy.deathTimer += dt;
    }
    enemy.muzzleFlashTimer = Math.max(0, enemy.muzzleFlashTimer - dt);
  });

  handleCollisions();

  bullets = bullets.filter((b) => b.alive);
  enemies = enemies.filter((e) => e.alive || e.deathTimer < DEATH_FADE_MS);

  if (hero.alive && enemies.length === 0) {
    if (currentLevel === 0) {
      gameState = 'levelTransition';
      transitionTimer = 0;
    } else {
      princess = createPrincess(CANVAS_W / 2, CANVAS_H / 2 - 20);
      gameState = 'win';
    }
  }

  if (!hero.alive && hero.deathTimer >= DEATH_FADE_MS) {
    gameState = 'gameover';
  }
}

function updateHeroMovement(dt) {
  const mv = getMovementVector();
  hero.moving = mv.x !== 0 || mv.y !== 0;

  if (hero.moving) {
    hero.x += mv.x * HERO_SPEED * (dt / 1000);
    hero.y += mv.y * HERO_SPEED * (dt / 1000);
    const facing = getFacingFromMovement(mv.x, mv.y);
    if (facing) hero.facing = facing;
  }

  clampToBounds(hero);
  hero.animTimer += dt;
}

function updateHeroShooting(dt) {
  hero.fireCooldown = Math.max(0, hero.fireCooldown - dt);
  if (keys['Space'] && hero.fireCooldown <= 0) {
    fireBullet(hero, 'hero');
  }
}

function fireBullet(shooter, owner) {
  const vec = DIRECTION_VECTORS[shooter.facing];
  const offset = Math.max(shooter.w, shooter.h) / 2 + 12;
  const bx = shooter.x + vec.x * offset;
  const by = shooter.y + vec.y * offset;
  bullets.push(createBullet(bx, by, shooter.facing, owner));
  shooter.muzzleFlashTimer = FLASH_DURATION_MS;
  if (owner === 'hero') {
    hero.fireCooldown = FIRE_COOLDOWN_MS;
  }
}

function updateBullets(dt) {
  bullets.forEach((b) => {
    b.x += b.vx * (dt / 1000);
    b.y += b.vy * (dt / 1000);
    if (isOffscreen(b)) b.alive = false;
  });
}

function updateEnemyAI(enemy, dt) {
  enemy.fireTimer -= dt;
  enemy.animTimer += dt;
  enemy.moving = true;

  if (enemy.type === 'chaser') {
    const dx = hero.x - enemy.x;
    const dy = hero.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    const vx = dx / dist;
    const vy = dy / dist;

    enemy.x += vx * enemy.speed * (dt / 1000);
    enemy.y += vy * enemy.speed * (dt / 1000);

    const facing = getFacingFromMovement(vx, vy);
    if (facing) enemy.facing = facing;

    const aligned = Math.abs(dx) < 30 || Math.abs(dy) < 30;
    if (aligned && enemy.fireTimer <= 0) {
      fireBullet(enemy, 'enemy');
      enemy.fireTimer = enemy.fireInterval;
    }
  } else {
    // patrol
    const origin = enemy.patrolOrigin;
    if (enemy.patrolAxis === 'x') {
      enemy.x += enemy.patrolDir * enemy.speed * (dt / 1000);
      if (Math.abs(enemy.x - origin.x) > enemy.patrolRange) {
        enemy.patrolDir *= -1;
        enemy.x = origin.x + enemy.patrolRange * Math.sign(enemy.x - origin.x);
      }
      enemy.facing = enemy.patrolDir > 0 ? 'right' : 'left';
    } else {
      enemy.y += enemy.patrolDir * enemy.speed * (dt / 1000);
      if (Math.abs(enemy.y - origin.y) > enemy.patrolRange) {
        enemy.patrolDir *= -1;
        enemy.y = origin.y + enemy.patrolRange * Math.sign(enemy.y - origin.y);
      }
      enemy.facing = enemy.patrolDir > 0 ? 'down' : 'up';
    }

    if (enemy.fireTimer <= 0) {
      fireBullet(enemy, 'enemy');
      enemy.fireTimer = enemy.fireInterval;
    }
  }

  clampToBounds(enemy);
}

function handleCollisions() {
  bullets.forEach((bullet) => {
    if (!bullet.alive) return;

    if (bullet.owner === 'hero') {
      for (const enemy of enemies) {
        if (enemy.alive && circleHit(bullet, enemy)) {
          bullet.alive = false;
          enemy.hp -= 1;
          if (enemy.hp <= 0) {
            enemy.alive = false;
            enemy.deathTimer = 0;
          }
          break;
        }
      }
    } else if (bullet.owner === 'enemy') {
      if (hero.alive && circleHit(bullet, hero)) {
        bullet.alive = false;
        hero.hp -= 1;
        if (hero.hp <= 0) {
          hero.alive = false;
          hero.deathTimer = 0;
        }
      }
    }
  });
}

function updateLevelTransition(dt) {
  transitionTimer += dt;
  if (transitionTimer >= LEVEL_TRANSITION_MS) {
    currentLevel = 1;
    const loaded = loadLevel(1, hero);
    enemies = loaded.enemies;
    bullets = loaded.bullets;
    hero.hp = Math.min(HERO_MAX_HP, hero.hp + 1);
    gameState = 'playing';
  }
}

function updateGameover() {
  if (keys['KeyR']) restartGame();
}

function updateWin(dt) {
  if (princess) princess.animTimer += dt;
  if (keys['KeyR']) restartGame();
}

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (gameState === 'playing' || gameState === 'levelTransition' || gameState === 'gameover') {
    renderPlayingScene();
  } else if (gameState === 'win') {
    renderWinScene();
  }

  updateHUD();
  updateOverlays();
}

function renderPlayingScene() {
  bullets.forEach((b) => drawBullet(ctx, b));
  enemies.forEach((e) => drawCharacter(ctx, e));
  drawCharacter(ctx, hero);
}

function renderWinScene() {
  if (princess) drawPrincess(ctx, princess);
  drawCharacter(ctx, hero);
}

function updateHUD() {
  hudLevel.textContent = `Level ${currentLevel + 1}`;
  hudHp.textContent = `HP: ${Math.max(0, Math.ceil(hero.hp))}`;
}

function updateOverlays() {
  startScreen.classList.toggle('hidden', gameState !== 'start');
  levelTransitionEl.classList.toggle('hidden', gameState !== 'levelTransition');
  if (gameState === 'levelTransition') {
    transitionTextEl.textContent = `Level ${currentLevel + 2}`;
  }
  gameoverScreen.classList.toggle('hidden', gameState !== 'gameover');
  winScreen.classList.toggle('hidden', gameState !== 'win');
}

window.addEventListener('DOMContentLoaded', init);

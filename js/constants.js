const CANVAS_W = 800;
const CANVAS_H = 600;

const HERO_SPEED = 220; // px/sec
const HERO_MAX_HP = 3;
const HERO_SIZE = { w: 28, h: 40 };

const BULLET_SPEED = 420; // px/sec
const BULLET_RADIUS = 5;
const FIRE_COOLDOWN_MS = 250;
const FLASH_DURATION_MS = 80;

const ENEMY_SIZE = { w: 28, h: 40 };
const DEATH_FADE_MS = 400;

const LEVEL_TRANSITION_MS = 2000;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const COLORS = {
  heroBody: '#3da5f4',
  heroLeg: '#1c6fb0',
  heroGun: '#333',
  enemyBody: '#e63946',
  enemyLeg: '#a12833',
  enemyGun: '#222',
  heroBullet: '#ffd166',
  enemyBullet: '#ff4d6d',
  muzzleFlash: '#fff3b0',
  princessDress: '#d63384',
  princessSkin: '#ffcda3',
};

function createHero(x, y) {
  return {
    x, y,
    w: HERO_SIZE.w, h: HERO_SIZE.h,
    facing: 'right',
    hp: HERO_MAX_HP,
    alive: true,
    fireCooldown: 0,
    animTimer: 0,
    muzzleFlashTimer: 0,
    deathTimer: 0,
    moving: false,
    isHero: true,
    colors: { body: COLORS.heroBody, leg: COLORS.heroLeg, gun: COLORS.heroGun },
  };
}

function createEnemy(config) {
  return {
    x: config.x, y: config.y,
    w: ENEMY_SIZE.w, h: ENEMY_SIZE.h,
    facing: 'down',
    hp: config.hp || 1,
    alive: true,
    type: config.type,
    speed: config.speed || 60,
    fireInterval: config.fireCooldown || 2000,
    fireTimer: config.fireCooldown || 2000,
    animTimer: 0,
    muzzleFlashTimer: 0,
    deathTimer: 0,
    moving: false,
    isHero: false,
    // patrol-only fields
    patrolAxis: config.patrolAxis || 'x',
    patrolRange: config.patrolRange || 100,
    patrolOrigin: { x: config.x, y: config.y },
    patrolDir: 1,
    colors: { body: COLORS.enemyBody, leg: COLORS.enemyLeg, gun: COLORS.enemyGun },
  };
}

function createBullet(x, y, dir, owner) {
  const vec = DIRECTION_VECTORS[dir] || DIRECTION_VECTORS.right;
  return {
    x, y,
    vx: vec.x * BULLET_SPEED,
    vy: vec.y * BULLET_SPEED,
    r: BULLET_RADIUS,
    owner,
    alive: true,
    color: owner === 'hero' ? COLORS.heroBullet : COLORS.enemyBullet,
  };
}

function createPrincess(x, y) {
  return { x, y, w: 26, h: 44, animTimer: 0 };
}

function drawCharacter(ctx, entity) {
  const fadeProgress = entity.alive ? 1 : Math.max(0, 1 - entity.deathTimer / DEATH_FADE_MS);
  if (fadeProgress <= 0) return;

  ctx.save();
  ctx.globalAlpha = fadeProgress;
  ctx.translate(entity.x, entity.y);
  ctx.scale(fadeProgress, fadeProgress);

  const { w, h, colors, facing } = entity;
  const legSwing = entity.moving ? Math.sin(entity.animTimer * 0.012) * (w * 0.28) : 0;

  // legs
  ctx.fillStyle = colors.leg;
  const legW = w * 0.28;
  const legH = h * 0.32;
  ctx.fillRect(-w / 2 + legW * 0.2 + legSwing, h / 2 - legH, legW, legH);
  ctx.fillRect(w / 2 - legW * 1.2 - legSwing, h / 2 - legH, legW, legH);

  // torso
  ctx.fillStyle = colors.body;
  ctx.fillRect(-w / 2, -h / 2 + h * 0.22, w, h * 0.55);

  // head
  ctx.beginPath();
  ctx.arc(0, -h / 2, w * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // gun, offset toward facing direction
  const dir = DIRECTION_VECTORS[facing] || DIRECTION_VECTORS.right;
  ctx.fillStyle = colors.gun;
  const gunLen = w * 0.9;
  const gunThick = 5;
  const gunOriginX = dir.x * (w * 0.3);
  const gunOriginY = dir.y * (h * 0.15);
  ctx.fillRect(
    gunOriginX - (dir.y !== 0 ? gunThick / 2 : 0),
    gunOriginY - (dir.x !== 0 ? gunThick / 2 : 0),
    dir.x !== 0 ? gunLen * Math.sign(dir.x || 1) : gunThick,
    dir.y !== 0 ? gunLen * Math.sign(dir.y || 1) : gunThick
  );

  // muzzle flash
  if (entity.muzzleFlashTimer > 0) {
    const tipX = gunOriginX + dir.x * gunLen;
    const tipY = gunOriginY + dir.y * gunLen;
    ctx.fillStyle = COLORS.muzzleFlash;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBullet(ctx, bullet) {
  ctx.fillStyle = bullet.color;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawPrincess(ctx, princess) {
  const bob = Math.sin(princess.animTimer * 0.003) * 4;
  ctx.save();
  ctx.translate(princess.x, princess.y + bob);

  // dress (triangle)
  ctx.fillStyle = COLORS.princessDress;
  ctx.beginPath();
  ctx.moveTo(0, -princess.h * 0.1);
  ctx.lineTo(-princess.w / 2, princess.h / 2);
  ctx.lineTo(princess.w / 2, princess.h / 2);
  ctx.closePath();
  ctx.fill();

  // head
  ctx.fillStyle = COLORS.princessSkin;
  ctx.beginPath();
  ctx.arc(0, -princess.h / 2, princess.w * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // crown
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(-princess.w * 0.22, -princess.h / 2 - princess.w * 0.32, princess.w * 0.44, 6);

  ctx.restore();
}

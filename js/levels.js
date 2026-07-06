const LEVELS = [
  // Level 1 - easier: mostly patrolling enemies, slower, longer fire cooldowns
  {
    heroStart: { x: 400, y: 520 },
    enemies: [
      { type: 'patrol', x: 150, y: 150, speed: 60, fireCooldown: 2000, hp: 1, patrolAxis: 'x', patrolRange: 100 },
      { type: 'patrol', x: 650, y: 150, speed: 60, fireCooldown: 2000, hp: 1, patrolAxis: 'x', patrolRange: 100 },
      { type: 'chaser', x: 400, y: 100, speed: 50, fireCooldown: 2200, hp: 1 },
    ],
  },
  // Level 2 - harder: more enemies, mix of chasers, faster, shorter fire cooldowns, tougher
  {
    heroStart: { x: 400, y: 520 },
    enemies: [
      { type: 'chaser', x: 200, y: 150, speed: 100, fireCooldown: 1000, hp: 2 },
      { type: 'chaser', x: 600, y: 150, speed: 100, fireCooldown: 1000, hp: 2 },
      { type: 'patrol', x: 400, y: 100, speed: 90, fireCooldown: 900, hp: 1, patrolAxis: 'x', patrolRange: 200 },
      { type: 'chaser', x: 400, y: 250, speed: 110, fireCooldown: 800, hp: 2 },
      { type: 'patrol', x: 100, y: 300, speed: 90, fireCooldown: 900, hp: 1, patrolAxis: 'y', patrolRange: 100 },
    ],
  },
];

// Rebuilds live enemy/bullet state for the given level index.
// Repositions the hero but preserves its hp (caller may heal separately).
function loadLevel(index, hero) {
  const level = LEVELS[index];
  hero.x = level.heroStart.x;
  hero.y = level.heroStart.y;
  hero.facing = 'up';
  hero.fireCooldown = 0;

  const enemies = level.enemies.map((cfg) => createEnemy(cfg));
  const bullets = [];

  return { enemies, bullets };
}

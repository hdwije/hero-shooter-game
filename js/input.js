const keys = {};

const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter']);

function initInput() {
  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS.has(e.code)) e.preventDefault();
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

// Returns a normalized movement vector plus the raw x/y axis signs,
// so callers can derive facing direction from whichever axis is active.
function getMovementVector() {
  let x = 0;
  let y = 0;
  if (keys['ArrowLeft']) x -= 1;
  if (keys['ArrowRight']) x += 1;
  if (keys['ArrowUp']) y -= 1;
  if (keys['ArrowDown']) y += 1;

  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.sqrt(2);
    x *= inv;
    y *= inv;
  }

  return { x, y };
}

// Picks a single cardinal facing direction from the movement vector.
// Vertical takes priority when both axes are pressed (arbitrary but stable).
function getFacingFromMovement(x, y) {
  if (y < 0) return 'up';
  if (y > 0) return 'down';
  if (x < 0) return 'left';
  if (x > 0) return 'right';
  return null;
}

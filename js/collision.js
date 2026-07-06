function entityRadius(entity) {
  return Math.max(entity.w, entity.h) / 2;
}

function circleHit(a, b) {
  const ra = a.r !== undefined ? a.r : entityRadius(a);
  const rb = b.r !== undefined ? b.r : entityRadius(b);
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const minDist = ra + rb;
  return distSq < minDist * minDist;
}

function clampToBounds(entity) {
  const halfW = entity.w / 2;
  const halfH = entity.h / 2;
  entity.x = Math.min(Math.max(entity.x, halfW), CANVAS_W - halfW);
  entity.y = Math.min(Math.max(entity.y, halfH), CANVAS_H - halfH);
}

function isOffscreen(bullet) {
  return (
    bullet.x < -bullet.r ||
    bullet.x > CANVAS_W + bullet.r ||
    bullet.y < -bullet.r ||
    bullet.y > CANVAS_H + bullet.r
  );
}

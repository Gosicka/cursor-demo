export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function moveAndCollide(body, platforms, dt) {
  body.x += body.vx * dt;
  for (const plat of platforms) {
    if (!aabb(body, plat)) continue;
    if (body.vx > 0) body.x = plat.x - body.w;
    else if (body.vx < 0) body.x = plat.x + plat.w;
    body.vx = 0;
  }

  body.vy += body.gravity * dt;
  body.y += body.vy * dt;
  body.onGround = false;
  for (const plat of platforms) {
    if (!aabb(body, plat)) continue;
    if (body.vy > 0) {
      body.y = plat.y - body.h;
      body.vy = 0;
      body.onGround = true;
    } else if (body.vy < 0) {
      body.y = plat.y + plat.h;
      body.vy = 0;
    }
  }
}

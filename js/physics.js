export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function moveAndCollide(body, platforms, dt) {
  body.x += body.vx * dt;
  for (const plat of platforms) {
    if (!aabb(body, plat)) continue;
    const oneWay = plat.oneWay === true;
    const feet = body.y + body.h;
    if (oneWay && feet <= plat.y + 2) continue;
    if (body.vx > 0) body.x = plat.x - body.w;
    else if (body.vx < 0) body.x = plat.x + plat.w;
    body.vx = 0;
  }

  body.vy += body.gravity * dt;
  const prevFeet = body.y + body.h;
  body.y += body.vy * dt;
  body.onGround = false;
  for (const plat of platforms) {
    if (!aabb(body, plat)) continue;
    const oneWay = plat.oneWay === true;
    if (body.vy > 0) {
      if (oneWay && prevFeet > plat.y + 6) continue;
      body.y = plat.y - body.h;
      body.vy = 0;
      body.onGround = true;
    } else if (body.vy < 0) {
      if (oneWay) continue;
      body.y = plat.y + plat.h;
      body.vy = 0;
    }
  }
}

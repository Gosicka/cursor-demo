import { aabb } from "./physics.js?v=11";

export function cloneLevel(level) {
  return {
    name: level.name,
    subtitle: level.subtitle,
    width: level.width,
    spawn: { ...level.spawn },
    platforms: level.platforms.map((p) => ({ ...p })),
    moths: (level.moths || []).map((m) => ({ ...m, t: 0, baseY: m.y })),
    wisps: (level.wisps || []).map((w) => ({
      ...w,
      t: 0,
      baseY: w.y,
      homeX: w.homeX ?? w.x,
      chasing: false,
    })),
    spitters: (level.spitters || []).map((s) => ({
      ...s,
      t: 0,
      phase: (s.interval ?? 2.4) * 0.35,
      telegraph: false,
    })),
    projectiles: [],
    charms: level.charms.map((c) => ({ ...c, taken: false, bob: Math.random() * Math.PI * 2 })),
    lanterns: level.lanterns.map((l) => ({ ...l })),
    goal: { ...level.goal },
  };
}

export function updateMoths(moths, dt) {
  for (const moth of moths) {
    moth.t += dt * 10;
    moth.x += moth.speed * dt;
    if (moth.x < moth.minX || moth.x + moth.w > moth.maxX) {
      moth.speed *= -1;
      moth.x = Math.max(moth.minX, Math.min(moth.x, moth.maxX - moth.w));
    }
    moth.y = moth.baseY + Math.sin(moth.t) * 6;
  }
}

export function updateWisps(wisps, player, dt) {
  for (const wisp of wisps) {
    wisp.t += dt;
    const pad = wisp.aggroPad ?? 36;
    const reachY = wisp.aggroY ?? 200;
    const playerMidY = player.y + player.h * 0.5;
    const homeMidY = wisp.baseY + wisp.h * 0.5;
    const inX = player.x + player.w > wisp.minX - pad && player.x < wisp.maxX + pad;
    const inY = Math.abs(playerMidY - homeMidY) < reachY;
    const fly = wisp.minY != null && wisp.maxY != null;
    let targetX = wisp.homeX;
    let targetY = wisp.baseY;
    wisp.chasing = false;
    if (inX && inY) {
      targetX = player.x + player.w * 0.5 - wisp.w * 0.5;
      wisp.chasing = true;
      if (fly) targetY = player.y + player.h * 0.5 - wisp.h * 0.5;
    }
    const limitX = wisp.maxX - wisp.w;
    targetX = Math.max(wisp.minX, Math.min(targetX, limitX));
    const step = wisp.speed * dt;
    const distX = targetX - wisp.x;
    if (Math.abs(distX) <= step) wisp.x = targetX;
    else wisp.x += Math.sign(distX) * step;
    if (fly) {
      targetY = Math.max(wisp.minY, Math.min(targetY, wisp.maxY));
      const distY = targetY - wisp.y;
      if (Math.abs(distY) <= step) wisp.y = targetY;
      else wisp.y += Math.sign(distY) * step;
    } else {
      const bob = wisp.chasing ? 9 : 5;
      wisp.y = wisp.baseY + Math.sin(wisp.t * (wisp.chasing ? 6 : 3)) * bob;
    }
  }
}

export function updateSpitters(spitters, projectiles, platforms, dt) {
  let fired = 0;
  for (const s of spitters) {
    s.t += dt;
    const interval = s.interval ?? 2.4;
    const windup = s.windup ?? 0.48;
    s.phase += dt;
    s.telegraph = s.phase >= interval - windup;
    if (s.phase < interval) continue;
    s.phase -= interval;
    const shotW = 16;
    const shotH = 10;
    const dir = s.dir >= 0 ? 1 : -1;
    projectiles.push({
      x: dir > 0 ? s.x + s.w + 4 : s.x - shotW - 4,
      y: s.shotY,
      w: shotW,
      h: shotH,
      vx: dir * s.shotSpeed,
      traveled: 0,
      maxTravel: s.range,
    });
    fired += 1;
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const shot = projectiles[i];
    const dx = shot.vx * dt;
    shot.x += dx;
    shot.traveled += Math.abs(dx);
    let dead = shot.traveled >= shot.maxTravel;
    if (!dead) {
      for (const plat of platforms) {
        if (plat.oneWay === true) continue;
        if (aabb(shot, plat)) {
          dead = true;
          break;
        }
      }
    }
    if (dead) projectiles.splice(i, 1);
  }
  return fired;
}

export function updateCharms(charms, dt) {
  for (const charm of charms) {
    if (charm.taken) continue;
    charm.bob += dt * 3;
  }
}

export function collectCharms(player, charms) {
  let n = 0;
  for (const charm of charms) {
    if (charm.taken) continue;
    const box = { x: charm.x, y: charm.y + Math.sin(charm.bob) * 6, w: 18, h: 22 };
    if (aabb(player, box)) {
      charm.taken = true;
      n += 1;
    }
  }
  return n;
}

export function hitHazard(player, world) {
  const groups = [world.moths, world.wisps, world.spitters, world.projectiles];
  for (const group of groups) {
    if (!group) continue;
    for (const box of group) {
      if (aabb(player, box)) return true;
    }
  }
  return false;
}

export function reachedGoal(player, goal) {
  return aabb(player, goal);
}

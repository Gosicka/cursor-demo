import { aabb } from "./physics.js";

export function cloneLevel(level) {
  return {
    name: level.name,
    subtitle: level.subtitle,
    width: level.width,
    spawn: { ...level.spawn },
    platforms: level.platforms.map((p) => ({ ...p })),
    moths: level.moths.map((m) => ({ ...m, t: 0, baseY: m.y })),
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

export function hitMoth(player, moths) {
  for (const moth of moths) {
    if (aabb(player, moth)) return true;
  }
  return false;
}

export function reachedGoal(player, goal) {
  return aabb(player, goal);
}

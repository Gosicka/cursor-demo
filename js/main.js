import { input } from "./input.js?v=11";
import { moveAndCollide } from "./physics.js?v=11";
import { createPlayer, resetPlayer, updatePlayer } from "./player.js?v=11";
import {
  cloneLevel,
  updateMoths,
  updateWisps,
  updateSpitters,
  updateCharms,
  collectCharms,
  hitHazard,
  reachedGoal,
} from "./entities.js?v=11";
import { LEVELS } from "./levels.js?v=11";
import { drawWorld, drawTitle, drawInterlude, drawWin, W, H } from "./render.js?v=11";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let scene = "title";
let levelIndex = 0;
let world = null;
let player = createPlayer({ x: 0, y: 0 });
let cameraX = 0;
let collectedTotal = 0;
let levelCollected = 0;
let flash = 0;
let time = 0;
let audio;
let pendingLevel = 0;

function unlockAudio() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audio) audio = new AC();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    /* ignore */
  }
}

window.addEventListener("keydown", unlockAudio);

function sfx(kind) {
  try {
    unlockAudio();
    if (!audio) return;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    const now = audio.currentTime;
    let dur = 0.22;
    if (kind === "jump") {
      o.frequency.setValueAtTime(420, now);
      o.frequency.exponentialRampToValueAtTime(280, now + 0.12);
    } else if (kind === "charm") {
      o.frequency.setValueAtTime(660, now);
      o.frequency.exponentialRampToValueAtTime(990, now + 0.14);
    } else if (kind === "die") {
      o.type = "sawtooth";
      o.frequency.setValueAtTime(180, now);
      o.frequency.exponentialRampToValueAtTime(70, now + 0.2);
    } else if (kind === "shot") {
      o.type = "triangle";
      o.frequency.setValueAtTime(920, now);
      o.frequency.exponentialRampToValueAtTime(420, now + 0.08);
      dur = 0.1;
    } else {
      o.frequency.setValueAtTime(520, now);
      o.frequency.exponentialRampToValueAtTime(780, now + 0.18);
    }
    g.gain.setValueAtTime(kind === "shot" ? 0.03 : 0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.start(now);
    o.stop(now + dur);
  } catch {
    /* ignore */
  }
}

function startLevel(index) {
  levelIndex = index;
  world = cloneLevel(LEVELS[index]);
  resetPlayer(player, world.spawn);
  cameraX = 0;
  levelCollected = 0;
  flash = 0;
  input.clearPressed();
  scene = "play";
}

function cameraFollow() {
  const target = player.x - W * 0.38;
  cameraX += (target - cameraX) * 0.12;
  cameraX = Math.max(0, Math.min(cameraX, world.width - W));
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  time += dt;
  flash = Math.max(0, flash - dt * 3);

  if (scene === "title") {
    if (input.consume("start")) {
      collectedTotal = 0;
      startLevel(0);
      sfx("goal");
    }
    drawTitle(ctx, time);
  } else if (scene === "play") {
    if (input.consume("restart")) {
      collectedTotal = Math.max(0, collectedTotal - levelCollected);
      startLevel(levelIndex);
    }
    const jumped = updatePlayer(player, input, dt);
    if (jumped) sfx("jump");
    moveAndCollide(player, world.platforms, dt);
    updateMoths(world.moths, dt);
    updateWisps(world.wisps, player, dt);
    const shots = updateSpitters(world.spitters, world.projectiles, world.platforms, dt);
    if (shots) sfx("shot");
    updateCharms(world.charms, dt);
    const got = collectCharms(player, world.charms);
    if (got) {
      levelCollected += got;
      collectedTotal += got;
      sfx("charm");
    }
    if (player.y > H + 80 || hitHazard(player, world)) {
      sfx("die");
      flash = 1;
      resetPlayer(player, world.spawn);
    }
    if (reachedGoal(player, world.goal)) {
      sfx("goal");
      input.clearPressed();
      if (levelIndex >= LEVELS.length - 1) {
        scene = "win";
      } else {
        pendingLevel = levelIndex + 1;
        scene = "interlude";
      }
    }
    cameraFollow();
    const total = world.charms.length;
    drawWorld(ctx, world, player, cameraX, levelCollected, total, flash, time);
  } else if (scene === "interlude") {
    const next = LEVELS[pendingLevel];
    if (input.consume("start")) startLevel(pendingLevel);
    drawInterlude(ctx, next.name, next.subtitle, time);
  } else if (scene === "win") {
    if (input.consume("start")) {
      collectedTotal = 0;
      startLevel(0);
    }
    drawWin(ctx, collectedTotal, time);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

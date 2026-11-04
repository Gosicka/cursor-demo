const RUN = 240;
const JUMP = -520;
const GRAVITY = 1500;

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    w: 28,
    h: 38,
    vx: 0,
    vy: 0,
    gravity: GRAVITY,
    onGround: false,
    facing: 1,
    runT: 0,
    jumpT: 0,
    squash: 1,
    flip: 0,
  };
}

export function resetPlayer(player, spawn) {
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.jumpT = 0;
  player.flip = 0;
  player.squash = 1;
}

export function updatePlayer(player, input, dt) {
  const axis = input.axis();
  player.vx = axis * RUN;
  if (axis) player.facing = axis;

  const wantJump = input.consume("jump") || (input.held("jump") && player.onGround && player.vy === 0);
  if (wantJump && player.onGround) {
    player.vy = JUMP;
    player.onGround = false;
    player.jumpT = 0;
    player.squash = 1.18;
    return "jump";
  }

  if (player.onGround) {
    player.runT += dt * (axis ? 12 : 6);
    player.flip = 0;
    player.squash += (1 - player.squash) * Math.min(1, dt * 12);
  } else {
    player.jumpT += dt;
    player.flip = Math.min(1, player.jumpT / 0.42);
    player.squash = 0.92;
  }
  return null;
}

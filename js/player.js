const RUN = 240;
const JUMP = -520;
const GRAVITY = 1500;
const COYOTE = 0.1;
const JUMP_BUFFER = 0.12;

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
    coyote: 0,
    jumpBuffer: 0,
    invuln: 0,
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
  player.coyote = 0;
  player.jumpBuffer = 0;
}

function hop(player) {
  player.vy = JUMP;
  player.onGround = false;
  player.coyote = 0;
  player.jumpBuffer = 0;
  player.jumpT = 0;
  player.squash = 1.1;
}

export function updatePlayer(player, input, dt) {
  const axis = input.axis();
  player.vx = axis * RUN;
  if (axis) player.facing = axis;

  if (player.onGround) player.coyote = COYOTE;
  else player.coyote = Math.max(0, player.coyote - dt);

  if (input.consume("jump")) player.jumpBuffer = JUMP_BUFFER;
  else player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

  const canUseBufferedJump = player.jumpBuffer > 0 && (player.onGround || player.coyote > 0);
  const holdHop = input.held("jump") && player.onGround && player.vy === 0;
  if (canUseBufferedJump || holdHop) {
    hop(player);
    return "jump";
  }

  if (player.onGround) {
    player.runT += dt * (axis ? 12 : 6);
    player.flip = 0;
    player.squash += (1 - player.squash) * Math.min(1, dt * 12);
  } else {
    player.jumpT += dt;
    player.flip = Math.min(1, player.jumpT / 0.42);
    player.squash = 0.94;
  }
  return null;
}

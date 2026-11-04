const W = 960;
const H = 540;

function wrap(n, m) {
  return ((n % m) + m) % m;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fontTitle(size) {
  return `600 ${size}px "Songti SC", "STSong", "PMingLiU", Palatino, "Palatino Linotype", serif`;
}

function fontUi(size) {
  return `${size}px "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
}

export function drawWorld(ctx, world, player, cameraX, collected, total, flash, time) {
  const glow = 0.35 + (collected / Math.max(1, total)) * 0.55;
  drawSky(ctx, time, glow);
  drawParallax(ctx, cameraX, time, glow);
  ctx.save();
  ctx.translate(-cameraX, 0);
  for (const lantern of world.lanterns) drawLantern(ctx, lantern, time, glow);
  for (const plat of world.platforms) drawPlatform(ctx, plat, time);
  for (const charm of world.charms) if (!charm.taken) drawCharm(ctx, charm, time);
  for (const moth of world.moths || []) drawMoth(ctx, moth, time);
  for (const wisp of world.wisps || []) drawWisp(ctx, wisp, time);
  for (const spitter of world.spitters || []) drawSpitter(ctx, spitter, time);
  for (const shot of world.projectiles || []) drawProjectile(ctx, shot, time);
  drawGoal(ctx, world.goal, time);
  drawPlayer(ctx, player, time);
  ctx.restore();
  drawVignette(ctx);
  if (flash > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, `rgba(255, 214, 180, ${flash * 0.08})`);
    g.addColorStop(1, `rgba(120, 18, 24, ${flash * 0.42})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  drawHud(ctx, world, collected, total);
}

function drawSky(ctx, time, glow) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#12081c");
  g.addColorStop(0.42, "#2a1244");
  g.addColorStop(0.78, "#3a1a38");
  g.addColorStop(1, "#4a241c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const wash = ctx.createLinearGradient(0, H * 0.55, 0, H);
  wash.addColorStop(0, "rgba(255, 150, 70, 0)");
  wash.addColorStop(1, `rgba(255, 140, 60, ${0.08 + glow * 0.06})`);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  drawMoon(ctx, time);
  for (let i = 0; i < 28; i++) {
    const x = wrap(i * 73 + Math.sin(time * 0.3 + i) * 4, W);
    const y = 18 + ((i * 47) % 150);
    const a = 0.15 + (i % 5) * 0.08;
    ctx.fillStyle = `rgba(255, 236, 214, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, i % 4 === 0 ? 1.6 : 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMoon(ctx, time) {
  const x = W * 0.8;
  const y = 74 + Math.sin(time * 0.25) * 3;
  const glow = ctx.createRadialGradient(x, y, 4, x, y, 78);
  glow.addColorStop(0, "rgba(255, 236, 210, 0.55)");
  glow.addColorStop(0.45, "rgba(255, 196, 140, 0.16)");
  glow.addColorStop(1, "rgba(255, 196, 140, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 78, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, 20);
  body.addColorStop(0, "#fff6e4");
  body.addColorStop(1, "#f0c48a");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawParallax(ctx, cameraX, time, glow) {
  for (let i = 0; i < 9; i++) {
    const x = wrap(i * 220 - cameraX * 0.15, W + 220) - 80;
    const h = 120 + (i % 4) * 26;
    const g = ctx.createLinearGradient(0, H - h, 0, H);
    g.addColorStop(0, "rgba(42, 22, 68, 0.2)");
    g.addColorStop(1, "#1a0c2c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, H + 8);
    ctx.bezierCurveTo(x + 40, H - h * 0.45, x + 70, H - h, x + 110, H - h * 0.82);
    ctx.bezierCurveTo(x + 150, H - h * 0.55, x + 190, H - h * 0.2, x + 230, H + 8);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 8; i++) {
    const x = wrap(i * 250 - cameraX * 0.35, W + 250) - 70;
    const top = H - 188 - (i % 3) * 12;
    const body = ctx.createLinearGradient(x, top, x, H);
    body.addColorStop(0, "#3a2158");
    body.addColorStop(1, "#1c102c");
    ctx.fillStyle = body;
    roundRect(ctx, x, top, 108, H - top + 8, 8);
    ctx.fill();
    ctx.fillStyle = "#4c2a62";
    ctx.beginPath();
    ctx.moveTo(x - 10, top + 8);
    ctx.quadraticCurveTo(x + 54, top - 28, x + 118, top + 8);
    ctx.fill();
    for (let w = 0; w < 3; w++) {
      const wx = x + 18 + w * 28;
      const wy = top + 36;
      ctx.fillStyle = `rgba(255, 196, 110, ${0.16 + glow * 0.28})`;
      roundRect(ctx, wx, wy, 14, 18, 3);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 214, 150, ${0.08 + glow * 0.1})`;
      ctx.beginPath();
      ctx.arc(wx + 7, wy + 28, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 7; i++) {
    const x = wrap(i * 280 - cameraX * 0.55 + Math.sin(time * 0.8 + i) * 6, W + 120) + 16;
    ctx.strokeStyle = "rgba(120, 72, 48, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.quadraticCurveTo(x + 6, 40, x - 2, 78 + (i % 3) * 14);
    ctx.stroke();
    drawLantern(ctx, { x: x - 12, y: 78 + (i % 3) * 14 }, time + i, glow * 0.75);
  }

  const fog = ctx.createLinearGradient(0, H - 180, 0, H);
  fog.addColorStop(0, "rgba(28, 10, 22, 0)");
  fog.addColorStop(1, "rgba(22, 8, 16, 0.45)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, H - 180, W, 180);
}

function drawVignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(1, "rgba(6, 2, 10, 0.38)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawPlatform(ctx, plat) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(plat.x + plat.w / 2, plat.y + (plat.oneWay ? plat.h + 8 : 16), plat.w * 0.38, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (plat.oneWay) {
    const silk = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.h);
    silk.addColorStop(0, "#f0c48a");
    silk.addColorStop(0.45, "#c4483c");
    silk.addColorStop(1, "rgba(140, 32, 36, 0.15)");
    ctx.fillStyle = silk;
    roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 228, 190, 0.7)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(plat.x + 8, plat.y + 4);
    ctx.lineTo(plat.x + plat.w - 8, plat.y + 4);
    ctx.stroke();
    ctx.strokeStyle = "rgba(92, 24, 28, 0.45)";
    ctx.lineWidth = 1;
    for (let x = plat.x + 16; x < plat.x + plat.w - 8; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, plat.y + plat.h - 2);
      ctx.quadraticCurveTo(x + 3, plat.y + plat.h + 8, x + 6, plat.y + plat.h - 1);
      ctx.stroke();
    }
  } else {
    const wood = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + Math.min(plat.h, 64));
    wood.addColorStop(0, "#6b4330");
    wood.addColorStop(0.18, "#4a2c22");
    wood.addColorStop(1, "#24140f");
    ctx.fillStyle = wood;
    roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(240, 196, 130, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plat.x + 12, plat.y + 3);
    ctx.lineTo(plat.x + plat.w - 12, plat.y + 3);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 220, 180, 0.08)";
    ctx.lineWidth = 1;
    for (let x = plat.x + 18; x < plat.x + plat.w - 10; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, plat.y + 12);
      ctx.quadraticCurveTo(x + 8, plat.y + 18, x + 2, plat.y + 28);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawLantern(ctx, lantern, time, glow) {
  const sway = Math.sin(time * 1.5 + lantern.x * 0.01) * 0.12;
  ctx.save();
  ctx.translate(lantern.x + 12, lantern.y);
  ctx.rotate(sway);
  const halo = ctx.createRadialGradient(0, 28, 4, 0, 28, 36 + glow * 16);
  halo.addColorStop(0, `rgba(255, 186, 90, ${0.28 + glow * 0.22})`);
  halo.addColorStop(1, "rgba(255, 160, 60, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 28, 36 + glow * 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(92, 52, 28, 0.8)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 6);
  ctx.stroke();
  const body = ctx.createLinearGradient(-12, 4, 12, 34);
  body.addColorStop(0, "#ffe1a4");
  body.addColorStop(0.5, "#f0a33a");
  body.addColorStop(1, "#d4652a");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.bezierCurveTo(-14, 14, -14, 28, -6, 34);
  ctx.quadraticCurveTo(0, 38, 6, 34);
  ctx.bezierCurveTo(14, 28, 14, 14, 8, 8);
  ctx.quadraticCurveTo(0, 4, -8, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 28, 24, 0.7)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 244, 220, 0.8)";
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(0, 28);
  ctx.moveTo(-5, 18);
  ctx.lineTo(5, 18);
  ctx.stroke();
  ctx.restore();
}

function drawCharm(ctx, charm, time) {
  const y = charm.y + Math.sin(charm.bob) * 6;
  ctx.save();
  ctx.translate(charm.x + 9, y + 11);
  ctx.rotate(Math.sin(time * 1.6 + charm.x) * 0.18);
  const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
  glow.addColorStop(0, "rgba(255, 214, 120, 0.45)");
  glow.addColorStop(1, "rgba(255, 214, 120, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createLinearGradient(-8, -12, 8, 12);
  g.addColorStop(0, "#ffe7ae");
  g.addColorStop(1, "#e09a32");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(9, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 42, 28, 0.8)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();
}

function drawMoth(ctx, moth, time) {
  const flap = Math.sin(time * 12 + moth.x * 0.02);
  ctx.save();
  ctx.translate(moth.x + moth.w / 2, moth.y + moth.h / 2);
  const wing = ctx.createLinearGradient(-16, 0, 16, 0);
  wing.addColorStop(0, "rgba(255, 228, 196, 0.2)");
  wing.addColorStop(0.5, "#f3ddc4");
  wing.addColorStop(1, "rgba(255, 228, 196, 0.2)");
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.ellipse(-9, 0, 11, 6 + flap * 2.2, -0.5, 0, Math.PI * 2);
  ctx.ellipse(9, 0, 11, 6 + flap * 2.2, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(92, 48, 32, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#3a2418";
  roundRect(ctx, -3, -6, 6, 12, 3);
  ctx.fill();
  ctx.strokeStyle = "#2a1810";
  ctx.beginPath();
  ctx.moveTo(-1, -6);
  ctx.quadraticCurveTo(-4, -12, -2, -14);
  ctx.moveTo(1, -6);
  ctx.quadraticCurveTo(4, -12, 2, -14);
  ctx.stroke();
  ctx.restore();
}

function drawWisp(ctx, wisp, time) {
  const cx = wisp.x + wisp.w / 2;
  const cy = wisp.y + wisp.h / 2;
  const pulse = wisp.chasing ? 1.15 : 1;
  ctx.save();
  ctx.translate(cx, cy);
  const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 22 * pulse);
  halo.addColorStop(0, wisp.chasing ? "rgba(170, 255, 236, 0.55)" : "rgba(120, 220, 210, 0.35)");
  halo.addColorStop(1, "rgba(80, 200, 190, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 22 * pulse, 0, Math.PI * 2);
  ctx.fill();
  const flame = ctx.createRadialGradient(0, 2, 1, 0, 0, 12);
  flame.addColorStop(0, "#f4fff8");
  flame.addColorStop(0.45, "#7dede0");
  flame.addColorStop(1, "#1c6e72");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.bezierCurveTo(8, -6, 9, 4, 0, 12);
  ctx.bezierCurveTo(-9, 4, -8, -6, 0, -13);
  ctx.fill();
  ctx.fillStyle = "#14383c";
  ctx.beginPath();
  ctx.ellipse(-3, -1, 1.3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(3, -1, 1.3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  if (wisp.chasing) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#9ff3ea";
    ctx.beginPath();
    ctx.ellipse(-10, 4, 5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSpitter(ctx, spitter, time) {
  const dir = spitter.dir >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(spitter.x + spitter.w / 2, spitter.y + spitter.h / 2);
  ctx.scale(dir, 1);
  const body = ctx.createLinearGradient(0, -18, 0, 18);
  body.addColorStop(0, "#f07a6a");
  body.addColorStop(0.4, "#c43732");
  body.addColorStop(1, "#6e1a22");
  ctx.fillStyle = body;
  roundRect(ctx, -13, -16, 26, 32, 8);
  ctx.fill();
  ctx.fillStyle = spitter.telegraph ? "#ffe1a2" : "#f6e2c4";
  ctx.beginPath();
  ctx.ellipse(4, -4, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1214";
  ctx.beginPath();
  ctx.arc(6, -5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 220, 170, 0.7)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(11, -2);
  ctx.lineTo(16, 0);
  ctx.stroke();
  if (spitter.telegraph) {
    const reach = spitter.range || 80;
    const alpha = 0.18 + Math.sin(time * 16) * 0.08;
    const beam = ctx.createLinearGradient(16, 0, 16 + reach, 0);
    beam.addColorStop(0, `rgba(255, 196, 120, ${alpha + 0.25})`);
    beam.addColorStop(1, "rgba(255, 160, 80, 0)");
    ctx.strokeStyle = beam;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(16 + reach, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawProjectile(ctx, shot) {
  ctx.save();
  ctx.translate(shot.x + shot.w / 2, shot.y + shot.h / 2);
  const dir = shot.vx >= 0 ? 1 : -1;
  ctx.scale(dir, 1);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#ffb060";
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-i * 7, 0, 6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(-8, 0, 8, 0);
  g.addColorStop(0, "#fff1c8");
  g.addColorStop(1, "#e45032");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -4);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGoal(ctx, goal, time) {
  const pulse = 1 + Math.sin(time * 2.4) * 0.03;
  ctx.save();
  ctx.translate(goal.x + goal.w / 2, goal.y + goal.h * 0.42);
  ctx.scale(pulse, pulse);
  const glow = ctx.createRadialGradient(0, 10, 4, 0, 10, 48);
  glow.addColorStop(0, "rgba(255, 170, 70, 0.35)");
  glow.addColorStop(1, "rgba(255, 140, 50, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 16, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a2a22";
  roundRect(ctx, -30, -8, 8, goal.h * 0.55, 3);
  ctx.fill();
  roundRect(ctx, 22, -8, 8, goal.h * 0.55, 3);
  ctx.fill();
  const silk = ctx.createLinearGradient(0, -36, 0, 28);
  silk.addColorStop(0, "#ff6d5a");
  silk.addColorStop(1, "#b4232c");
  ctx.fillStyle = silk;
  roundRect(ctx, -26, -34, 52, 62, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 226, 180, 0.8)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = "#ffe1a6";
  ctx.font = fontTitle(13);
  ctx.textAlign = "center";
  ctx.fillText("灯市", 0, 2);
  ctx.restore();
  ctx.fillStyle = "rgba(255, 232, 196, 0.8)";
  ctx.font = fontUi(12);
  ctx.textAlign = "center";
  ctx.fillText("牌坊", goal.x + goal.w / 2, goal.y - 10);
  ctx.textAlign = "left";
}

function drawPlayer(ctx, player, time) {
  const blink = player.invuln > 0 && Math.sin(time * 28) > 0.2;
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h - 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (blink) {
    ctx.restore();
    return;
  }
  ctx.translate(0, -player.h / 2);
  const tilt = (player.onGround ? Math.sin(player.runT) * 0.05 : player.flip * 0.28) * (player.facing || 1);
  ctx.rotate(tilt);
  ctx.scale(player.facing || 1, player.squash || 1);

  ctx.fillStyle = "rgba(20, 8, 12, 0.28)";
  roundRect(ctx, -11, -16, 24, 32, 10);
  ctx.fill();

  const body = ctx.createLinearGradient(0, -20, 0, 16);
  body.addColorStop(0, "#f25b4e");
  body.addColorStop(0.55, "#a52832");
  body.addColorStop(1, "#4a1420");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.bezierCurveTo(13, -18, 14, -4, 11, 8);
  ctx.bezierCurveTo(9, 15, 5, 17, 0, 16);
  ctx.bezierCurveTo(-5, 17, -9, 15, -11, 8);
  ctx.bezierCurveTo(-14, -4, -13, -18, 0, -20);
  ctx.closePath();
  ctx.moveTo(-4.2, -6);
  ctx.ellipse(-4, -6, 1.5, 2.3, 0, 0, Math.PI * 2);
  ctx.moveTo(4.2, -6);
  ctx.ellipse(4, -6, 1.5, 2.3, 0, 0, Math.PI * 2);
  ctx.fill("evenodd");
  ctx.strokeStyle = "rgba(255, 214, 150, 0.85)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  const scarf = 6 + Math.sin(time * 7 + player.runT) * 3;
  ctx.strokeStyle = "#f0c27a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -2);
  ctx.quadraticCurveTo(-14, 2, -12, scarf);
  ctx.stroke();

  ctx.strokeStyle = "#2a1216";
  ctx.lineWidth = 2.2;
  const leg = Math.sin(player.runT) * (player.onGround ? 5 : 2);
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.quadraticCurveTo(-6, 18, -5 + leg, 22);
  ctx.moveTo(5, 14);
  ctx.quadraticCurveTo(6, 18, 5 - leg, 22);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, world, collected, total) {
  ctx.save();
  roundRect(ctx, 16, 14, 360, 86, 16);
  ctx.fillStyle = "rgba(16, 8, 18, 0.55)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 214, 170, 0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffe7c4";
  ctx.font = fontTitle(16);
  ctx.textAlign = "left";
  ctx.fillText(world.name, 30, 38);
  ctx.font = fontUi(13);
  ctx.fillStyle = "rgba(240, 210, 170, 0.82)";
  ctx.fillText(world.subtitle || "", 30, 60);
  ctx.fillStyle = "#f0c27a";
  ctx.fillText(`纸符 ${collected} / ${total}`, 30, 82);
  ctx.restore();
}

function drawCenterCard(ctx) {
  ctx.fillStyle = "rgba(10, 6, 14, 0.46)";
  roundRect(ctx, 180, 120, 600, 300, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 214, 170, 0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawTitle(ctx, time) {
  drawSky(ctx, time, 0.7);
  drawParallax(ctx, time * 24, time, 0.7);
  ctx.fillStyle = "rgba(8, 4, 14, 0.38)";
  ctx.fillRect(0, 0, W, H);
  drawCenterCard(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe6bc";
  ctx.font = fontTitle(58);
  ctx.fillText("灯笼夜市", W / 2, 210);
  ctx.font = fontUi(16);
  ctx.fillStyle = "rgba(246, 220, 186, 0.86)";
  ctx.fillText("剪纸精灵的夜市跑跳", W / 2, 246);
  ctx.font = fontUi(14);
  ctx.fillStyle = "rgba(236, 206, 170, 0.8)";
  ctx.fillText("方向键或 WASD 移动 · 空格 / W / ↑ 跳跃", W / 2, 292);
  ctx.fillText("纸蛾来回飞 · 灯鬼会追 · 纸偶吐出纸镖", W / 2, 318);
  ctx.fillStyle = Math.sin(time * 3.2) > 0 ? "#ffe1a4" : "rgba(224, 176, 110, 0.7)";
  ctx.font = fontUi(16);
  ctx.fillText("按 Enter 开始", W / 2, 368);
  ctx.textAlign = "left";
}

export function drawInterlude(ctx, title, subtitle, time) {
  drawSky(ctx, time, 0.55);
  ctx.fillStyle = "rgba(8, 4, 14, 0.42)";
  ctx.fillRect(0, 0, W, H);
  drawCenterCard(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe6bc";
  ctx.font = fontTitle(36);
  ctx.fillText(title, W / 2, 240);
  ctx.font = fontUi(16);
  ctx.fillStyle = "rgba(246, 220, 186, 0.88)";
  ctx.fillText(subtitle, W / 2, 282);
  ctx.fillStyle = Math.sin(time * 3.2) > 0 ? "#ffe1a4" : "rgba(224, 176, 110, 0.75)";
  ctx.fillText("按 Enter 继续", W / 2, 340);
  ctx.textAlign = "left";
}

export function drawWin(ctx, collected, time) {
  drawSky(ctx, time, 1);
  drawParallax(ctx, 80 + Math.sin(time * 0.4) * 30, time, 1);
  ctx.fillStyle = "rgba(8, 4, 14, 0.4)";
  ctx.fillRect(0, 0, W, H);
  drawCenterCard(ctx);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe9c2";
  ctx.font = fontTitle(48);
  ctx.fillText("夜市通关", W / 2, 236);
  ctx.font = fontUi(18);
  ctx.fillStyle = "#f0c27a";
  ctx.fillText(`收集到 ${collected} 张纸符`, W / 2, 284);
  ctx.font = fontUi(16);
  ctx.fillStyle = "rgba(246, 226, 196, 0.86)";
  ctx.fillText("按 Enter 再玩一次", W / 2, 340);
  ctx.textAlign = "left";
}

export { W, H, wrap };

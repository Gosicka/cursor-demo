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

export function drawWorld(ctx, world, player, cameraX, collected, total, flash, time) {
  const glow = 0.35 + (collected / Math.max(1, total)) * 0.55;
  drawSky(ctx, glow);
  drawParallax(ctx, cameraX, time, glow);
  ctx.save();
  ctx.translate(-cameraX, 0);
  for (const lantern of world.lanterns) drawLantern(ctx, lantern, time, glow);
  for (const plat of world.platforms) drawPlatform(ctx, plat);
  for (const charm of world.charms) if (!charm.taken) drawCharm(ctx, charm, time);
  for (const moth of world.moths) drawMoth(ctx, moth, time);
  for (const wisp of world.wisps || []) drawWisp(ctx, wisp);
  for (const spitter of world.spitters || []) drawSpitter(ctx, spitter, time);
  for (const shot of world.projectiles || []) drawProjectile(ctx, shot);
  drawGoal(ctx, world.goal, time);
  drawPlayer(ctx, player);
  ctx.restore();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,236,210,${flash * 0.55})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawHud(ctx, world, collected, total);
}

function drawSky(ctx, glow) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#140826");
  g.addColorStop(0.45, "#2a1148");
  g.addColorStop(1, `#3a1a2a`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(240,170,70,${0.08 * glow})`;
  ctx.fillRect(0, 0, W, H);
}

function drawParallax(ctx, cameraX, time, glow) {
  ctx.fillStyle = "#1c0c30";
  for (let i = 0; i < 12; i++) {
    const x = wrap(i * 180 - cameraX * 0.15, W + 180) - 40;
    const h = 90 + (i % 4) * 28;
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 50, H - h);
    ctx.lineTo(x + 110, H - h * 0.7);
    ctx.lineTo(x + 170, H);
    ctx.fill();
  }
  ctx.fillStyle = "#251038";
  for (let i = 0; i < 10; i++) {
    const x = wrap(i * 220 - cameraX * 0.35, W + 220) - 60;
    ctx.fillRect(x, H - 160, 90, 160);
    ctx.fillStyle = "#3a1848";
    ctx.beginPath();
    ctx.moveTo(x - 12, H - 160);
    ctx.lineTo(x + 45, H - 198);
    ctx.lineTo(x + 102, H - 160);
    ctx.fill();
    ctx.fillStyle = "#251038";
    for (let w = 0; w < 3; w++) {
      ctx.fillStyle = `rgba(255,186,80,${0.18 + glow * 0.2})`;
      ctx.fillRect(x + 16 + w * 22, H - 120, 12, 16);
      ctx.fillStyle = "#251038";
    }
  }
  for (let i = 0; i < 8; i++) {
    const x = wrap(i * 260 - cameraX * 0.55 + Math.sin(time + i) * 6, W + 80) + 20;
    ctx.strokeStyle = "#6a4020";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 70 + (i % 3) * 16);
    ctx.stroke();
    drawLantern(ctx, { x: x - 10, y: 70 + (i % 3) * 16 }, time + i, glow * 0.8);
  }
}

function drawPlatform(ctx, plat) {
  ctx.fillStyle = "#4a2a1c";
  roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 4);
  ctx.fill();
  ctx.fillStyle = "#6b3d24";
  ctx.fillRect(plat.x, plat.y, plat.w, 8);
  ctx.strokeStyle = "#d7a35a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plat.x, plat.y);
  ctx.lineTo(plat.x + plat.w, plat.y);
  ctx.stroke();
  ctx.fillStyle = "#2a140e";
  for (let x = plat.x + 16; x < plat.x + plat.w - 8; x += 36) {
    ctx.fillRect(x, plat.y + 14, 18, 6);
  }
}

function drawLantern(ctx, lantern, time, glow) {
  const sway = Math.sin(time * 1.6 + lantern.x * 0.01) * 5;
  ctx.save();
  ctx.translate(lantern.x + 12, lantern.y);
  ctx.rotate(sway * 0.02);
  ctx.fillStyle = `rgba(255,170,60,${0.12 + glow * 0.22})`;
  ctx.beginPath();
  ctx.arc(0, 28, 34 + glow * 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c3314";
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, 4);
  ctx.stroke();
  ctx.fillStyle = "#f0b24a";
  roundRect(ctx, -11, 4, 22, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#c43c2c";
  ctx.fillRect(-11, 8, 22, 4);
  ctx.fillRect(-11, 24, 22, 4);
  ctx.fillStyle = "#f7d98a";
  ctx.fillRect(-3, 12, 6, 10);
  ctx.restore();
}

function drawCharm(ctx, charm, time) {
  const y = charm.y + Math.sin(charm.bob) * 6;
  ctx.save();
  ctx.translate(charm.x + 9, y + 11);
  ctx.rotate(Math.sin(time * 2 + charm.x) * 0.2);
  ctx.fillStyle = "#f2c14d";
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a3a24";
  ctx.stroke();
  ctx.restore();
}

function drawMoth(ctx, moth, time) {
  const flap = Math.sin(time * 14 + moth.x) * 8;
  ctx.save();
  ctx.translate(moth.x + moth.w / 2, moth.y + moth.h / 2);
  ctx.fillStyle = "#e8d5b5";
  ctx.beginPath();
  ctx.ellipse(-10, 0, 12, 7 + flap * 0.15, -0.4, 0, Math.PI * 2);
  ctx.ellipse(10, 0, 12, 7 + flap * 0.15, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2418";
  ctx.fillRect(-3, -6, 6, 12);
  ctx.restore();
}

function drawWisp(ctx, wisp) {
  ctx.save();
  ctx.translate(wisp.x + wisp.w / 2, wisp.y + wisp.h / 2);
  ctx.fillStyle = wisp.chasing ? "#9ff3ea" : "#2f8f8a";
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(9, 8);
  ctx.lineTo(0, 3);
  ctx.lineTo(-9, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#102428";
  ctx.fillRect(-5, -4, 3, 4);
  ctx.fillRect(2, -4, 3, 4);
  ctx.restore();
}

function drawSpitter(ctx, spitter, time) {
  const dir = spitter.dir >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(spitter.x + spitter.w / 2, spitter.y + spitter.h / 2);
  ctx.scale(dir, 1);
  ctx.fillStyle = "#c43732";
  roundRect(ctx, -12, -16, 24, 32, 4);
  ctx.fill();
  ctx.fillStyle = spitter.telegraph ? "#ffe1a2" : "#f6e2c4";
  ctx.fillRect(0, -10, 10, 12);
  ctx.fillStyle = "#2a1214";
  ctx.fillRect(6, -7, 3, 3);
  if (spitter.telegraph) {
    ctx.strokeStyle = Math.sin(time * 16) > 0 ? "#ffd27a" : "#e45032";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(12 + Math.min(spitter.range || 80, 72), 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawProjectile(ctx, shot) {
  const dir = shot.vx >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(shot.x + shot.w / 2, shot.y + shot.h / 2);
  ctx.scale(dir, 1);
  ctx.fillStyle = "#f24b3d";
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(-6, -4);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGoal(ctx, goal, time) {
  ctx.fillStyle = "#4a2018";
  ctx.fillRect(goal.x + 8, goal.y + 20, 12, goal.h - 20);
  ctx.fillRect(goal.x + goal.w - 20, goal.y + 20, 12, goal.h - 20);
  ctx.fillStyle = "#f24b3d";
  const pulse = 1 + Math.sin(time * 3) * 0.04;
  ctx.save();
  ctx.translate(goal.x + goal.w / 2, goal.y + 48);
  ctx.scale(pulse, pulse);
  roundRect(ctx, -28, -40, 56, 70, 18);
  ctx.fill();
  ctx.fillStyle = "#ffd27a";
  ctx.fillRect(-6, -18, 12, 28);
  ctx.restore();
  ctx.fillStyle = "#f6e2b8";
  ctx.font = "12px sans-serif";
  ctx.fillText("牌坊", goal.x + 16, goal.y - 8);
}

function drawPlayer(ctx, player) {
  ctx.save();
  ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
  ctx.scale(player.facing, player.squash);
  const flipAngle = player.flip * Math.PI;
  ctx.rotate(flipAngle);
  ctx.fillStyle = "#2b1a12";
  roundRect(ctx, -12, -18, 24, 30, 5);
  ctx.fill();
  ctx.strokeStyle = "#f0c56a";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f4d9a6";
  ctx.fillRect(-6, -12, 4, 4);
  ctx.fillRect(3, -12, 4, 4);
  const leg = Math.sin(player.runT) * (player.onGround ? 6 : 2);
  ctx.strokeStyle = "#2b1a12";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(-6 + leg, 20);
  ctx.moveTo(6, 12);
  ctx.lineTo(6 - leg, 20);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, world, collected, total) {
  ctx.fillStyle = "rgba(12,6,18,0.45)";
  roundRect(ctx, 16, 14, 280, 48, 10);
  ctx.fill();
  ctx.fillStyle = "#f7e1b0";
  ctx.font = "16px sans-serif";
  ctx.fillText(world.name, 28, 34);
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#d7b07a";
  ctx.fillText(`纸符 ${collected} / ${total}   R 重开`, 28, 52);
}

export function drawTitle(ctx, time) {
  drawSky(ctx, 0.6);
  drawParallax(ctx, time * 30, time, 0.7);
  ctx.fillStyle = "rgba(10,4,18,0.55)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f4d18a";
  ctx.font = "bold 54px serif";
  ctx.textAlign = "center";
  ctx.fillText("灯笼夜市", W / 2, 210);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#e8c9a0";
  ctx.fillText("剪纸精灵的夜市跑跳", W / 2, 250);
  ctx.font = "16px sans-serif";
  ctx.fillText("方向键或 WASD 移动 · 空格 / W / ↑ 跳跃", W / 2, 330);
  ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ffd27a" : "#c9a066";
  ctx.fillText("按 Enter 开始", W / 2, 380);
  ctx.textAlign = "left";
}

export function drawInterlude(ctx, title, subtitle, time) {
  drawSky(ctx, 0.5);
  ctx.fillStyle = "rgba(10,4,18,0.5)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f4d18a";
  ctx.font = "bold 36px serif";
  ctx.fillText(title, W / 2, 230);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#e8c9a0";
  ctx.fillText(subtitle, W / 2, 275);
  ctx.fillStyle = Math.sin(time * 4) > 0 ? "#ffd27a" : "#c9a066";
  ctx.fillText("按 Enter 继续", W / 2, 340);
  ctx.textAlign = "left";
}

export function drawWin(ctx, collected, time) {
  drawSky(ctx, 1);
  drawParallax(ctx, 80, time, 1);
  ctx.fillStyle = "rgba(10,4,18,0.45)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe7b0";
  ctx.font = "bold 48px serif";
  ctx.fillText("夜市通关", W / 2, 220);
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#f0c56a";
  ctx.fillText(`收集到 ${collected} 张纸符`, W / 2, 270);
  ctx.font = "16px sans-serif";
  ctx.fillText("按 Enter 再玩一次", W / 2, 340);
  ctx.textAlign = "left";
}

export { W, H };

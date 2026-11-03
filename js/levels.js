const FLOOR = 460;
const ground = (x, w, y = FLOOR) => ({ x, y, w, h: 80, oneWay: false });
const roof = (x, y, w = 140) => ({ x, y, w, h: 22, oneWay: true });

/** 相对主地面 FLOOR 的抬升高度；与跳跃高度匹配，避免首跳过不去 */
const MAX_STEP_UP = 72;
const roofStep = (x, stepUp, w = 140) =>
  roof(x, FLOOR - Math.min(stepUp, MAX_STEP_UP), w);

export const LEVELS = [
  {
    name: "关卡 1 · 入门灯巷",
    subtitle: "跳过缺口，躲开纸蛾，跑向牌坊",
    width: 2600,
    spawn: { x: 60, y: 380 },
    platforms: [
      ground(0, 520),
      ground(600, 280),
      roof(940, 390, 160),
      ground(1180, 420),
      roofStep(1680, 52, 180),
      ground(1920, 680),
    ],
    moths: [{ x: 1280, y: 424, w: 36, h: 22, minX: 1200, maxX: 1550, speed: 70 }],
    charms: [
      { x: 300, y: 390 },
      { x: 980, y: 330 },
      { x: 1720, y: 380 },
    ],
    lanterns: [
      { x: 180, y: 210 },
      { x: 720, y: 180 },
      { x: 1400, y: 160 },
      { x: 2100, y: 150 },
    ],
    goal: { x: 2420, y: 340, w: 70, h: 120 },
  },
  {
    name: "关卡 2 · 屋脊夜市",
    subtitle: "沿着屋檐跳，纸蛾更快了",
    width: 3000,
    spawn: { x: 50, y: 422 },
    platforms: [
      ground(0, 360),
      roofStep(430, 58, 120),
      roofStep(620, 78, 130),
      roofStep(840, 78, 110),
      ground(1040, 260, 420),
      roofStep(1380, 72, 150),
      roofStep(1600, 78, 120),
      ground(1820, 300),
      roofStep(2200, 68, 140),
      roofStep(2400, 75, 130),
      ground(2620, 380),
    ],
    moths: [
      { x: 1100, y: 384, w: 36, h: 22, minX: 1050, maxX: 1280, speed: 90 },
      { x: 1900, y: 424, w: 36, h: 22, minX: 1840, maxX: 2080, speed: 100 },
    ],
    charms: [
      { x: 660, y: 360 },
      { x: 870, y: 360 },
      { x: 1640, y: 360 },
      { x: 2440, y: 360 },
    ],
    lanterns: [
      { x: 200, y: 180 },
      { x: 700, y: 120 },
      { x: 1500, y: 110 },
      { x: 2300, y: 130 },
      { x: 2750, y: 140 },
    ],
    goal: { x: 2840, y: 340, w: 70, h: 120 },
  },
  {
    name: "关卡 3 · 灯海尽头",
    subtitle: "窄踏脚、更快的纸蛾，冲向大红灯笼",
    width: 3400,
    spawn: { x: 48, y: 422 },
    platforms: [
      ground(0, 280),
      roofStep(360, 55, 90),
      roofStep(520, 72, 90),
      roofStep(700, 78, 80),
      roofStep(880, 72, 90),
      ground(1060, 180, 430),
      roofStep(1320, 68, 80),
      roofStep(1480, 75, 80),
      roofStep(1640, 78, 90),
      ground(1820, 200, 400),
      roofStep(2100, 70, 90),
      roofStep(2260, 78, 80),
      roofStep(2420, 72, 90),
      roofStep(2580, 78, 80),
      ground(2760, 640),
    ],
    moths: [
      { x: 540, y: 366, w: 36, h: 22, minX: 500, maxX: 700, speed: 110 },
      { x: 1500, y: 358, w: 36, h: 22, minX: 1460, maxX: 1720, speed: 120 },
      { x: 2300, y: 358, w: 36, h: 22, minX: 2240, maxX: 2500, speed: 130 },
      { x: 2900, y: 424, w: 36, h: 22, minX: 2800, maxX: 3200, speed: 140 },
    ],
    charms: [
      { x: 540, y: 360 },
      { x: 720, y: 360 },
      { x: 1660, y: 360 },
      { x: 2280, y: 360 },
      { x: 2600, y: 360 },
    ],
    lanterns: [
      { x: 140, y: 190 },
      { x: 600, y: 90 },
      { x: 1200, y: 100 },
      { x: 1700, y: 70 },
      { x: 2200, y: 90 },
      { x: 2700, y: 80 },
      { x: 3100, y: 120 },
    ],
    goal: { x: 3220, y: 340, w: 80, h: 120 },
  },
];

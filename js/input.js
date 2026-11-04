const codeAction = new Map();
const down = new Set();
const pressed = new Set();

function actionFromEvent(event) {
  const code = event.code || "";
  const key = (event.key || "").toLowerCase();
  if (code === "ArrowLeft" || code === "KeyA" || key === "a" || key === "arrowleft") return "left";
  if (code === "ArrowRight" || code === "KeyD" || key === "d" || key === "arrowright") return "right";
  if (
    code === "ArrowUp" ||
    code === "KeyW" ||
    code === "Space" ||
    key === "w" ||
    key === "arrowup" ||
    key === " " ||
    key === "spacebar"
  ) {
    return "jump";
  }
  if (code === "Enter" || key === "enter") return "start";
  if (code === "KeyR" || key === "r") return "restart";
  return null;
}

function codeId(event) {
  if (event.code) return event.code;
  return `key:${(event.key || "").toLowerCase()}`;
}

function rebuildDown() {
  const next = new Set(codeAction.values());
  down.clear();
  for (const action of next) down.add(action);
}

window.addEventListener("keydown", (event) => {
  const action = actionFromEvent(event);
  if (!action) return;
  event.preventDefault();
  if (event.repeat) return;
  const id = codeId(event);
  const already = codeAction.has(id);
  codeAction.set(id, action);
  if (!already && !down.has(action)) pressed.add(action);
  down.add(action);
});

window.addEventListener("keyup", (event) => {
  const action = actionFromEvent(event);
  if (!action) return;
  codeAction.delete(codeId(event));
  rebuildDown();
});

function releaseKeys() {
  codeAction.clear();
  down.clear();
  pressed.clear();
}

// 失焦或切到后台时清掉按住的键，避免回到页面后角色一直跑。
window.addEventListener("blur", releaseKeys);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseKeys();
});

export const input = {
  held(action) {
    return down.has(action);
  },
  consume(action) {
    if (!pressed.has(action)) return false;
    pressed.delete(action);
    return true;
  },
  clearPressed() {
    pressed.clear();
  },
  axis() {
    return (this.held("right") ? 1 : 0) - (this.held("left") ? 1 : 0);
  },
};

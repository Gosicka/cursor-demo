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

window.addEventListener("keydown", (event) => {
  const action = actionFromEvent(event);
  if (!action) return;
  event.preventDefault();
  if (!down.has(action)) pressed.add(action);
  down.add(action);
});

window.addEventListener("keyup", (event) => {
  const action = actionFromEvent(event);
  if (!action) return;
  down.delete(action);
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
  axis() {
    return (this.held("right") ? 1 : 0) - (this.held("left") ? 1 : 0);
  },
};

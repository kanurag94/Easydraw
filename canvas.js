const ctx = canvas.getContext("2d");
requestAnimationFrame(animate);
var w = canvas.width;
var h = canvas.height;

const mouse = {
  x: 0,
  y: 0,
  button: false,
  wheel: 0,
  lastX: 0,
  lastY: 0,
  drag: false,
};

const panZoom = {
  x: 0,
  y: 0,
  scale: 1,
  apply() {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  },
  scaleAt(x, y, wheelScale) {
    this.scale *= wheelScale;
    this.x = x - (x - this.x) * wheelScale;
    this.y = y - (y - this.y) * wheelScale;
  },
};

function mouseEvents(e) {
  const boundingRect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - boundingRect.left;
  mouse.y = e.clientY - boundingRect.top;
  mouse.button =
    e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;
  if (e.type === "wheel") {
    mouse.wheel += -e.deltaY;
    e.preventDefault();
  }
}

["mousedown", "mouseup", "mousemove", "wheel"].forEach((name) =>
  document.addEventListener(name, mouseEvents)
);

function drawGrid() {
  const scale = 1 / panZoom.scale;
  var gridScale = 2 ** (Math.log2(128 * scale) | 0);
  var size = Math.max(w, h) * scale + gridScale * 2;
  var x = (((-panZoom.x * scale - gridScale) / gridScale) | 0) * gridScale;
  var y = (((-panZoom.y * scale - gridScale) / gridScale) | 0) * gridScale;
  panZoom.apply();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  for (i = 0; i < size; i += gridScale) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + size);
    ctx.moveTo(x, y + i);
    ctx.lineTo(x + size, y + i);
    ctx.fillText((x + i, y + i), x + i, y + i);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
  ctx.stroke();
}

function animate() {
  // Resize canvas to screen
  if (w !== innerWidth || h !== innerHeight) {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  if (mouse.wheel !== 0) {
    let scale = 1;
    scale = mouse.wheel < 0 ? 1 / 1.01 : 1.01; // Zoom/ Unzoom
    mouse.wheel *= 0.7; // Slowly decay the mouse zoom
    if (Math.abs(mouse.wheel) < 1) {
      mouse.wheel = 0;
    }
    panZoom.scaleAt(mouse.x, mouse.y, scale); // Scale at mouse wheel
  }
  if (mouse.button) {
    if (!mouse.drag) {
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.drag = true;
    } else {
      panZoom.x += mouse.x - mouse.lastX;
      panZoom.y += mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
    }
  } else if (mouse.drag) {
    mouse.drag = false;
  }
  drawGrid();
  requestAnimationFrame(animate);
}

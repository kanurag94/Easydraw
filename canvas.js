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
  draw: false,
};

const lines = {
  x: [],
  y: [],
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

function btnClkEvent(e) {
  lines.x = [];
  lines.y = [];
}

function mouseEvents(e) {
  const boundingRect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - boundingRect.left;
  mouse.y = e.clientY - boundingRect.top;
  if (e.type === "mousedown" && e.ctrlKey) {
    mouse.button = true;
  } else if (e.type === "mousedown") {
    mouse.draw = true;
    drawLine();
  } else if (e.type === "mouseup") {
    mouse.button = false;
    mouse.draw = false;
  }
  if (e.type === "wheel") {
    mouse.wheel += -e.deltaY;
    e.preventDefault();
  }
}

["mousedown", "mouseup", "mousemove", "wheel"].forEach((name) =>
  document.addEventListener(name, mouseEvents)
);

function drawLine() {
  if (mouse.draw) {
    lines.x.push(mouse.x);
    lines.y.push(mouse.y);
    mouse.draw = false;
  }
}

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
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
  ctx.stroke();
  ctx.closePath();
}

function animate() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Resize canvas to screen
  if (w !== innerWidth || h !== innerHeight) {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  ctx.beginPath();
  ctx.lineWidth = 5;
  for (let j = 0; j < lines.x.length - 1; j++) {
    ctx.moveTo(lines.x[j], lines.y[j]);
    ctx.lineTo(lines.x[j + 1], lines.y[j + 1]);
  }
  ctx.stroke();
  ctx.closePath();

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

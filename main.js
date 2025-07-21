const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// --- Set canvas size ---
function setCanvasSize() {
  // Save drawing settings
  const tempColor = ctx.strokeStyle;
  const tempWidth = ctx.lineWidth;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  // Restore drawing settings
  ctx.strokeStyle = tempColor;
  ctx.lineWidth = tempWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

// initial settings
ctx.strokeStyle = 'black';
ctx.lineWidth = 10;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

setCanvasSize(); // set initial size
window.addEventListener('resize', setCanvasSize);

function getCoords(e) {
    if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    return {
        x: e.offsetX,
        y: e.offsetY
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    [lastX, lastY] = [x, y];
}

function draw(e) {
  if (!isDrawing) return; // stop the function if they are not mouse down
  e.preventDefault();
  
  const { x, y } = getCoords(e);

  ctx.beginPath();
  // start from
  ctx.moveTo(lastX, lastY);
  // go to
  ctx.lineTo(x, y);
  ctx.stroke();

  [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing);

// --- Toolbar controls ---
document.getElementById('clear-btn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelectorAll('.color-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    ctx.strokeStyle = e.target.dataset.color;
  });
});
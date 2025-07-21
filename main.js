const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentShape = 'line';

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

function drawStar(x, y, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let cx = x + Math.cos(rot) * outerRadius;
        let cy = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(cx, cy);
        rot += step;
        cx = x + Math.cos(rot) * innerRadius;
        cy = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(cx, cy);
        rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawMoon(x, y, radius) {
    ctx.beginPath();
    // Outer arc
    ctx.arc(x, y, radius, 0.5 * Math.PI, 1.5 * Math.PI, false);
    // Inner arc to create crescent
    ctx.arc(x + radius * 0.4, y, radius * 0.8, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
}


function drawShapeAt(x, y) {
    switch (currentShape) {
        case 'star':
            // Use lineWidth as the 'size' of the shape
            drawStar(x, y, 5, ctx.lineWidth, ctx.lineWidth / 2);
            break;
        case 'moon':
            drawMoon(x, y, ctx.lineWidth);
            break;
    }
}

function draw(e) {
  if (!isDrawing) return; // stop the function if they are not mouse down
  e.preventDefault();
  
  const { x, y } = getCoords(e);

  if (currentShape === 'line') {
      ctx.beginPath();
      // start from
      ctx.moveTo(lastX, lastY);
      // go to
      ctx.lineTo(x, y);
      ctx.stroke();
  } else {
      ctx.fillStyle = ctx.strokeStyle;
      const dist = Math.hypot(x - lastX, y - lastY);
      // Spacing based on brush size
      const step = ctx.lineWidth; 

      if (dist > step) {
          const angle = Math.atan2(y - lastY, x - lastX);
          // Interpolate points along the path to fill gaps
          for (let i = step; i < dist; i += step) {
              const newX = lastX + Math.cos(angle) * i;
              const newY = lastY + Math.sin(angle) * i;
              drawShapeAt(newX, newY);
          }
      }
      // Draw at the final point to ensure it feels responsive
      drawShapeAt(x, y);
  }

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

// --- Slider clearing ---
const sliderHandle = document.getElementById('slider-handle');
const sliderContainer = document.getElementById('slider-container');
let isSliding = false;

function startSliding(e) {
    e.preventDefault();
    isSliding = true;
}

function stopSliding() {
    isSliding = false;
}

function doSlide(e) {
    if (!isSliding) return;
    
    let clientX;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
    } else {
        // For mouse, if button is not pressed, stop. Catches mouseup outside window.
        if (e.buttons !== 1) {
            stopSliding();
            return;
        }
        clientX = e.clientX;
    }

    e.preventDefault();
    
    const containerRect = sliderContainer.getBoundingClientRect();
    let x = clientX - containerRect.left;

    // Center handle on cursor
    x -= sliderHandle.offsetWidth / 2;

    // Clamp position within bounds
    x = Math.max(0, Math.min(x, sliderContainer.clientWidth - sliderHandle.offsetWidth));

    sliderHandle.style.left = `${x}px`;

    // Map slider position to canvas position and clear
    const clearX = (x / sliderContainer.clientWidth) * canvas.width;
    const clearWidth = (sliderHandle.offsetWidth / sliderContainer.clientWidth) * canvas.width;
    
    ctx.clearRect(clearX, 0, clearWidth, canvas.height);
}


// Listen on handle for starting
sliderHandle.addEventListener('mousedown', startSliding);
sliderHandle.addEventListener('touchstart', startSliding, { passive: false });

// Listen on the whole document for moving and stopping
document.addEventListener('mousemove', doSlide);
document.addEventListener('touchmove', doSlide, { passive: false });

document.addEventListener('mouseup', stopSliding);
document.addEventListener('touchend', stopSliding);


// --- Toolbar controls ---
document.querySelectorAll('.color-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    ctx.strokeStyle = e.target.dataset.color;
  });
});

document.querySelectorAll('.shape-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    currentShape = e.target.dataset.shape;
  });
});
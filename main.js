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
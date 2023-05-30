

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.strokeStyle = "white";

let previousTimestamp;


const circleSpacing = 28;
const circleRadius = 8;

let gridWidth = 50;
let gridHeight = 50;
function calcGridSize() {
    gridWidth = Math.floor(canvas.width / circleSpacing) + 1;
    gridHeight = Math.floor(canvas.height / circleSpacing) + 2;
}
resizeWindow();

const grid = []
let mode = 0

// let mouse = new Vec2(0,0);
function i_to_x(i) {
    return i%gridWidth + 0.5*(i_to_y(i)%2);
    // return i%gridWidth;
}
function i_to_y(i) {
   return Math.floor(i/gridWidth);
}

function sample_func(x, y, t) {
    //2d sinwave
    return (Math.sin(x/5 + t/1000) + Math.sin(x/25 - t/500) + Math.sin(y/5 + t/1000) + Math.sin(y/10 - t/1500))/8 + 0.5;
}
function update(t, dt) {
    for (let i = 0; i < gridWidth*gridHeight; i++) {
        let x = i_to_x(i);
        let y = i_to_y(i);
        grid[i] = sample_func(x, y, t);
    }
}


function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridWidth*gridHeight; i++) {
        let x = i_to_x(i);
        let y = i_to_y(i);

        // ctx.strokeStyle = "white";
        let k = lerp(100, 255, grid[i]);
        ctx.strokeStyle = `rgb(${k},${k},${k})`;
        ctx.fillStyle = `rgb(${k},${k},${k})`;
        ctx.beginPath();
        ctx.arc(x * circleSpacing, y * circleSpacing, grid[i]*circleRadius, 0, 2*Math.PI);
        // ctx.arc(x * circleSpacing, y * circleSpacing, circleRadius, t/1000, t/1000 + 2*Math.PI*grid[i]);
        if (mode == 0) {
            ctx.fill()
        } else if (mode == 1) {
            ctx.stroke();
        }
    }
}

// canvas.addEventListener('mousemove', (evt) => {
//     mouse = getMousePos(canvas, evt);
// }, false);
canvas.addEventListener('mousedown', (evt) => {
    mode = (mode + 1) % 2;
}, false);
// canvas.addEventListener('mouseup', (evt) => {
//    return;
// }, false);

function resizeWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calcGridSize();
}
resizeWindow();
window.addEventListener('resize', resizeWindow, false);


function animationFrame(timestamp) {
    let elapsed = 0;
    if (previousTimestamp !== undefined) {
        elapsed = timestamp - previousTimestamp;
    }
    previousTimestamp = timestamp;
    update(timestamp, elapsed);
    draw(timestamp);
    window.requestAnimationFrame(animationFrame);
}
window.requestAnimationFrame(animationFrame);

function lerp(a, b, t) {
    return a + t*(b-a);
}
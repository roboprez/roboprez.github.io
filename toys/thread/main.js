class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(vec) {
        this.x = vec.x;
        this.y = vec.y;
    }
    add(vec) {
        return new Vec2(this.x + vec.x, this.y + vec.y);
    }
    sub(vec) {
        return new Vec2(this.x - vec.x, this.y - vec.y);
    }
    mul(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        let len = this.len()
        if (len == 0) {
            return new Vec2(0,0)
        }
        return new Vec2(this.x / len, this.y / len);
    }
}

class Chain {
    len = 0;
    chain = []
    linkSize = 10;

    constructor(len) {
        this.len = len;
        for (let i = 0; i < len; i++) {
            this.chain.push(new Vec2(0,0))
        }
    }

    update(dt) {
        // Ease the start of the chain towards the mouse
        // point += (mouse-point)*0.5
        this.chain[0] = this.chain[0].add(mouse.sub(this.chain[0]).mul(0.2))
        // this.chain[0].set(mouse);

        // Resolve constrains in order from start to end
        for (let i = 1; i < this.chain.length; i++) {
            this.chain[i] = Constraint.distance(this.chain[i], this.chain[i-1], this.linkSize)

            // Collide with circle
            for (const circle of circles) {
                this.chain[i] = circle.pointCollide(this.chain[i])
            }
        }


    }

    draw() {
        for (let i = 1; i < this.chain.length; i++) {
            let x = lerp(255,100, (i-1)/this.chain.length);
            ctx.strokeStyle = `rgb(${x},${x},${x})`;
            ctx.beginPath();
            ctx.moveTo(this.chain[i-1].x, this.chain[i-1].y);
            ctx.lineTo(this.chain[i].x, this.chain[i].y);
            ctx.stroke();
        }
    }
}

function lerp(a, b, t) {
    return a + t*(b-a);
}

class Circle extends Vec2 {
    drag = false;
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }
    update(dt) {
        if (this.drag) {
            this.x = mouse.x;
            this.y = mouse.y;
        }
    }
    pointCollide(point) {
        if (this.sub(point).len() < this.radius) {
            return Constraint.distance(point, this, this.radius);
        } else {
            return point;
        }
    }
    draw() {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        // ctx.fill();
        ctx.stroke();
    }
}

class Constraint {
    // Move point towards / away from anchor so that is is 'distance' from anchor.
    // Return new point
    static distance(point, anchor, distance) {
        return point.sub(anchor).norm().mul(distance).add(anchor)
    }
}

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.strokeStyle = "white";

let previousTimestamp;

let mouse = new Vec2(0,0);

let chain = new Chain(400);
let circles = [new Circle(200, 150, 50), new Circle(500, 260, 70), new Circle(400, 500, 40)];

canvas.addEventListener('mousemove', (evt) => {
    mouse = getMousePos(canvas, evt);
}, false);

canvas.addEventListener('mousedown', (evt) => {
    for (const circle of circles) {
        if (mouse.sub(circle).len() < circle.radius) {
            window.console.log("sdfgljsdg")
            circle.drag = true;
            return
        }
    }
}, false);
canvas.addEventListener('mouseup', (evt) => {
    for (const circle of circles) {
        circle.drag = false;
    }
}, false);

function resizeWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeWindow();
window.addEventListener('resize', resizeWindow, false);

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vec2(evt.clientX - rect.left, evt.clientY - rect.top);
}

function update(dt) {
    chain.update(dt);

    for (const circle of circles) {
        circle.update();
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chain.draw();
    for (const circle of circles) {
        circle.draw();
    }
}

function animationFrame(timestamp) {
    let elapsed = 0;
    if (previousTimestamp !== undefined) {
        elapsed = timestamp - previousTimestamp;
    }
    previousTimestamp = timestamp;
    update(elapsed);
    draw();
    window.requestAnimationFrame(animationFrame);
}
window.requestAnimationFrame(animationFrame);


// Turn touch events into mouse events
// https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}
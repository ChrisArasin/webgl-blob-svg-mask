import './style.scss';
const createRegl = require('regl');
import frag from './blob2.frag';

// -----------
// Wobble Mask
// -----------

const pathEl = document.querySelector('#path');
const points = [
  { start: { x: 0, y: 0.75 }, end: { x: 0, y: 0.833 } },
  { start: { x: 0.21, y: 0.66 }, end: { x: 0.071, y: 0.91 } },
  { start: { x: 0.42, y: 0.8 }, end: { x: 0.28, y: 0.83 } },
  { start: { x: 0.85, y: 0.83 }, end: { x: 0.64, y: 0.7 } },
  { start: { x: 1, y: 0.675 }, end: { x: 1, y: 0.83 } },
];

let mouseTarget = [0, 0];
let mousePos = [0, 0];

const mouse = createMouse({
  onMove: () => {
    mouseTarget = mouse.position;
  },
});

function updatePoints() {
  const t = mousePos[0] / window.innerWidth;

  points.forEach((p) => {
    p.val = {
      x: lerpSimple(p.start.x, p.end.x, t),
      y: lerpSimple(p.start.y, p.end.y, t),
    };
  });
}
function updatPath() {
  const path = `M0 0 L${points[0].val.x} ${points[0].val.y} Q ${points[1].val.x} ${points[1].val.y} ${points[2].val.x} ${points[2].val.y} T ${points[3].val.x} ${points[3].val.y} T ${points[4].val.x} ${points[4].val.y} L1 0 z`;

  pathEl.setAttribute('d', path);
}

function lerp(position, targetPosition, speed = 0.1) {
  position[0] += ((targetPosition[0] - position[0]) / 2) * speed;
  position[1] += ((targetPosition[1] - position[1]) / 2) * speed;
}
function lerpSimple(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}
function createMouse(opts = {}) {
  const mouse = {
    moved: false,
    position: [0, 0],
    dispose,
  };

  window.addEventListener('mousemove', move);

  return mouse;

  function move(ev) {
    const cx = ev.clientX || 0;
    const cy = ev.clientY || 0;
    mouse.position = [cx, cy];
    if (opts.onMove) opts.onMove();
  }

  function dispose() {
    window.removeEventListener('mousemove', move);
  }
}

// -----------
// Blob
// -----------

const data = {
  animateGrain: true,
  grainAmount: 0.1,
  noiseSpeed: 0.2,
  noiseFreq: 0.8,
  softness: 0.1,
  smoothEdge: 0.1,
  smoothSize: 0.2,
  halo: true,
  haloSize: 0.1,
};

const regl = createRegl({ canvas: canvas });

canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', 800);

const drawQuad = regl({
  frag: frag,
  vert: `
    precision mediump float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,
  // Here we define the vertex attributes for the above shader
  attributes: {
    position: (context, props) =>
      regl.buffer([
        [1, -1],
        [1, 1],
        [-1, -1],
        [-1, 1],
      ]),
  },

  uniforms: {
    u_resolution: [window.innerWidth, 800],
    u_screenDimensions: [window.innerWidth, 800],
    u_time: (context, props, batchId) => context.time,
    u_noiseFreq: () => data.noiseFreq,
    u_noiseSpeed: () => data.noiseSpeed,
    u_smoothEdge: () => data.softness,
    u_smoothSize: () => data.smoothSize,
    u_animateGrain: () => data.animateGrain,
    u_grainAmount: () => data.grainAmount,
    u_mouse: () => mousePos,
    u_halo: () => data.halo,
    u_haloSize: () => data.haloSize,
  },
  primitive: 'triangle strip',

  // This tells regl the number of vertices to draw in this command
  count: 4,
});
// -----------
// Animation Loop
// -----------

function update() {
  lerp(mousePos, mouseTarget);
  regl.poll();

  regl.clear({
    color: [1, 1, 1, 0],
  });

  drawQuad();
  updatePoints();
  updatPath();

  requestAnimationFrame(update);
}
requestAnimationFrame(update);

// Copied and adapted from https://www.cssscript.com/confetti-falling-animation/

const maxParticleCount = 150; //set max confetti count
const particleSpeed = 2; //set the particle animation speed

let streamingConfetti = false;
let animationTimer: null | number = null;
let particles: Particle[] = [];
let waveAngle = 0;

const colors = [
  "DodgerBlue",
  "OliveDrab",
  "Gold",
  "Pink",
  "SlateBlue",
  "LightBlue",
  "Violet",
  "PaleGreen",
  "SteelBlue",
  "SandyBrown",
  "Chocolate",
  "Crimson",
];

type Particle = {
  color: string;
  x: number;
  y: number;
  diameter: number;
  tilt: number;
  tiltAngleIncrement: number;
  tiltAngle: number;
};

function resetParticle(
  particle: Particle | null,
  width: number,
  height: number
) {
  if (!particle) particle = {} as Particle;
  particle.color = colors[(Math.random() * colors.length) | 0];
  particle.x = Math.random() * width;
  particle.y = Math.random() * height - height;
  particle.diameter = Math.random() * 10 + 5;
  particle.tilt = Math.random() * 10 - 10;
  particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
  particle.tiltAngle = 0;
  return particle;
}

const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 16.6666667);
    }
  );
})();

export function startConfetti() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let canvas: HTMLCanvasElement | null = document.getElementById(
    "confetti-canvas"
  ) as HTMLCanvasElement;
  if (canvas === null) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("id", "confetti-canvas");
    canvas.setAttribute(
      "style",
      "display:block;z-index:999999;pointer-events:none"
    );
    document.body.appendChild(canvas);
  }
  canvas.width = width;
  canvas.height = height;
  window.addEventListener(
    "resize",
    function () {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    },
    true
  );
  let context = canvas?.getContext("2d");
  while (particles.length < maxParticleCount)
    particles.push(resetParticle(null, width, height));
  streamingConfetti = true;
  if (animationTimer === null && context) {
    (function runAnimation() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (particles.length === 0) animationTimer = null;
      else {
        updateParticles();
        drawParticles(context);
        animationTimer = requestAnimFrame(runAnimation);
      }
    })();
  }
}

export function stopConfetti() {
  streamingConfetti = false;
}

export function removeConfetti() {
  stopConfetti();
  particles = [];
}

export function toggleConfetti() {
  if (streamingConfetti) stopConfetti();
  else startConfetti();
}

function drawParticles(context: CanvasRenderingContext2D) {
  let particle;
  let x;
  for (let i = 0; i < particles.length; i++) {
    particle = particles[i];
    context.beginPath();
    context.lineWidth = particle.diameter;
    context.strokeStyle = particle.color;
    x = particle.x + particle.tilt;
    context.moveTo(x + particle.diameter / 2, particle.y);
    context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
    context.stroke();
  }
}

function updateParticles() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let particle;
  //   waveAngle += 0.01;
  for (let i = 0; i < particles.length; i++) {
    particle = particles[i];
    if (!streamingConfetti && particle.y < -15) particle.y = height + 100;
    else {
      particle.tiltAngle += particle.tiltAngleIncrement;
      particle.x += Math.sin(waveAngle);
      particle.y +=
        (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
      particle.tilt = Math.sin(particle.tiltAngle) * 15;
    }
    if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
      if (streamingConfetti && particles.length <= maxParticleCount)
        resetParticle(particle, width, height);
      else {
        particles.splice(i, 1);
        i--;
      }
    }
  }
}

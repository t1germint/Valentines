const envelopeWrap = document.getElementById('envelopeWrap');
const app = document.getElementById('app');
const openBtn = document.getElementById('openBtn');
const foldedCard = document.getElementById('foldedCard');
const questionText = document.getElementById('questionText');
const questionActions = document.getElementById('questionActions');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const celebration = document.getElementById('celebration');
const confettiCanvas = document.getElementById('confetti-canvas');
const floatingHearts = document.getElementById('floatingHearts');

const noResponses = ['Really?', 'Really really?', 'Are you sure?', 'Think again 🥺', 'Last chance?'];

let isOpening = false;
let noIndex = 0;
let yesScale = 1;
let noNudgeDir = 1;

/**
 * Envelope opening animation sequence.
 * 1) Rise + flap open
 * 2) Slide out card
 * 3) Expand and reveal question controls
 */
function startOpenSequence() {
  if (isOpening || envelopeWrap.classList.contains('question-visible')) return;

  isOpening = true;
  openBtn.disabled = true;
  envelopeWrap.classList.add('is-opening');

  window.setTimeout(() => {
    envelopeWrap.classList.add('card-sliding');
  }, 380);

  const onSlideEnd = (event) => {
    if (event.animationName !== 'slideOut') return;

    foldedCard.removeEventListener('animationend', onSlideEnd);
    envelopeWrap.classList.add('card-centered');

    window.setTimeout(() => {
      envelopeWrap.classList.add('question-visible');
      questionActions.setAttribute('aria-hidden', 'false');
      isOpening = false;
      yesBtn.focus();
    }, 520);
  };

  foldedCard.addEventListener('animationend', onSlideEnd);
}

function handleNoClick() {
  noIndex = (noIndex + 1) % noResponses.length;
  questionText.textContent = noResponses[noIndex];

  // playful behavior: yes gets bigger + no nudges left/right
  yesScale = Math.min(yesScale + 0.08, 1.55);
  yesBtn.style.transform = `scale(${yesScale})`;

  noNudgeDir *= -1;
  const x = noNudgeDir * 12;
  noBtn.style.transform = `translateX(${x}px)`;

  window.setTimeout(() => {
    noBtn.style.transform = 'translateX(0)';
  }, 220);
}

function triggerCelebration() {
  envelopeWrap.classList.add('finished');
  app.classList.add('celebrating');
  celebration.classList.remove('hidden');
  // ensure celebration styles are not overridden by stale states
  requestAnimationFrame(() => {
    celebration.classList.add('is-visible');
  });
  runConfetti(4200);
  seedFloatingHearts(62, 5000);
}

function seedFloatingHearts(count = 56, durationMs = 5000) {
  floatingHearts.innerHTML = '';
  floatingHearts.classList.remove('hidden');

  const heartChoices = ['💖', '♥', '❤'];
  const heartColors = [
    'rgba(223, 24, 37, 0.70)',
    'rgba(255, 127, 160, 0.62)',
    'rgba(255, 255, 255, 0.72)',
    'rgba(255, 195, 211, 0.68)',
  ];

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('span');
    heart.textContent = heartChoices[Math.floor(Math.random() * heartChoices.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
    heart.style.setProperty('--heart-size', `${14 + Math.random() * 20}px`);
    heart.style.setProperty('--heart-delay', `${Math.random() * 1.2}s`);
    heart.style.setProperty('--heart-duration', `${3.4 + Math.random() * 2.2}s`);
    heart.style.setProperty('--heart-drift', `${-24 + Math.random() * 48}px`);
    floatingHearts.appendChild(heart);
  }

  window.setTimeout(() => {
    floatingHearts.innerHTML = '';
    floatingHearts.classList.add('hidden');
  }, durationMs);
}

function runConfetti(duration = 4000) {
  const ctx = confettiCanvas.getContext('2d');

  const fitCanvas = () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  };

  fitCanvas();

  const colors = ['#df1825', '#ff7fa0', '#ffc3d3', '#ffffff'];
  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -Math.random() * confettiCanvas.height,
    size: 5 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: 1.4 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2.2,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.02 + Math.random() * 0.08,
    rotate: Math.random() * Math.PI,
    rotateSpeed: (Math.random() - 0.5) * 0.15,
  }));

  const start = performance.now();
  let rafId = null;

  const draw = (now) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach((p) => {
      p.x += p.speedX + Math.sin(p.wobble) * 0.5;
      p.y += p.speedY;
      p.wobble += p.wobbleSpeed;
      p.rotate += p.rotateSpeed;

      if (p.y > confettiCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * confettiCanvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = elapsed < duration ? 0.95 : Math.max(0, 1 - (elapsed - duration) / 700);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.68);
      ctx.restore();
    });

    if (elapsed < duration + 700) {
      rafId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      cancelAnimationFrame(rafId);
    }
  };

  requestAnimationFrame(draw);
  window.addEventListener('resize', fitCanvas, { once: true });
}

openBtn.addEventListener('click', startOpenSequence);
noBtn.addEventListener('click', handleNoClick);
yesBtn.addEventListener('click', triggerCelebration);

// Explicit keyboard support for Enter/Space on action buttons.
[openBtn, noBtn, yesBtn].forEach((btn) => {
  btn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      btn.click();
    }
  });
});

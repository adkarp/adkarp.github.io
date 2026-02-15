/* ============================================
   Plasma Particle Field
   — Drifting ionized particles with simulation-mesh
     connection lines. Evokes plasma physics, E-field
     visualizations, and computational particle models.
   ============================================ */

(function initPlasmaCanvas() {
  const canvas = document.getElementById('plasma-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles, mouse;
  const PARTICLE_COUNT = 50;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 200;

  // Plasma-spectrum colors at low opacity
  const COLORS = [
    'rgba(56, 189, 248, ',   // cyan — ionized gas
    'rgba(129, 140, 248, ',  // violet — high-energy emission
    'rgba(240, 145, 108, ',  // warm peach — thruster exhaust
  ];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
      color: color,
      alpha: Math.random() * 0.4 + 0.15,
    };
  }

  function init() {
    resize();
    mouse = { x: -9999, y: -9999 };
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.alpha + ')';
    ctx.fill();

    // Subtle glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    ctx.fillStyle = p.color + (p.alpha * 0.15) + ')';
    ctx.fill();
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(56, 189, 248, ' + opacity + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function update() {
    particles.forEach(p => {
      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Gentle mouse repulsion (like charged particle deflection)
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.02;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Speed damping
      p.vx *= 0.999;
      p.vy *= 0.999;

      // Wrap edges
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    });
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    update();
    drawConnections();
    particles.forEach(drawParticle);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  init();
  animate();
})();

/* ============================================
   Navigation
   ============================================ */

// Mobile menu toggle
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// Add shadow to nav on scroll
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

/* ============================================
   Scroll reveal animations
   ============================================ */

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* ============================================
   Portfolio filter
   ============================================ */

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.style.display = '';
        requestAnimationFrame(() => {
          card.classList.add('visible');
        });
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* ============================================
   Portfolio card flip
   ============================================ */

projectCards.forEach(card => {
  // Track touch movement to distinguish taps from scrolls
  let touchStartY = 0;
  let touchMoved = false;

  card.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  }, { passive: true });

  card.addEventListener('touchmove', (e) => {
    if (Math.abs(e.touches[0].clientY - touchStartY) > 10) {
      touchMoved = true;
    }
  }, { passive: true });

  card.addEventListener('click', (e) => {
    // Don't flip if clicking a link or close button
    if (e.target.closest('a') || e.target.closest('.project-card__close')) return;
    // Don't flip if the user was scrolling
    if (touchMoved) return;
    card.classList.toggle('flipped');
  });

  // Close button flips back
  const closeBtn = card.querySelector('.project-card__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('flipped');
    });
  }
});

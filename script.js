(() => {
  // 1. Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Interactive Focus Pillar Tabs
  const FOCUS_DATA = {
    ml: {
      num: '01',
      icon: 'fa-network-wired',
      title: 'Network Anomaly Detection & Clustering',
      desc: 'I worked with the CICIDS2017 dataset to separate normal traffic from DDoS flows using Random Forest, and replicated a semi-supervised K-Means pipeline with variance and information-gain feature selection.',
      tags: ['Python', 'scikit-learn', 'Pandas', 'Random Forest', 'K-Means'],
      link: 'https://github.com/qolyubmir24/ML',
    },
    dss: {
      num: '02',
      icon: 'fa-seedling',
      title: 'Fuzzy Decision Support & Data Apps',
      desc: 'Built a Mamdani fuzzy inference app in Python with scikit-fuzzy and Streamlit to score and rank rice cultivation feasibility across Sumatra provinces.',
      tags: ['Python', 'Streamlit', 'scikit-fuzzy', 'Matplotlib', 'NumPy'],
      link: 'https://github.com/qolyubmir24/fuzzy-logic-scpk',
    },
    swe: {
      num: '03',
      icon: 'fa-laptop-code',
      title: 'Software & Web Foundations',
      desc: 'Earlier coursework in Java OOP (inheritance and multithreading), a C++ file-backed store CLI, and an HTML5 Canvas 2D vector editor.',
      tags: ['Java OOP', 'C++', 'JavaScript', 'HTML5 Canvas', 'Git'],
      link: 'https://github.com/qolyubmir24/grafika-komputer-sederhana',
    },
  };

  const tabBtns = document.querySelectorAll('.interactive-tab');
  const fpNum = document.getElementById('fp-num');
  const fpIcon = document.getElementById('fp-icon');
  const fpTitle = document.getElementById('fp-title');
  const fpDesc = document.getElementById('fp-desc');
  const fpTags = document.getElementById('fp-tags');
  const fpLink = document.getElementById('fp-link');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-tab');
      const data = FOCUS_DATA[key];
      if (!data) return;

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      fpNum.textContent = data.num;
      fpIcon.className = `fas ${data.icon}`;
      fpTitle.textContent = data.title;
      fpDesc.textContent = data.desc;
      fpTags.innerHTML = data.tags.map((t) => `<span>${t}</span>`).join('');
      fpLink.href = data.link;
    });
  });

  // 3. Project Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-cat');
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  // 4. Verlet Rope & Draggable Lanyard Card Physics
  function initLanyardPhysics() {
    const cardEl = document.getElementById('card');
    const canvas = document.getElementById('rope-canvas');
    const container = document.getElementById('lanyard-col');
    if (!cardEl || !canvas || !container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');

    const CONFIG = {
      ropeSegments: 32,
      ropeLength: 105,
      gravity: 0.92,
      stiffness: 0.45,
      friction: 0.982,
    };

    const points = [];
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let dragTilt = 0;
    let pivotPos = { x: 0, y: 0 };
    let dpr = 1;
    let isVisible = true;
    const startTime = Date.now();

    function getCanvasOffsets() {
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        offsetX: canvasRect.left - containerRect.left,
        offsetY: canvasRect.top - containerRect.top,
        containerWidth: containerRect.width,
        cardWidth: cardEl.offsetWidth || 316,
      };
    }

    function initOrResize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const { offsetX, offsetY, containerWidth } = getCanvasOffsets();
      pivotPos.x = containerWidth / 2 - offsetX;
      pivotPos.y = 18 - offsetY;

      if (points.length === 0) {
        const seg = CONFIG.ropeLength / CONFIG.ropeSegments;
        for (let i = 0; i <= CONFIG.ropeSegments; i++) {
          const x = pivotPos.x + (prefersReducedMotion ? 0 : (i / CONFIG.ropeSegments) * 6);
          const y = pivotPos.y + i * seg;
          points.push({ x, y, oldx: x, oldy: y, pinned: i === 0, isDrag: false });
        }
      } else {
        points[0].x = pivotPos.x;
        points[0].y = pivotPos.y;
      }
    }

    window.addEventListener('resize', initOrResize);
    initOrResize();

    const visObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0 }
    );
    visObserver.observe(container);

    function stepPhysics() {
      if (prefersReducedMotion) return;

      const elapsed = Date.now() - startTime;
      const windFactor = Math.min(1, Math.max(0, (elapsed - 800) / 2000));
      const t = Date.now() * 0.001;
      const wind = (Math.sin(t * 0.8) * 0.11 + Math.sin(t * 1.5) * 0.04) * windFactor;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned || p.isDrag) continue;
        const vx = (p.x - p.oldx) * CONFIG.friction;
        const vy = (p.y - p.oldy) * CONFIG.friction;
        p.oldx = p.x;
        p.oldy = p.y;
        p.x += vx + (isDragging ? 0 : wind * (i * 0.04));
        p.y += vy + CONFIG.gravity;
      }

      const targetLen = CONFIG.ropeLength / CONFIG.ropeSegments;
      for (let iter = 0; iter < 24; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = dist - targetLen;
          const stiffness = diff < 0 ? 0.08 : CONFIG.stiffness;
          const pct = (diff / dist) * stiffness;

          if (!p1.pinned && !p1.isDrag && !p2.isDrag) {
            p1.x += dx * pct * 0.5;
            p1.y += dy * pct * 0.5;
            p2.x -= dx * pct * 0.5;
            p2.y -= dy * pct * 0.5;
          } else if (p1.pinned && !p2.isDrag) {
            p2.x -= dx * pct;
            p2.y -= dy * pct;
          } else if (p1.isDrag && !p2.pinned) {
            p2.x -= dx * pct;
            p2.y -= dy * pct;
          } else if (p2.isDrag && !p1.pinned) {
            p1.x += dx * pct;
            p1.y += dy * pct;
          }
        }
      }
    }

    function render() {
      const { offsetX, offsetY, cardWidth } = getCanvasOffsets();
      const last = points[points.length - 1];
      const near = points[points.length - 5];

      // Draw lanyard strap
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Outer crust border of strap
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) * 0.5;
        const yc = (points[i].y + points[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(last.x, last.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 17;
      ctx.strokeStyle = '#11111b';
      ctx.stroke();

      // Inner Catppuccin Surface0 ribbon
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#313244';
      ctx.stroke();

      // Subtle Catppuccin Mauve accent stripe down the strap
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#cba6f7';
      ctx.stroke();
      ctx.restore();

      // Position & tilt card
      const cardX = offsetX + last.x - cardWidth / 2;
      const cardY = offsetY + last.y;
      const vx = last.x - last.oldx;
      const vy = last.y - last.oldy;
      const ropeAngle = Math.atan2(last.x - near.x, last.y - near.y) * (180 / Math.PI);
      const targetTilt = Math.max(-20, Math.min(20, -ropeAngle * 0.65 + vx * 0.9));
      dragTilt += (targetTilt - dragTilt) * 0.16;
      const rotY = Math.max(-18, Math.min(18, vx * 1.4));
      const rotX = Math.max(-14, Math.min(14, -vy * 0.9));

      cardEl.style.transform = `translate3d(${cardX.toFixed(2)}px, ${cardY.toFixed(2)}px, 0) rotate(${dragTilt.toFixed(2)}deg) perspective(900px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
    }

    function tick() {
      if (isVisible) {
        stepPhysics();
        render();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Pointer Events (unified Mouse & Touch)
    function startDrag(clientX, clientY) {
      const canvasRect = canvas.getBoundingClientRect();
      const px = clientX - canvasRect.left;
      const py = clientY - canvasRect.top;
      const last = points[points.length - 1];
      isDragging = true;
      last.isDrag = true;
      dragOffset.x = last.x - px;
      dragOffset.y = last.y - py;
    }

    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      const canvasRect = canvas.getBoundingClientRect();
      const px = clientX - canvasRect.left + dragOffset.x;
      const py = clientY - canvasRect.top + dragOffset.y;
      const last = points[points.length - 1];

      // Clamp stretch distance so card cannot fly off-screen infinitely
      const dx = px - pivotPos.x;
      const dy = py - pivotPos.y;
      const maxStretch = 290;
      const dist = Math.hypot(dx, dy) || 1;
      const clampedX = dist > maxStretch ? pivotPos.x + (dx / dist) * maxStretch : px;
      const clampedY = dist > maxStretch ? pivotPos.y + (dy / dist) * maxStretch : py;

      last.oldx = last.x + (last.x - clampedX) * 0.18;
      last.oldy = last.y + (last.y - clampedY) * 0.18;
      last.x = clampedX;
      last.y = clampedY;
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      points[points.length - 1].isDrag = false;
    }

    cardEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        cardEl.setPointerCapture(e.pointerId);
      } catch (_) {}
      startDrag(e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      if (isDragging) moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  initLanyardPhysics();
})();

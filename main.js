/* ==========================================================
   Akash Raj — portfolio interactions (vanilla JS + Lenis)
   ========================================================== */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const motionOn = () => root.dataset.motion !== "off";
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- Colours from CSS tokens (refreshed on theme change) ---------- */
  let colors = {};
  function readColors() {
    const cs = getComputedStyle(root);
    colors = { dot: cs.getPropertyValue("--dot").trim(), accent: cs.getPropertyValue("--dot-accent").trim(), line: cs.getPropertyValue("--line").trim() };
  }
  readColors();

  // Browser UI colour (mobile address bar) follows the theme
  function syncThemeColor() {
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
  }
  syncThemeColor();

  /* ---------- Theme + motion toggles ---------- */
  const themeBtn = $("#themeToggle");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = current === "light" ? "dark" : "light";
    store("theme", root.dataset.theme);
    readColors();
    syncThemeColor();
    redrawAll();
  });

  const motionBtn = $("#motionToggle");
  function syncMotionLabel() {
    if (!motionBtn) return;
    motionBtn.setAttribute("aria-pressed", motionOn());
    $(".motion-label", motionBtn).textContent = motionOn() ? "Motion on" : "Motion off";
  }
  if (motionBtn) motionBtn.addEventListener("click", () => {
    root.dataset.motion = motionOn() ? "off" : "on";
    store("motion", root.dataset.motion);
    syncMotionLabel();
    if (motionOn()) { startLenis(); } else { stopLenis(); }
    if (!motionOn()) $$("[data-count]").forEach(countUp);
    redrawAll();
  });
  syncMotionLabel();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  function startLenis() {
    if (lenis || typeof Lenis === "undefined" || !motionOn()) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = t => { if (!lenis) return; lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  function stopLenis() { if (lenis) { lenis.destroy(); lenis = null; } }
  startLenis();

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -96, duration: 1.4 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY - 96, behavior: motionOn() ? "smooth" : "auto" });
  }
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" || id === "#" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    scrollToTarget(target);
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $(".nav-menu"), menu = $("#menu");
  function closeMenu() {
    if (!menuBtn) return;
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "Menu";
    menu.setAttribute("aria-hidden", "true");
  }
  if (menuBtn) menuBtn.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    menu.setAttribute("aria-hidden", String(!open));
  });

  /* ---------- Progress bar + nav hide on scroll ---------- */
  const bar = $(".progress i"), nav = $(".nav");
  let lastY = scrollY;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (nav && !document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", scrollY > lastY && scrollY > 240);
    lastY = scrollY;
    updateTimeline();
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Roll-up link text ---------- */
  $$(".roll > span").forEach(s => {
    const t = s.textContent;
    s.innerHTML = `<span class="roll-inner"><span class="roll-a">${t}</span><span class="roll-b" aria-hidden="true">${t}</span></span>`;
  });

  /* ---------- Text scramble ---------- */
  const GLYPHS = "01/—·:-";
  function scramble(el, duration = 900) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement.closest("svg") || !n.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
    const start = performance.now();
    const tick = now => {
      const p = clamp((now - start) / duration, 0, 1);
      nodes.forEach(({ node, text }) => {
        const shown = Math.floor(text.length * p);
        let out = text.slice(0, shown);
        for (let i = shown; i < text.length; i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        node.textContent = out;
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Headings split into masked lines ---------- */
  $$("[data-lines]").forEach(h => {
    [...h.children].forEach((child, i) => {
      const inner = document.createElement("span");
      inner.className = "ln";
      inner.style.transitionDelay = `${i * 0.09}s`;
      while (child.firstChild) inner.appendChild(child.firstChild);
      child.appendChild(inner);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // Stagger siblings that enter together
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.hasAttribute("data-reveal")) : [];
      const idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = `${Math.min(idx, 6) * 0.07}s`;
      el.classList.add("is-in");
      $$("[data-count]", el).forEach(countUp);
      if (el.hasAttribute("data-count")) countUp(el);
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  $$("[data-reveal], [data-lines]").forEach(el => io.observe(el));

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    if (!motionOn()) { el.textContent = target.toFixed(dec); return; }
    const start = performance.now(), dur = 1800;
    const tick = now => {
      const p = clamp((now - start) / dur, 0, 1);
      el.textContent = (target * easeOut(p)).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  // Counters not inside a [data-reveal] block (e.g. stats in tab panels)
  const countIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); } }), { threshold: .5 });
  $$("[data-count]").forEach(el => countIO.observe(el));
  // With motion off, show final numbers immediately
  if (!motionOn()) $$("[data-count]").forEach(countUp);

  /* ---------- Timeline fill ---------- */
  const timeline = $(".timeline");
  function updateTimeline() {
    if (!timeline) return;
    const r = timeline.getBoundingClientRect();
    const p = clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1);
    timeline.style.setProperty("--fill", p.toFixed(3));
  }

  /* ==========================================================
     Canvas helpers
     ========================================================== */
  const visible = new WeakMap();
  const visIO = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)), { rootMargin: "100px" });
  function fitCanvas(c) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    }
    return { w, h, dpr };
  }
  const redrawers = [];
  function redrawAll() { redrawers.forEach(fn => fn()); }

  /* ---------- Halftone portrait ---------- */
  const hero = $(".hero");
  const pCanvas = $(".portrait-canvas");
  if (pCanvas) {
    const ctx = pCanvas.getContext("2d");
    const img = $(".portrait-img");
    let dots = [], mouse = { x: -9999, y: -9999 }, size = { w: 0, h: 0, dpr: 1 };

    function build() {
      size = fitCanvas(pCanvas);
      const { w, h } = size;
      if (!w || !img.naturalWidth) return;
      const step = w < 420 ? 3.6 : 4.2;
      const cols = Math.floor(w / step), rows = Math.floor(h / step);
      if (cols < 2 || rows < 2) return;
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      o.drawImage(img, 0, 0, cols, rows);
      const data = o.getImageData(0, 0, cols, rows).data;
      dots = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        let L = (data[i] * .299 + data[i + 1] * .587 + data[i + 2] * .114) / 255;
        // Drop the studio backdrop so only the person is drawn
        L = clamp((L - .15) / .68, 0, 1);
        // Soft oval vignette so the portrait melts into the page
        const nx = (x / cols - .5) / .5, ny = (y / rows - .5) / .62;
        const v = clamp((1.12 - Math.sqrt(nx * nx + ny * ny)) / .4, 0, 1);
        L = Math.pow(L, .8) * v;
        if (L < .05) continue;
        const px = x * step + step / 2, py = y * step + step / 2;
        // Warm rim light on the right side, like a key light
        const rim = x / cols > .58 && L > .12 && L < .55 && Math.random() < (x / cols - .55) * 1.6;
        dots.push({ x: px, y: py, ox: px, oy: py, r: step * .62 * L + .2, rim, vx: 0, vy: 0 });
      }
      draw(performance.now());
    }

    function draw(t) {
      const { w, h, dpr } = size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const anim = motionOn();
      const base = `rgba(${colors.dot},.95)`, warm = `rgba(${colors.accent},.95)`;
      for (const d of dots) {
        if (anim) {
          const dx = d.x - mouse.x, dy = d.y - mouse.y, dist2 = dx * dx + dy * dy;
          if (dist2 < 8100) { const f = (1 - Math.sqrt(dist2) / 90) * 2.2; const a = Math.atan2(dy, dx); d.vx += Math.cos(a) * f; d.vy += Math.sin(a) * f; }
          d.vx += (d.ox - d.x) * .08; d.vy += (d.oy - d.y) * .08;
          d.vx *= .78; d.vy *= .78;
          d.x += d.vx; d.y += d.vy;
        }
        // Diagonal shimmer gives the halftone its "signal" texture
        const s = anim ? .82 + .18 * Math.sin(t * .0016 + (d.ox + d.oy) * .045) : 1;
        ctx.fillStyle = d.rim ? warm : base;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * s, 0, 6.283);
        ctx.fill();
      }
    }

    const loop = t => { if (motionOn() && visible.get(pCanvas) !== false) draw(t); requestAnimationFrame(loop); };
    if (img.complete) build(); else img.addEventListener("load", build);
    requestAnimationFrame(loop);
    new ResizeObserver(build).observe(pCanvas);
    visIO.observe(pCanvas);
    redrawers.push(() => draw(performance.now()));
    hero.addEventListener("pointermove", e => { const r = pCanvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  }

  /* ---------- Morphing dot fields ---------- */
  const N = 1500;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const SHAPES = {
    // Undulating surface: structure
    wave(i, t) {
      const cols = 50, gx = i % cols, gz = Math.floor(i / cols);
      const x = gx / (cols - 1) * 2 - 1, z = gz / 29 * 2 - 1;
      const y = Math.sin(x * 3.2 + t * .8) * Math.cos(z * 2.4 + t * .6) * .22;
      return rotX(x * 1.05, y, z * .9, .55);
    },
    // Parallel streams moving left to right: pipelines
    flow(i, t) {
      const lanes = 7, lane = i % lanes, k = Math.floor(i / lanes) / (N / lanes);
      const x = ((k + t * .06 * (1 + lane * .12)) % 1) * 2.2 - 1.1;
      const y = (lane - (lanes - 1) / 2) * .16 + Math.sin(x * 4 + lane + t) * .025;
      const z = Math.sin(lane * 1.7) * .3;
      return rotX(x, y, z, .35);
    },
    // Concentric rings expanding: signals
    rings(i, t) {
      const rings = 10, ring = i % rings, k = Math.floor(i / rings) / (N / rings);
      const r = ((ring / rings + t * .05) % 1) * 1.05 + .04;
      const a = k * 6.283 + ring;
      return rotX(Math.cos(a) * r, Math.sin(a) * r * .9, 0, .9);
    },
    // Radial rays pulsing from a core: detection
    burst(i, t) {
      const rays = 125, ray = i % rays, k = Math.floor(i / rays) / (N / rays);
      const a = ray / rays * 6.283;
      const r = .14 + k * .82 * (.86 + .14 * Math.sin(t * 1.4 + ray * .5));
      return [Math.cos(a) * r, Math.sin(a) * r, 0];
    },
    // Rotating sphere: a protective shell
    sphere(i, t) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * golden + t * .25;
      return rotX(Math.cos(a) * r * .78, y * .78, Math.sin(a) * r * .78, .25);
    }
  };
  SHAPES.shield = SHAPES.sphere;
  function rotX(x, y, z, a) { const c = Math.cos(a), s = Math.sin(a); return [x, y * c - z * s, y * s + z * c]; }

  $$("canvas.field").forEach(canvas => {
    const ctx = canvas.getContext("2d");
    const names = canvas.dataset.shapes.split(",");
    const accentIdx = new Set(Array.from({ length: 140 }, () => (Math.random() * N) | 0));
    let from = names[0], to = names[0], morphStart = 0, size = fitCanvas(canvas), tilt = 0, tiltTarget = 0;
    const T0 = performance.now();

    function draw(now) {
      size = fitCanvas(canvas);
      const { w, h, dpr } = size;
      if (!w) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = motionOn() ? (now - T0) / 1000 : 2;
      const m = easeInOut(clamp((now - morphStart) / 1200, 0, 1));
      tilt += (tiltTarget - tilt) * .05;
      const scale = Math.min(w, h * 1.45) * .46, cx = w / 2, cy = h / 2;
      const cs = Math.cos(tilt), sn = Math.sin(tilt);
      for (let i = 0; i < N; i++) {
        let p = SHAPES[to](i, t);
        if (m < 1) { const q = SHAPES[from](i, t); p = [q[0] + (p[0] - q[0]) * m, q[1] + (p[1] - q[1]) * m, q[2] + (p[2] - q[2]) * m]; }
        // gentle pointer-driven rotation around Y
        const x = p[0] * cs + p[2] * sn, z = -p[0] * sn + p[2] * cs, y = p[1];
        const persp = 2.4 / (2.4 + z);
        const sx = cx + x * scale * persp, sy = cy + y * scale * persp;
        const depth = clamp((1 - z) / 2, .15, 1);
        const acc = accentIdx.has(i);
        ctx.fillStyle = acc ? `rgba(${colors.accent},${.35 + depth * .6})` : `rgba(${colors.dot},${.12 + depth * .55})`;
        const r = (acc ? 1.25 : .95) * persp;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
    }
    const loop = now => { if (motionOn() && visible.get(canvas)) draw(now); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    visIO.observe(canvas);
    new ResizeObserver(() => draw(performance.now())).observe(canvas);
    redrawers.push(() => draw(performance.now()));
    canvas.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); tiltTarget = ((e.clientX - r.left) / r.width - .5) * .7; });
    canvas.addEventListener("pointerleave", () => { tiltTarget = 0; });
    canvas.morphTo = name => { if (name === to) return; from = to; to = name; morphStart = performance.now(); if (!motionOn()) draw(morphStart + 2000); };
    draw(performance.now());
  });

  /* ---------- Signal tabs (drive the dot fields) ---------- */
  $$("[data-signal]").forEach(widget => {
    const tabs = $$(".signal-tabs button", widget), panels = $$(".signal-panel", widget);
    const field = $("canvas.field", widget), caption = $(".signal-caption", widget), index = $(".signal-index", widget);
    const shapes = field.dataset.shapes.split(",");
    let current = 0, auto = null, userPicked = false;
    function select(i) {
      current = i;
      tabs.forEach((t, k) => t.setAttribute("aria-selected", String(k === i)));
      panels.forEach((p, k) => p.classList.toggle("is-active", k === i));
      if (caption) caption.textContent = tabs[i].dataset.caption;
      if (index) index.textContent = String(i + 1).padStart(2, "0");
      field.morphTo(shapes[i]);
    }
    tabs.forEach((t, i) => t.addEventListener("click", () => { userPicked = true; clearInterval(auto); select(i); }));
    // Cycle on its own until the visitor picks a tab
    const vIO = new IntersectionObserver(([e]) => {
      clearInterval(auto);
      if (e.isIntersecting && !userPicked && motionOn()) auto = setInterval(() => select((current + 1) % tabs.length), 6000);
    }, { threshold: .4 });
    vIO.observe(widget);
  });

  /* ---------- Expertise accordion + thinking path ---------- */
  const accItems = $$(".acc-item"), path = $(".path");
  accItems.forEach(item => {
    $("button", item).addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      accItems.forEach(o => { o.classList.remove("is-open"); $("button", o).setAttribute("aria-expanded", "false"); });
      if (!willOpen) return;
      item.classList.add("is-open");
      $("button", item).setAttribute("aria-expanded", "true");
      if (path) {
        $(".path-label", path).textContent = item.dataset.label;
        $$(".path-steps b", path).forEach((b, k) => { b.textContent = item.dataset.steps.split("|")[k]; });
        path.classList.remove("is-swapping"); void path.offsetWidth; path.classList.add("is-swapping");
      }
    });
  });

  /* ---------- Credential filters ---------- */
  const filterBtns = $$(".filters button"), cards = $$(".card"), countEl = $(".filters-count span");
  filterBtns.forEach(btn => btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.toggle("is-active", b === btn));
    let n = 0;
    cards.forEach(c => {
      const show = btn.dataset.filter === "all" || c.dataset.kind === btn.dataset.filter;
      c.classList.toggle("is-hidden", !show);
      if (show) { n++; c.classList.remove("is-in"); void c.offsetWidth; c.style.transitionDelay = `${n * .05}s`; c.classList.add("is-in"); }
    });
    if (countEl) countEl.textContent = String(n).padStart(2, "0");
  }));

  /* ---------- Ops banner: live metrics ---------- */
  const ops = $(".ops-canvas");
  if (ops) {
    const ctx = ops.getContext("2d");
    const series = [
      { base: .55, amp: .08, f: 1.3, accent: true },
      { base: .7, amp: .05, f: 2.1 },
      { base: .4, amp: .1, f: .8 }
    ];
    function draw(now) {
      const { w, h, dpr } = fitCanvas(ops);
      if (!w) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = motionOn() ? now / 1000 : 0;
      // grid
      ctx.strokeStyle = `rgba(${colors.dot},.07)`; ctx.lineWidth = 1;
      for (let x = (-(t * 30) % 60); x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      // request bars
      const bw = 10;
      for (let x = w * .35, k = 0; x < w; x += bw + 6, k++) {
        const v = .25 + .2 * Math.sin(k * .7 + t * 1.5) + .15 * Math.sin(k * 1.9 - t);
        ctx.fillStyle = `rgba(${colors.dot},.08)`;
        ctx.fillRect(x, h * (1 - v * .45), bw, h * v * .45);
      }
      // lines
      series.forEach((s, si) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const u = x / w * 8 + t * s.f;
          const y = h * (s.base + Math.sin(u) * s.amp + Math.sin(u * 2.7 + si) * s.amp * .4 + (Math.sin(u * 5.3) > .995 ? -.06 : 0));
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = s.accent ? `rgba(${colors.accent},.85)` : `rgba(${colors.dot},.28)`;
        ctx.lineWidth = s.accent ? 1.6 : 1;
        ctx.stroke();
      });
      // SLO threshold
      ctx.setLineDash([4, 6]); ctx.strokeStyle = `rgba(${colors.dot},.3)`;
      ctx.beginPath(); ctx.moveTo(0, h * .3); ctx.lineTo(w, h * .3); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(${colors.dot},.45)`; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("SLO 99.9%", w - 80, h * .3 - 8);
    }
    const loop = now => { if (motionOn() && visible.get(ops)) draw(now); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    visIO.observe(ops);
    redrawers.push(() => draw(performance.now()));
    new ResizeObserver(() => draw(performance.now())).observe(ops);
  }

  /* ---------- Intro sequence ---------- */
  function intro() {
    root.classList.add("is-loaded");
    if (motionOn()) $$("[data-scramble]").forEach((el, i) => setTimeout(() => scramble(el), i * 40));
    if (hero) setTimeout(() => hero.classList.add("is-signal"), motionOn() ? 1700 : 0);
    onScroll();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(intro); else addEventListener("load", intro);
})();

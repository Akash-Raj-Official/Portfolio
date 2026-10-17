/* =========================================================
   Portfolio interactions — GSAP + ScrollTrigger + Lenis
   ========================================================= */

const hasGSAP = typeof gsap !== "undefined";
document.body.classList.add("loading");

// If the CDN fails, still show the page.
if (!hasGSAP) {
  document.querySelector(".loader")?.remove();
  document.body.classList.remove("loading");
  document.querySelectorAll(".line .word, .loader-words span").forEach(el => (el.style.transform = "none"));
}

/* ---------- Smooth scroll ---------- */
let lenis = null;
if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
}

// Anchor links go through Lenis
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    document.body.classList.remove("menu-open");
    lenis ? lenis.scrollTo(target, { offset: 0 }) : target.scrollIntoView({ behavior: "smooth" });
  });
});

/* ---------- Loader ---------- */
function runLoader() {
  const count = document.getElementById("count");
  const tl = gsap.timeline({ onComplete: heroIntro });
  const counter = { v: 0 };

  tl.to(".loader-words span", { y: 0, duration: 0.8, stagger: 0.25, ease: "power4.out" })
    .to(counter, {
      v: 100, duration: 2.2, ease: "power2.inOut",
      onUpdate: () => (count.textContent = Math.round(counter.v))
    }, 0)
    .to(".loader-bar i", { width: "100%", duration: 2.2, ease: "power2.inOut" }, 0)
    .to(".loader-words span", { y: "-110%", duration: 0.6, stagger: 0.08, ease: "power4.in" }, "+=0.1")
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power4.inOut" }, "-=0.2")
    .set(".loader", { display: "none" });
}

/* ---------- Hero intro ---------- */
function heroIntro() {
  document.body.classList.remove("loading");
  lenis?.start();
  const tl = gsap.timeline();
  tl.to(".hero-title .word", { y: 0, duration: 1.2, stagger: 0.12, ease: "power4.out" })
    .from(".hero-meta p, .hero-intro", { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, "-=0.8")
    .from(".hero-photo", { clipPath: "inset(100% 0 0 0)", duration: 1.1, ease: "power4.out" }, "-=0.9")
    .from(".scroll-down", { scale: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.6")
    .from(".nav > *", { y: -30, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.8");
}

/* ---------- Scroll animations ---------- */
function scrollAnimations() {
  // Hero parallax out
  gsap.to(".hero-title", {
    yPercent: 25, opacity: 0.2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  // Marquee: infinite, flips direction with scroll
  const track = document.querySelector(".marquee-track");
  const loop = gsap.to(track, { xPercent: -50, duration: 18, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate: self => {
      gsap.to(loop, { timeScale: self.direction * (1 + Math.min(Math.abs(self.getVelocity()) / 800, 3)), duration: 0.4, overwrite: true });
    }
  });

  // About: split words and light them up on scroll
  document.querySelectorAll(".split-words").forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join("");
    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  });

  // Counters
  document.querySelectorAll(".counter").forEach(el => {
    const obj = { v: 0 };
    const dec = +(el.dataset.decimals || 0);
    const sfx = el.dataset.suffix ? `<span class="sfx">${el.dataset.suffix}</span>` : "";
    gsap.to(obj, {
      v: +el.dataset.target, duration: 2, ease: "power2.out",
      onUpdate: () => (el.innerHTML = obj.v.toFixed(dec) + sfx),
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  // Big headings & section tags
  gsap.utils.toArray(".big-heading, .section-tag").forEach(el => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Project rows
  gsap.from(".project", {
    y: 80, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".projects", start: "top 80%" }
  });

  // Horizontal showcase — pinned on wide screens only
  ScrollTrigger.matchMedia({
    "(min-width: 901px)": () => {
      const st = document.querySelector(".showcase-track");
      gsap.to(st, {
        x: () => -(st.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: ".showcase", start: "top top", end: () => "+=" + (st.scrollWidth - window.innerWidth),
          scrub: 1, pin: true, invalidateOnRefresh: true
        }
      });
    },
    "(max-width: 900px)": () => {
      document.querySelector(".showcase-track").style.cssText = "flex-direction:column;width:auto";
    }
  });

  // Skills pop in
  gsap.from(".skill-list li", {
    y: 40, opacity: 0, scale: 0.8, duration: 0.6, stagger: 0.05, ease: "back.out(1.7)",
    scrollTrigger: { trigger: ".skill-groups", start: "top 85%" }
  });

  // Experience rows
  gsap.from(".exp", {
    x: -60, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: ".exp-list", start: "top 80%" }
  });

  // Contact title
  gsap.to(".contact-title .word", {
    y: 0, duration: 1.1, stagger: 0.15, ease: "power4.out",
    scrollTrigger: { trigger: ".contact", start: "top 70%" }
  });
  gsap.from(".contact-circle", {
    scale: 0, rotate: -90, duration: 1, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".contact-circle", start: "top 90%" }
  });

  // Footer name rises
  gsap.from(".footer-name", {
    yPercent: 60, opacity: 0, duration: 1.2, ease: "power4.out",
    scrollTrigger: { trigger: ".footer", start: "top 90%" }
  });
}

/* ---------- Cursor + magnetic + project preview ---------- */
function pointerFX() {
  if (!matchMedia("(hover: hover)").matches) return;

  const cursor = document.querySelector(".cursor");
  const preview = document.querySelector(".project-preview");
  const ppInner = preview.querySelector(".pp-inner");
  const xC = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
  const yC = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
  const xP = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  const yP = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
  let lastX = 0;

  window.addEventListener("mousemove", e => {
    xC(e.clientX); yC(e.clientY);
    xP(e.clientX); yP(e.clientY);
    gsap.to(preview, { rotate: gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6), duration: 0.5 });
    lastX = e.clientX;
  });

  document.querySelectorAll("a, button, .skill-list li, .card").forEach(el => {
    if (el.classList.contains("project")) return;
    el.addEventListener("mouseenter", () => cursor.classList.add("grow"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("grow"));
  });

  // Project hover image
  document.querySelectorAll(".project").forEach(p => {
    p.addEventListener("mouseenter", () => {
      cursor.classList.add("view");
      const img = new Image();
      img.onload = () => { ppInner.style.backgroundImage = `url(${p.dataset.img})`; ppInner.textContent = ""; };
      img.onerror = () => {
        ppInner.style.backgroundImage = `linear-gradient(135deg, ${p.dataset.color}, #111)`;
        ppInner.textContent = p.querySelector(".p-title").textContent;
      };
      img.src = p.dataset.img;
      gsap.to(preview, { scale: 1, duration: 0.5, ease: "power3.out" });
    });
    p.addEventListener("mouseleave", () => {
      cursor.classList.remove("view");
      gsap.to(preview, { scale: 0, duration: 0.4, ease: "power3.in" });
    });
  });

  // Magnetic elements
  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }));
  });
}

/* ---------- Nav: solid bar after hero top, hide on scroll down ---------- */
(() => {
  const nav = document.querySelector(".nav");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    if (!document.body.classList.contains("menu-open")) {
      nav.classList.toggle("hidden", y > lastY && y > 300);
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ---------- Theme toggle (saved per visitor, defaults to OS preference) ---------- */
(() => {
  const root = document.documentElement;
  const prefersLight = matchMedia("(prefers-color-scheme: light)");
  const current = () => root.dataset.theme || (prefersLight.matches ? "light" : "dark");

  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const next = current() === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* ---------- Misc ---------- */
document.querySelector(".menu-btn").addEventListener("click", () => document.body.classList.toggle("menu-open"));

function tick() {
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST";
}
tick(); setInterval(tick, 30000);

/* ---------- Boot ---------- */
if (hasGSAP) {
  runLoader();
  scrollAnimations();
  pointerFX();
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

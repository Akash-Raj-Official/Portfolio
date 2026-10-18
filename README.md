# Portfolio — Akash Raj

Personal portfolio of **Akash Raj**, Site Reliability / DevOps Engineer operating production
Kubernetes (Amazon EKS) workloads on AWS.

🌐 **Live:** https://akash-raj-official.github.io/Portfolio/

---

## Features

- **Halftone portrait** — the hero photo is redrawn as a canvas dot pattern that ripples away from the cursor
- **Decode-in text** — labels and links resolve from scrambled characters on load; name and intro blur into focus
- **Morphing dot fields** — 3D particle canvases that change shape (structure, flow, signal / detect, recover, secure) as you switch tabs
- **Live metrics banner** — an animated, Grafana-style chart behind the "Keep it running" section
- **Scroll motion** — progress bar, masked line reveals, staggered fade-ups, count-up numbers, a filling timeline and a nav that hides on scroll
- **Interactive sections** — accordion with a "thinking path", filterable credentials grid, roll-up hover links
- **Light & dark themes** and a **Motion on/off** switch (both remembered; reduced-motion users start with motion off)
- **Smooth scrolling** with Lenis; fully responsive with a full-screen mobile menu

## Pages

| Page | Content |
|---|---|
| `index.html` | Hero, highlights, about, selected work, how I work, impact, credentials & toolbox, journey, contact |
| `work/roadmap-io.html` | Roadmap.io — Next.js + Turso on Vercel, plus an AWS target with Terraform and Docker |
| `work/weather-aggregator.html` | Cloud-Native Weather Aggregator — Spring Boot, caching, Prometheus, Docker, GitHub Actions |

## Tech stack

- HTML, CSS (custom properties for theming), vanilla JavaScript, Canvas 2D
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Fonts: Instrument Serif, DM Sans, JetBrains Mono (Google Fonts)
- Hosted on GitHub Pages (deploys from `main`)

## Project structure

```
index.html        Home page
work/             Project detail pages
styles.css        Design tokens (dark + light), layout and animations
main.js           Portrait, particle fields, reveals, counters, tabs, filters, toggles
assets/           Photo, project screenshots, certification badges, favicon
```

## Run locally

No build step:

```bash
npx serve .
```

## Customising

- **Colours:** edit the tokens at the top of `styles.css` (`:root` for dark, `[data-theme="light"]` for light).
- **Portrait:** replace `assets/profile.jpg` (a dark-background portrait works best for the halftone).
- **Resume:** all resume links point to the Google Drive file; replace that link in the HTML.

## Contact

- Email: [aakashraj.official@gmail.com](mailto:aakashraj.official@gmail.com)
- LinkedIn: [linkedin.com/in/akashrajofficial](https://www.linkedin.com/in/akashrajofficial)
- GitHub: [github.com/Akash-Raj-Official](https://github.com/Akash-Raj-Official)

Design inspired by [Sarthak Sharma's portfolio](https://sarthak-sharma-portfolio-six.vercel.app/); all code, copy and assets here are original to this site.

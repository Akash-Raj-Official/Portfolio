# Portfolio — Akash Raj

Personal portfolio of **Akash Raj**, Site Reliability / DevOps Engineer operating production
Kubernetes (Amazon EKS) workloads on AWS.

🌐 **Live:** https://akash-raj-official.github.io/Portfolio/

---

## Features

- **Light & dark themes** — follows the visitor's system setting, with a toggle in the nav that is remembered per visitor
- **Motion design** — loader with counter, line-by-line hero reveal, scroll-linked text highlight, counters, and a pinned horizontal certifications section (GSAP + ScrollTrigger)
- **Smooth scrolling** with Lenis
- **Interactive details** — custom cursor, magnetic buttons, floating project previews on hover, scroll-reactive marquee
- **Responsive** — full-screen menu on mobile; the nav hides on scroll down and returns on scroll up
- **Accessible motion** — animations are disabled for visitors who prefer reduced motion

## Sections

| Section | Content |
|---|---|
| Hero | Name, role, location, photo, availability |
| About | Summary and key stats (experience, microservices, 99.9% uptime, certifications) |
| Experience | Jio Platforms, Persistent Systems, MBA and B.Tech |
| Projects | [Roadmap.io](https://roadmap-io.vercel.app), [Cloud-Native Weather Aggregator](https://akash-raj-official.github.io/weather-forecasting-aggregator/) |
| Certifications | OCI 2025 DevOps Professional, AWS Cloud Practitioner Essentials, Google Cloud Multi-cloud Practitioner |
| Skills | Kubernetes, AWS, CI/CD, IaC, observability, security, scripting |
| Contact | Email, phone, location, resume, GitHub, LinkedIn |

## Tech stack

- HTML, CSS (custom properties for theming), vanilla JavaScript
- [GSAP 3](https://gsap.com) + ScrollTrigger, [Lenis](https://lenis.darkroom.engineering)
- Fonts: Anton, Inter, Instrument Serif (Google Fonts)
- Hosted on GitHub Pages

## Project structure

```
index.html    Page content
style.css     Styles, theme tokens (dark default + light)
script.js     Animations, cursor, theme toggle, nav behaviour
assets/       Photo, project previews, certification badges
```

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Customising

- **Colours:** edit the tokens at the top of `style.css` (`:root` for dark, `[data-theme="light"]` for light).
- **Resume:** all resume buttons point to the Google Drive file; replace that link in `index.html`.
- **Projects:** copy an `<a class="project">` block in `index.html` and set `data-img` to a preview image in `assets/`.

## Contact

- Email: [aakashraj.official@gmail.com](mailto:aakashraj.official@gmail.com)
- LinkedIn: [linkedin.com/in/akashrajofficial](https://linkedin.com/in/akashrajofficial)
- GitHub: [github.com/Akash-Raj-Official](https://github.com/Akash-Raj-Official)

# vivianvoss.net

Personal website of **Vivian Voss** — Software Developer & System Architect.

## Customer #0

This site is the first production deployment of [CASTD](https://castd.run) — a stackless web server that replaces the traditional web stack with a single ~2 MB binary. No Node.js, no build step, no runtime dependencies.

CASTD bundles HTTP serving, a template language (CAST), SQLite persistence, and Lua extensions into one process. Templates, styles, and scripts are served live — no compilation, no hot-reload middleware, no dev server. You edit a file, you refresh the browser.

## Stack

| Layer | Technology |
|-------|-----------|
| **Server** | CASTD (~2 MB, Rust + Lua + SQLite) |
| **Templates** | CAST — Content & Structure Templating |
| **Styling** | castd.css (OKLCH, @layer, light-dark()) |
| **Reverse Proxy** | Caddy |
| **OS** | FreeBSD |

## What's on the site

- **Blog** — Technical writing on system design, performance, and the Unix way
- **About** — Philosophy, background, and 30 years in software
- **Ecosystem** — The Min2Max product family
- **CPT SIGTERM** — A browser-based arcade game built entirely with CASTD, canvas, and zero dependencies

## What is CASTD?

CASTD is part of [Min2Max](https://min2max.run) — a family of ultralight web tools inspired by the demoscene, where maximum output comes from minimum resources.

Where a typical web project pulls in a framework, a bundler, a CSS preprocessor, and a Node.js runtime, CASTD provides all of it in a single binary:

- **HTTP server** with automatic routing
- **CAST templates** with slots, inheritance, and server-side reactivity
- **SQLite** for persistence — no external database needed
- **Lua extensions** for server-side logic, APIs, and mail
- **castd.css** — a standalone CSS framework with OKLCH colours and native nesting

## Licence

Apache 2.0 — see [LICENSE](LICENSE).

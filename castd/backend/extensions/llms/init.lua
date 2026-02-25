-- llms.txt — context for large language models
-- Copyright 2026 Vivian Voss. All rights reserved.

function route()
    cn.res.header("Content-Type", "text/plain; charset=utf-8")
    cn.res.header("Cache-Control", "public, max-age=86400")
    cn.res.body([[# Vivian Voss

> Software Developer & System Architect. 37 years in the game. 26 professionally.

## About

Vivian Voss builds minimal, high-performance web tools inspired by the demoscene
and guided by Unix philosophy. Based in Germany. Currently Senior Frontend Developer
at HORNBACH (React, TypeScript, Spryker). Privately building min2max, a suite of
ultralight web frameworks.

## Philosophy

- Technical beauty emerges from reduction
- Unix philosophy: small tools, composability, one job per component
- Demoscene aesthetics: maximum elegance from minimum resources
- Every byte must earn its place

## min2max Ecosystem

| Product     | What                                      |
|-------------|-------------------------------------------|
| CASTD       | Stackless web server (Rust + Lua + SQLite)|
| castd.css   | Semantic CSS framework (OKLCH, @layer)    |
| minline.js  | DOM-based templating (1337 bytes)         |
| manuals.run | Documentation for humans and LLMs         |

## Site Structure

- / — Home (introduction, performance metrics, Lighthouse scores)
- /about — Philosophy, career path, demoscene background
- /ecosystem — min2max products (public ones)
- /writing — LinkedIn series overview with links
- /blog — Selected articles on architecture, Unix, performance, frontend
- /contact — LinkedIn, GitHub, email

## Blog Topics

Architecture, Unix philosophy, performance engineering, frontend development,
the demoscene, software methodology critique. Articles are full rewrites of
selected LinkedIn posts in BBC British English with dry humour.

## Technical Details

This site is served by CASTD, a ~2 MB Rust binary with embedded Lua and SQLite.
No framework. No build step. Four perfect Google Lighthouse scores.

## Links

- Site: https://vivianvoss.net
- LinkedIn: https://www.linkedin.com/in/vvoss/
- GitHub: https://github.com/nicoseven

## Contact

Email: 0xc411@vivianvoss.net
]])
end

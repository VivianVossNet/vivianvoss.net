# vivianvoss.net

Personal website of **Vivian Voss** — Software Developer & System Architect.

Built with [CASTD](https://castd.run), an ultralight full-stack web server in Rust.

## Stack

- **Server:** CASTD (~2 MB binary, Rust + Lua + SQLite)
- **Templates:** CAST template language
- **Styling:** castd.css (OKLCH, @layer, light-dark())
- **Reverse Proxy:** Caddy
- **OS:** FreeBSD

## Local Development

```sh
./castd/castd.sh start --bundle vv-website
```

Serves at `http://localhost:1337`. Templates, CSS and JS are live-reloaded — no restart needed.

## Licence

Apache 2.0 — see [LICENSE](LICENSE).

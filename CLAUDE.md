# Persönliche Website — vivianvoss.net

## Essenz

### Wer

**Vivian Voss** — Software Developer & System Architect.
30 Jahre im Game. 26 davon beruflich. Davor Hobby-Unix/Linuxer.

### Philosophie

- "Technical beauty emerges from reduction"
- Unix-Philosophie: kleine Tools, Composability, ein Job pro Komponente
- Demoszene-Ästhetik: maximale Eleganz aus minimalen Ressourcen
- Root-Cause über Symptombehandlung
- Jedes Byte verdient seinen Platz

### Min2Max — Das Ökosystem

Eigenes Unternehmen. Ultraleichte Web-Frameworks, inspiriert von der Demoszene.
Motto: "Maximum Functionality, Minimum Resources"

| Produkt     | Domain       | Größe        | Was                                        |
|-------------|--------------|--------------|--------------------------------------------|
| htm/a       | htma.run     | 4.5 KB       | Server-side Reactivity Framework           |
| ProCM       | procm.run    | ~6 KB CSS    | Semantisches CSS Framework (OKLCH, @layer) |
| minline.js  | minline.run  | 1337 Bytes   | DOM-basiertes Templating                   |
| CASTD       | castd.run    | Minimal      | Stackless Webserver (Rust + Lua + SQLite)  |
| paqmin      | paqmin.run   | Minimal      | Self-verifying signed TAR Packages         |
| manuals.run | manuals.run  | Plattform    | Dokumentation für Mensch und LLM           |
| BEAUNIX     | —            | OS           | Minimales FreeBSD-basiertes Betriebssystem |

### Beruflicher Weg

- 26 Jahre professionelle Softwareentwicklung
- Stationen: MMSAG, BuBe, FENEAS, EDU.CON, eigene Firma (Collecting GmbH), Megaspace, ThinkLink, HORNBACH
- Schwerpunkte: System-Architektur, Performance Engineering, Frontend, Full-Stack
- Aktuell: Senior Frontend Developer bei HORNBACH (React/TypeScript/Spryker)

### Stimme & Ton

- BBC British English mit trockenem Humor
- Technische Substanz, kein Corporate-Fluff
- Demoszene-Referenzen
- Präzise Terminologie (Fetch API, nicht AJAX; modal dialog, nicht "a modal")

### LinkedIn-Präsenz

4.200+ Follower, 184K+ Impressions, 860% Wachstum seit November 2025.

Aktive Serien:
- Technical Beauty (Dienstag) — Elegante Tools feiern
- The Unix Way (Montag) — FreeBSD vs. Linux Lösungen
- Performance-Fresser (Sonntag) — Root-Cause-Analysen
- Stack Patterns (Mittwoch) — Problem → Pattern → Code
- The Invoice (Freitag) — Was du kaufst vs. was du zahlst
- The Copy Cat (Donnerstag) — Blindkopierte Patterns
- Bytes of Art (alle 2 Wochen) — Demoszene als Kulturerbe
- Divide et Impera (alle 2 Wochen) — Kritische Methodenanalyse

### Branding

- Farben: OKLCH-basiert, Accent warm orange/coral, Dark Mode via light-dark()
- Keine Emojis
- Unicode-Symbole: ■ ➤ → ✦ ◆ ▣
- Sprache: 80% Englisch, 20% Deutsch

---

## Lokale Entwicklung

### CASTD starten

```sh
./castd/castd.sh start --bundle vv-website
```

- `--bundle vv-website` ist **zwingend** — ohne den Parameter findet CASTD die Templates nicht (404 auf allen Seiten)
- Die `server.toml` wird für den Bundle-Namen (noch) nicht ausgelesen
- Restart: `./castd/castd.sh stop && ./castd/castd.sh start --bundle vv-website`
- Port: 1337 (default)
- Templates werden live ausgeliefert — kein Neustart nötig bei Template/CSS/JS-Änderungen
- Neustart nötig bei: `server.toml`-Änderungen, Extension-Änderungen

### CASTD Extensions

- Extensions liegen in `castd/backend/extensions/<name>/init.lua`
- Routes werden in `server.toml` unter `[extensions.routes]` gemappt
- `cn.mail.send(to, subject, body)` — SMTP via `[mail]` Config in server.toml

---

## Offene Fragen

- [ ] Zweck: Persönliche Marke, Min2Max Hub, oder Hybrid?
- [ ] Zielgruppe
- [ ] Sprache (EN, DE, beides?)
- [ ] LinkedIn-Content spiegeln oder verlinken?
- [ ] Was darf öffentlich, was nicht? (htm/a-Status, Reed Stack, etc.)
- [ ] Technik: Statisch, eigene Frameworks (htm/a + ProCM + CASTD), Craft CMS?

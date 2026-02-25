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

Aktive Extensions:

| Extension | Route | Funktion |
|-----------|-------|----------|
| `contact_form` | `/contact/send` | Kontaktformular, sendet E-Mail via SMTP |
| `highscores` | `/api/highscores` | Arcade-Leaderboard (GET top 5, POST neuer Score), Token-basierte Name-Ownership |
| `robots` | `/robots.txt` | Crawl-Regeln (GPTBot/ChatGPT geblockt, Google erlaubt, /game + /api geblockt) |
| `sitemap` | `/sitemap.xml` | Alle Seiten + Blog-Artikel mit Priority/Changefreq |
| `llms` | `/llms.txt` | Strukturierter Kontext für LLMs (Person, Philosophie, Ecosystem, Seitenstruktur) |

Extension-Details:

- **robots** (`robots/init.lua`): Statischer Text via `cn.res.body()`, `Content-Type: text/plain`, 24h Cache
- **sitemap** (`sitemap/init.lua`): Lua-Tabelle `pages` mit allen URLs, generiert XML via String-Konkatenation, `Content-Type: application/xml`, 24h Cache
- **llms** (`llms/init.lua`): Markdown-Kontext via `cn.res.body()`, `Content-Type: text/plain`, 24h Cache
- **highscores** (`highscores/init.lua`): GET liefert Top 5 als JSON, POST validiert Name (1-16 Zeichen, A-Z0-9-), Score (positiver Integer), Token-Ownership (cn.crypto.token()), Pruning auf 5 Einträge
- **contact_form** (`contact_form/init.lua`): Parst Formular, sendet via `cn.mail.send()`

---

## Deployment auf primus

### Server-Zugang

- SSH: `ssh primus` (Host: primus.min2max.run)
- Login-User: `prime` (Home: `/home/prime/`)
- Shell: tcsh — kein `2>/dev/null`, kein Bash-Syntax
- Jails auflisten: `jls`

### Jail: vivianvoss_net

- JID: 9 (kann sich ändern, immer per `jls` prüfen)
- IP: 10.0.0.60
- Hostname: web.vivianvoss.net
- Jail-Root: `/rpool/jails/vivianvoss_net/`
- CASTD-Pfad (in Jail): `/usr/local/castd/`
- CASTD-Pfad (vom Host): `/rpool/jails/vivianvoss_net/usr/local/castd/`

### Deployment-Workflow

Der Login-User `prime` hat **keine Schreibrechte** in der Jail. Daher:

1. **Lokal packen** (ohne macOS-Metadaten und xattrs):
   ```sh
   COPYFILE_DISABLE=1 tar --no-xattrs -czf /tmp/vv-deploy.tar.gz workspace/vv-website/ castd/backend/extensions/
   ```

2. **Per scp nach `/tmp/` auf primus kopieren:**
   ```sh
   scp /tmp/vv-deploy.tar.gz primus:/tmp/
   ```

3. **Config-Dateien separat hochladen** (immer komplette Dateien, NIEMALS patchen):
   ```sh
   # z.B. server.toml für Production:
   scp /tmp/vv-server-prod.toml primus:/tmp/
   ```

4. **User die sudo-Befehle geben** zum Entpacken und Platzieren:
   ```sh
   # Auf primus als root:
   cd /rpool/jails/vivianvoss_net/usr/local/castd
   sudo tar xzf /tmp/vv-deploy.tar.gz
   sudo cp /tmp/vv-server-prod.toml /rpool/jails/vivianvoss_net/usr/local/castd/server.toml
   # CASTD stoppen BEVOR Binary ersetzt wird ("Text file busy"):
   jexec vivianvoss_net pkill -f castd-bin
   # Binary ersetzen (falls neues Binary):
   cp /tmp/castd-freebsd-x86_64 /rpool/jails/vivianvoss_net/usr/local/castd/castd-bin
   chmod 755 /rpool/jails/vivianvoss_net/usr/local/castd/castd-bin
   # CASTD neu starten:
   jexec vivianvoss_net daemon -o /var/log/castd.log /bin/sh -c "cd /usr/local/castd && ./castd-bin serve --bundle vv-website -p 1337"
   # Aufräumen:
   rm /tmp/vv-deploy.tar.gz /tmp/vv-server-prod.toml
   ```

**WICHTIG:**
- Claude führt KEINE sudo/root-Befehle auf primus aus
- Claude kopiert nur nach `/tmp/` und gibt dem User die Befehle
- Config-Dateien werden IMMER als komplette, verifizierte Dateien hochgeladen — NIEMALS gepatcht
- Die Production-`server.toml` enthält SMTP-Credentials und wird NICHT im Git-Repo gespeichert

---

## Blog

### Quelle

Blog articles are handpicked from Vivian's LinkedIn posts (series and standalone).
Source directory: `/Users/byvoss/Workbench/Privat/LinkedIn/`

### Tone & Style

- BBC British English with dry humour — debating club mode
- Didactically structured: the reader should arrive at the conclusion feeling genuinely convinced, not lectured
- The reader should smile at least once — wit over snark, understatement over hyperbole
- Include the first LinkedIn comment where it adds value (as a dialogue element)
- Links to original LinkedIn post always present in the article header

### Content Rules

- Each article is a full rewrite in polished British English — not a 1:1 translation of the LinkedIn post
- Preserve the core argument and technical substance, but elevate the prose
- Remove LinkedIn-specific formatting (hashtags, engagement hooks, "What do you think?" closers)
- Add proper semantic HTML: `<article>`, `<blockquote>`, `<code>`, `<h2>` for sections
- Every article must have: title, date, LinkedIn link, category tags, full body text
- Where the argument benefits from visual support, include inline SVG diagrams (architecture comparisons, data flow, performance graphs, stack visualisations). SVGs are embedded directly in the template HTML, not as external files. Keep them minimal, monochrome with accent colour, and matching the site's design language
- Sources are linked inline where the fact appears, not collected in a reference list at the bottom. The blog format allows proper `<a>` links — use them. This replaces the LinkedIn convention of listing URLs in the first comment
- The first LinkedIn comment is included only when it adds a genuinely interesting fact, counterpoint, or data point that enriches the article. It becomes a styled aside or follow-up section, not a separate block

### Category Tags

Each article has one or more tags from a fixed set. Tags are used for filtering on the blog index page.
Tags are defined as `data-tags` attributes on the blog index entries and filtered client-side.

### File Structure

```
templates/blog/
  blog.html                         # /blog (index with tag filter)
  article-slug/
    article-slug.html               # /blog/article-slug (full article)
```

Each article template extends `_base.html` via slots (same pattern as all other pages).

### Daily Workflow

Every new LinkedIn post that becomes a blog article follows this process:

1. Read the LinkedIn source post from `/Users/byvoss/Workbench/Privat/LinkedIn/`
2. Create the article as a full rewrite (not 1:1 translation) in `templates/blog/<slug>/<slug>.html`
3. Add the `{( slot jsonld )}` with Article schema (see existing articles for pattern)
4. Add the entry to `templates/blog/blog.html` (newest first, correct `data-tags`)
5. **Add the URL to `castd/backend/extensions/sitemap/init.lua`** in the `pages` table
6. Commit, deploy to primus, give user the sudo commands
7. **Give the user the full URL** (`https://vivianvoss.net/blog/<slug>`) so they can cross-reference it on LinkedIn

### SEO & Discoverability Checklist

**PFLICHT bei jeder neuen Seite oder neuem Blog-Artikel:**

1. **sitemap.xml** — URL in `castd/backend/extensions/sitemap/init.lua` eintragen
2. **JSON-LD Article** — `{( slot jsonld )}` Block im Artikel-Template (Blog-Artikel)
3. **llms.txt** — Bei neuen Seiten (nicht Blog-Artikeln) den Eintrag in `castd/backend/extensions/llms/init.lua` aktualisieren
4. **robots.txt** — Nur anpassen wenn Seiten explizit geblockt werden sollen

**Dateien:**
- `castd/backend/extensions/robots/init.lua` — Crawl-Regeln
- `castd/backend/extensions/sitemap/init.lua` — Alle URLs
- `castd/backend/extensions/llms/init.lua` — LLM-Kontext
- `workspace/vv-website/templates/_base.html` — JSON-LD Person + WebSite (global)
- Blog-Artikel: `{( slot jsonld )}` für Article Schema

---

## Offene Fragen

- [ ] Zweck: Persönliche Marke, Min2Max Hub, oder Hybrid?
- [ ] Zielgruppe
- [ ] Sprache (EN, DE, beides?)
- [ ] LinkedIn-Content spiegeln oder verlinken?
- [ ] Was darf öffentlich, was nicht? (htm/a-Status, Reed Stack, etc.)
- [ ] Technik: Statisch, eigene Frameworks (htm/a + ProCM + CASTD), Craft CMS?

#!/usr/bin/env python3
"""Baut /series und alle /series/<slug> aus der Serien-Zuordnung neu.

Die Zuordnung liegt im Redaktionsprojekt und ist die einzige Quelle:
    ../LinkedIn/concept/knowledge/serien-zuordnung.json

Der Generator liest sie, holt sich Kurzbeschreibung und Dateigroesse aus den
Artikeln selbst und schreibt 25 Templates plus den Zaehler im Startseiten-Baum.
Er ist idempotent: zweimal laufen aendert nichts.

    python3 tools/build_series.py            # bauen
    python3 tools/build_series.py --check    # nur pruefen, nichts schreiben
"""
import json, re, io, os, sys, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON = os.path.join(ROOT, '..', 'LinkedIn', 'concept', 'knowledge', 'serien-zuordnung.json')
TPL  = os.path.join(ROOT, 'workspace', 'vv-website', 'templates')
CHECK = '--check' in sys.argv

DAYNAME = {'Mon': 'Mondays', 'Tue': 'Tuesdays', 'Wed': 'Wednesdays',
           'Thu': 'Thursdays', 'Fri': 'Fridays', 'Sat': 'Saturdays'}
ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
         'August', 'September', 'October', 'November', 'December']
NOTE_MIN, NOTE_MAX = 45, 110
WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
         'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
         'eighteen', 'nineteen', 'twenty']


def word(n, cap=False):
    """Kleine Zahlen ausgeschrieben, wie es sich im Fliesstext gehoert."""
    w = WORDS[n] if n < len(WORDS) else str(n)
    return w[0].upper() + w[1:] if cap and n < len(WORDS) else w

problems = []


def esc(t, quote=False):
    """Idempotent: erst entschaerfen, dann maskieren. Sonst entstehen &amp;#x27;."""
    return html.escape(html.unescape(t), quote=quote)


def article(slug):
    return os.path.join(TPL, 'blog', slug, slug + '.html')


def size(slug):
    try:
        return '%.0fK' % (os.path.getsize(article(slug)) / 1024)
    except OSError:
        problems.append('Artikel fehlt: %s' % slug)
        return '-'


def note(slug):
    """Erster Satz der meta description, mindestens NOTE_MIN, hoechstens NOTE_MAX."""
    try:
        h = io.open(article(slug), encoding='utf-8').read()
    except OSError:
        return None
    m = re.search(r'<meta name="description" content="(.*?)">', h, re.S)
    if not m:
        problems.append('keine meta description: %s' % slug)
        return None
    t = re.sub(r'\s+', ' ', html.unescape(m.group(1))).strip()
    parts = re.split(r'(?<=[.!?])\s+', t)
    s, i = parts[0], 1
    while len(s) < NOTE_MIN and i < len(parts):
        s, i = s + ' ' + parts[i], i + 1
    if len(s) > NOTE_MAX:
        s = s[:NOTE_MAX].rsplit(' ', 1)[0].rstrip(' ,;:') + '…'
    return s


def row(ico, name, date, sz, desc=None, cls=''):
    d = '<span class="vv-idx-desc">%s</span>' % desc if desc is not None else ''
    return ('        <div class="vv-idx-row%s"><span class="vv-idx-ico">%s</span>'
            '<span class="vv-idx-name">%s</span><span class="vv-idx-date">%s</span>'
            '<span class="vv-idx-size">%s</span>%s</div>' % (cls, ico, name, date, sz, d))


def head(desc=None):
    return row('', 'Name', 'Last modified', 'Size', desc, ' vv-idx-head')


def span(items):
    years = sorted({i['date'][:4] for i in items})
    return years[0] if len(years) == 1 else '%s–%s' % (years[0], years[-1])


def write(path, body):
    if CHECK:
        old = io.open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if old != body:
            problems.append('veraltet: %s' % os.path.relpath(path, ROOT))
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8').write(body)


def build_series_page(s):
    name, slug = esc(s['name']), s['slug']
    desc, sp = esc(s['desc']), span(s['items'])
    rows = [head(), row('[..]', '<a href="/series">Parent Directory</a>', '', '-', None, ' vv-idx-up')]
    for it in sorted(s['items'], key=lambda x: x['date'], reverse=True):
        n = note(it['slug'])
        tail = '<span class="vv-idx-note">%s</span>' % esc(n) if n else ''
        rows.append(row('[TXT]', '<a href="/blog/%s">%s</a>%s' % (it['slug'], esc(it['title']), tail),
                        '%s %s' % (it['date'], s['time']), size(it['slug'])))
    status = 'Running, %s' % DAYNAME[s['day']] if s['running'] else 'Closed'
    n = len(s['items'])
    write(os.path.join(TPL, 'series', slug, slug + '.html'), """{! extends "../../_base.html" | slotlist !}

{( slot title )}%(name)s &#x2014; Series &#x2014; Vivian Voss{( endslot )}

{( slot meta )}
<meta name="description" content="%(descq)s %(n)d dispatches, %(span)s.">
{( endslot )}

{( slot canonical )}/series/%(slug)s{( endslot )}

{( slot og-title )}%(name)s &#x2014; Vivian Voss{( endslot )}

{( slot og-desc )}%(desc)s %(n)d dispatches, %(span)s.{( endslot )}

{( slot content )}
<section class="vv-section" aria-labelledby="series-head">
    <h1 id="series-head">%(name)s</h1>
    <p>%(desc)s</p>

    <div class="vv-idx">
        <p class="vv-idx-path">Index of <span class="vv-idx-sep">/series/</span>%(slug)s</p>
%(rows)s
        <p class="vv-idx-foot">%(n)d dispatches &#x25A0; %(span)s &#x25A0; %(status)s</p>
    </div>
</section>
{( endslot )}
""" % dict(name=name, slug=slug, desc=desc, descq=esc(s['desc'], True), n=n,
           span=sp, status=status, rows='\n'.join(rows)))


def build_index(series):
    run = sorted([s for s in series if s['running']], key=lambda s: ORDER.index(s['day']))
    arc = sorted([s for s in series if not s['running']],
                 key=lambda s: max(i['date'] for i in s['items']), reverse=True)
    rows = [head('Schedule')]
    for s in run + arc:
        rows.append(row('[DIR]',
                        '<a href="/series/%s">%s</a><span class="vv-idx-note">%s</span>'
                        % (s['slug'], esc(s['name']), esc(s['desc'])),
                        max(i['date'] for i in s['items']), str(len(s['items'])),
                        DAYNAME[s['day']] if s['running'] else 'closed'))
    total = sum(len(s['items']) for s in series)
    y, m, _ = min(i['date'] for s in series for i in s['items']).split('-')
    lead = ('Everything here runs in series. %s are live, one for each working day and one for '
            'the weekend; %s are closed and stay readable. %d dispatches in total, the oldest '
            'from %s %s.' % (word(len(run), True), word(len(arc)), total, MONTH[int(m) - 1], y))
    write(os.path.join(TPL, 'series', 'series.html'), """{! extends "../_base.html" | slotlist !}

{( slot title )}Series &#x2014; Vivian Voss{( endslot )}

{( slot meta )}
<meta name="description" content="%(lead)s">
{( endslot )}

{( slot canonical )}/series{( endslot )}

{( slot og-title )}Series &#x2014; Vivian Voss{( endslot )}

{( slot og-desc )}%(lead)s{( endslot )}

{( slot content )}
<section class="vv-section" aria-labelledby="series-head">
    <h1 id="series-head">Series</h1>
    <p>%(lead)s</p>

    <div class="vv-idx vv-idx--wide">
        <p class="vv-idx-path">Index of <span class="vv-idx-sep">/</span>series</p>
%(rows)s
        <p class="vv-idx-foot">%(ns)d series &#x25A0; %(total)d dispatches</p>
    </div>
</section>
{( endslot )}
""" % dict(lead=lead, rows='\n'.join(rows), ns=len(series), total=total))
    return len(series), total, run


def build_home(series, ns, total, run):
    """Zaehler und Wochentagsliste im Terminal-Baum der Startseite nachziehen."""
    p = os.path.join(TPL, 'home', 'home.html')
    h = io.open(p, encoding='utf-8').read()
    new = h
    new = re.sub(r'(<span class="vv-tree-hint">)[^<]*(</span>)',
                 r'\g<1>%d series &#183; %d dispatches\g<2>' % (ns, total), new)
    arc = ns - len(run)
    ys = sorted({i['date'][:4] for s in series for i in s['items']})
    new = re.sub(r'(<a href="/series">archive</a><span class="vv-tdim">\s*)[^<]*(</span>)',
                 lambda m: '%s%d series, %s–%s%s' % (m.group(1), arc, ys[0], ys[-1], m.group(2)), new)
    for s in run:
        new = re.sub(r'(<a href="/series/%s">[^<]*</a><span class="vv-tdim">\s*)[A-Za-z]{3}' % s['slug'],
                     lambda m: m.group(1) + s['day'], new)
    if new == h:
        return False
    if CHECK:
        problems.append('veraltet: templates/home/home.html (Zaehler im Baum)')
        return False
    io.open(p, 'w', encoding='utf-8').write(new)
    return True


def check_routes(series):
    """Jede Serie braucht eine Sitemap-Route, sonst faellt sie aus der Indexierung."""
    p = os.path.join(ROOT, 'castd', 'backend', 'extensions', 'sitemap', 'init.lua')
    lua = io.open(p, encoding='utf-8').read()
    missing = [s['slug'] for s in series if '/series/' + s['slug'] not in lua]
    if '"series"' not in lua and '/series' not in lua:
        missing.append('series (Dach)')
    for m in missing:
        problems.append('Sitemap-Route fehlt: /series/%s' % m)


def main():
    series = json.load(open(JSON, encoding='utf-8'))
    known = {os.path.basename(os.path.dirname(f)) for f in glob.glob(os.path.join(TPL, 'blog', '*', '*.html'))}
    listed = {i['slug'] for s in series for i in s['items']}
    for slug in sorted(known - listed):
        problems.append('Artikel ohne Serie (in serien-zuordnung.json nachtragen): %s' % slug)
    for s in series:
        build_series_page(s)
    ns, total, run = build_index(series)
    home = build_home(series, ns, total, run)
    check_routes(series)
    print('%s %d Reihen, %d Sendungen, %d laufend%s'
          % ('geprueft:' if CHECK else 'gebaut:', ns, total, len(run),
             '' if CHECK else (', Startseite angepasst' if home else ', Startseite unveraendert')))
    for p in problems:
        print('  ! ' + p)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())

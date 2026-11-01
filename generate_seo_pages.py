#!/usr/bin/env python3
"""Programmatic SEO generator for carintel.de.

Generates 50 model pages in typklassen/ and landingpage/typklassen/, rewrites the
hub section in stichtag.html (+ landingpage copy) and writes sitemap.xml/robots.txt.

Design/CSS/footer are taken 1:1 from stichtag.html so the pages never drift.
Run:  python3 generate_seo_pages.py
"""
import html
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE_URL = "https://carintel.de"
TODAY = date.today().isoformat()

# slug, Anzeigename, Segment, Typklasse KH, TK, VK, Beitrag Vollkasko ca. von, bis (EUR/Jahr)
# ACHTUNG: Orientierungswerte (gerundet), KEINE amtlichen GDV-Daten -> vor Veroeffentlichung
# bitte mit der aktuellen GDV-Typklassenliste abgleichen.
MODELS = [
    ("vw-golf-7", "VW Golf 7", "Kompaktklasse", 15, 19, 20, 650, 1100),
    ("vw-golf-8", "VW Golf 8", "Kompaktklasse", 16, 21, 22, 700, 1200),
    ("vw-polo", "VW Polo", "Kleinwagen", 14, 17, 19, 550, 950),
    ("vw-tiguan", "VW Tiguan", "SUV", 17, 21, 24, 750, 1300),
    ("vw-passat", "VW Passat", "Mittelklasse", 16, 20, 22, 700, 1250),
    ("vw-touran", "VW Touran", "Van", 16, 20, 21, 700, 1200),
    ("vw-t-roc", "VW T-Roc", "SUV", 16, 20, 22, 700, 1200),
    ("vw-id3", "VW ID.3", "Elektro", 16, 20, 23, 750, 1350),
    ("bmw-3er", "BMW 3er (F30/G20)", "Mittelklasse", 17, 24, 27, 850, 1500),
    ("bmw-1er", "BMW 1er", "Kompaktklasse", 17, 22, 26, 800, 1400),
    ("bmw-5er", "BMW 5er", "Oberklasse", 18, 25, 28, 950, 1700),
    ("bmw-x1", "BMW X1", "SUV", 17, 22, 26, 800, 1400),
    ("bmw-x3", "BMW X3", "SUV", 18, 24, 28, 900, 1600),
    ("mercedes-c-klasse", "Mercedes C-Klasse (W205/W206)", "Mittelklasse", 17, 24, 27, 900, 1600),
    ("mercedes-a-klasse", "Mercedes A-Klasse", "Kompaktklasse", 16, 22, 26, 800, 1400),
    ("mercedes-e-klasse", "Mercedes E-Klasse", "Oberklasse", 18, 25, 28, 950, 1750),
    ("mercedes-glc", "Mercedes GLC", "SUV", 18, 25, 28, 950, 1700),
    ("audi-a3", "Audi A3", "Kompaktklasse", 16, 21, 25, 750, 1350),
    ("audi-a4", "Audi A4", "Mittelklasse", 17, 23, 26, 850, 1500),
    ("audi-a6", "Audi A6", "Oberklasse", 18, 25, 28, 950, 1700),
    ("audi-q3", "Audi Q3", "SUV", 17, 22, 25, 800, 1400),
    ("audi-q5", "Audi Q5", "SUV", 18, 24, 27, 900, 1600),
    ("opel-corsa", "Opel Corsa", "Kleinwagen", 14, 16, 18, 500, 900),
    ("opel-astra", "Opel Astra", "Kompaktklasse", 15, 18, 20, 600, 1050),
    ("opel-mokka", "Opel Mokka", "SUV", 15, 18, 20, 600, 1050),
    ("opel-insignia", "Opel Insignia", "Mittelklasse", 15, 19, 21, 650, 1150),
    ("ford-fiesta", "Ford Fiesta", "Kleinwagen", 14, 17, 19, 500, 900),
    ("ford-focus", "Ford Focus", "Kompaktklasse", 15, 19, 21, 600, 1100),
    ("ford-kuga", "Ford Kuga", "SUV", 16, 20, 22, 700, 1200),
    ("ford-puma", "Ford Puma", "SUV", 15, 18, 20, 600, 1050),
    ("skoda-octavia", "Skoda Octavia", "Kompaktklasse", 15, 18, 20, 600, 1050),
    ("skoda-fabia", "Skoda Fabia", "Kleinwagen", 13, 15, 17, 480, 850),
    ("skoda-karoq", "Skoda Karoq", "SUV", 15, 19, 21, 650, 1100),
    ("skoda-superb", "Skoda Superb", "Mittelklasse", 15, 19, 21, 650, 1150),
    ("seat-leon", "Seat Leon", "Kompaktklasse", 15, 20, 22, 650, 1150),
    ("seat-ibiza", "Seat Ibiza", "Kleinwagen", 14, 17, 20, 550, 950),
    ("cupra-formentor", "Cupra Formentor", "SUV", 17, 22, 25, 850, 1450),
    ("hyundai-i20", "Hyundai i20", "Kleinwagen", 14, 17, 19, 500, 900),
    ("hyundai-i30", "Hyundai i30", "Kompaktklasse", 15, 18, 20, 600, 1050),
    ("hyundai-tucson", "Hyundai Tucson", "SUV", 16, 19, 22, 700, 1200),
    ("kia-ceed", "Kia Ceed", "Kompaktklasse", 15, 18, 20, 600, 1050),
    ("kia-sportage", "Kia Sportage", "SUV", 16, 20, 22, 700, 1200),
    ("toyota-yaris", "Toyota Yaris", "Kleinwagen", 13, 16, 18, 500, 900),
    ("toyota-corolla", "Toyota Corolla", "Kompaktklasse", 14, 17, 19, 550, 1000),
    ("dacia-sandero", "Dacia Sandero", "Kleinwagen", 13, 15, 17, 450, 800),
    ("dacia-duster", "Dacia Duster", "SUV", 14, 16, 19, 500, 900),
    ("renault-clio", "Renault Clio", "Kleinwagen", 14, 17, 19, 500, 900),
    ("fiat-500", "Fiat 500", "Kleinwagen", 14, 18, 20, 550, 1000),
    ("mazda-cx-5", "Mazda CX-5", "SUV", 15, 19, 21, 650, 1100),
    ("tesla-model-y", "Tesla Model Y", "Elektro", 18, 24, 28, 900, 1700),
]

# Segmentspezifische Textbausteine (verhindert 50x identischen Text)
SEGMENT_TEXT = {
    "Kleinwagen": "Kleinwagen werden oft von Fahranfängern und Pendlern gefahren. Genau diese Gruppe sieht bei der Rechnung selten genau hin – dabei summieren sich schon kleine Erhöhungen pro Jahr spürbar.",
    "Kompaktklasse": "Die Kompaktklasse ist das Rückgrat des deutschen Marktes. Entsprechend viele Unfälle und Reparaturen fließen in die Regionalklassen und Typklassen ein – ein Grund, warum Tarife hier besonders häufig angepasst werden.",
    "Mittelklasse": "Bei Mittelklasse-Modellen und Dienstwagen-Nachfolgern fallen Reparaturen an Assistenzsystemen, Sensorik und Karosserie-Teilen teuer aus. Das schlägt sich zeitverzögert in den Typklassen nieder.",
    "Oberklasse": "Oberklasse-Modelle haben hohe Ersatzteil- und Lackierkosten. Schon eine Typklassen-Verschiebung um eine Stufe kann bei Vollkasko mehrere hundert Euro Unterschied ausmachen.",
    "SUV": "SUV sind beliebt und werden häufiger in Parkremplern und Auffahrunfällen reguliert. Große Felgen, Kameras und Sensoren in Stoßfängern treiben die Reparaturkosten.",
    "Van": "Familien-Vans stehen oft viele Jahre in einer Hand. Genau bei langjährigen Bestandsverträgen lohnt sich der Vergleich, weil Neukunden-Tarife deutlich günstiger sein können.",
    "Elektro": "Bei Elektroautos wirken sich Batterie- und Spezialwerkstattkosten auf die Schadenaufwände aus. Die Typklassen werden deshalb regelmäßig neu bewertet – Bestandskunden zahlen mitunter mehr als Neukunden.",
}

# ------------------------------------------------------------------ helpers
stichtag_src = (ROOT / "stichtag.html").read_text(encoding="utf-8")

CSS = re.search(r"<style>(.*?)</style>", stichtag_src, re.S).group(1)
FOOTER = re.search(r"<footer>.*?</footer>", stichtag_src, re.S).group(0)
FOOTER = (FOOTER.replace('href="index.html"', 'href="../index.html"')
          .replace('href="datenschutz.html"', 'href="../datenschutz.html"')
          .replace('href="impressum.html"', 'href="../impressum.html"'))
CF_SNIPPET = re.search(r"<!-- Cloudflare Web Analytics -->.*?<!-- End Cloudflare Web Analytics -->",
                       stichtag_src, re.S).group(0)
IMPACT = re.search(r'<aside class="impact".*?</aside>', stichtag_src, re.S).group(0)

EXTRA_CSS = """
    .related { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 12px; }
    .related a { display: block; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-darker); font-weight: 600; }
    .related a:hover { border-color: var(--cyan); }
    .info-box p { color: var(--text-muted); margin-top: 10px; }
    .note { font-size: 0.78rem; color: var(--text-muted); margin-top: 10px; }
    .crumbs { font-size: 0.85rem; color: var(--text-muted); padding: 14px 0 0; }
"""

PAGE = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>__NAME__ Kfz-Versicherung 2027 teurer? Typklassen, Stichtag 30.11. &amp; Sonderkündigung</title>
  <meta name="description" content="__NAME__ Versicherung 2027 prüfen: Aktuelle Typklassen-Einstufung, Beitrags-Check zum Stichtag 30.11., § 40 VVG Sonderkündigungs-PDF &amp; bis zu 850 € sparen.">
  <link rel="canonical" href="__URL__">
  <meta property="og:title" content="__NAME__ Kfz-Versicherung 2027: Typklassen-Check &amp; Sonderkündigung">
  <meta property="og:description" content="Typklassen, Stichtag 30.11. und § 40 VVG Sonderkündigung für den __NAME__ – kostenlos prüfen.">
  <meta property="og:url" content="__URL__">
  <meta property="og:type" content="article">
  <script type="application/ld+json">__JSONLD__</script>
  <style>__CSS____EXTRA__</style>
</head>
<body>
  <nav id="top">
    <div class="container nav-container">
      <a href="../index.html" class="nav-brand">🚘 CarIntel <span>Kfz-Stichtag</span></a>
      <a href="../stichtag.html" style="font-weight:700;">Rechner ↗</a>
    </div>
  </nav>

  <main>
    <header class="hero container">
      <div class="countdown" id="countdown-badge">⏳ <span id="countdown-text">Stichtag 30.11.</span></div>
      <h1>__NAME__ Kfz-Versicherung 2027: Typklassen-Check &amp; Sonderkündigung (§ 40 VVG)</h1>
      <p class="subtitle">__SEGMENT_TEXT__</p>

      <section class="card info-box" style="text-align:left; margin-top:1.5rem;" aria-labelledby="tk-title">
        <h2 id="tk-title">📊 Typklassen-Orientierung: __NAME__</h2>
        <div class="result">
          <div class="stat cyan"><div class="k">Haftpflicht</div><div class="v">ca. TK __KH__</div></div>
          <div class="stat cyan"><div class="k">Teilkasko</div><div class="v">ca. TK __TK__</div></div>
          <div class="stat cyan"><div class="k">Vollkasko</div><div class="v">ca. TK __VK__</div></div>
        </div>
        <p>Typischer Vollkasko-Beitrag für den __NAME__ (je nach Alter, SF-Klasse, Region, Selbstbeteiligung): <strong>ca. __LO__–__HI__ € pro Jahr</strong>. Gestiegene Werkstatt- und Ersatzteilkosten fließen in die jährliche Neuberechnung der Typklassen ein – dadurch können Bestandsverträge beim __NAME__ 2026/2027 versteckt teurer werden, auch wenn sich an deinem Fahrverhalten nichts geändert hat.</p>
        <p class="note">Hinweis: Alle Werte sind gerundete Orientierungswerte ohne Gewähr. Maßgeblich ist die aktuelle Einstufung deines Fahrzeugs laut Versicherer bzw. GDV. Beitragsangaben sind unverbindliche Richtwerte.</p>
      </section>

      <div class="cta-wrap" style="max-width:720px; margin-left:auto; margin-right:auto;">
        <a href="#" id="cta-hero" class="btn btn-emerald btn-hero dynamic-versicherungs-link" target="_blank" rel="noopener noreferrer sponsored">🛡️ Jetzt __NAME__ Tarif für 2027 kostenlos berechnen &amp; bis zu 850 € sparen ↗</a>
        <div class="ad-tag">[Partnerlink]</div>
        <p class="micro">✓ 100 % kostenlos &amp; unverbindlich · ✓ Inkl. kostenlosem 1-Klick-Kündigungsservice beim Wechsel · ✓ Fahranfänger- &amp; Familien-Tarife</p>
      </div>
      __IMPACT__
    </header>

    <div class="container">
      <section class="card" aria-labelledby="calc-title">
        <h2 id="calc-title">📄 Kündigung &amp; Beitrags-Check</h2>
        <p class="lead">Beitrag erhöht? Nach § 40 VVG kannst du bei einer Beitragserhöhung innerhalb eines Monats ab Zugang der Mitteilung kündigen – auch nach dem 30.11. Der reguläre Stichtag für die ordentliche Kündigung zum Jahresende ist der 30.11.</p>
        <a href="../stichtag.html" class="btn btn-cyan">📄 Deine __NAME__-Versicherung hat erhöht? Hier im 10-Sekunden-Rechner prüfen &amp; kostenloses § 40 VVG Kündigungs-PDF erstellen ➔</a>
      </section>

      <section class="card" aria-labelledby="more-title">
        <h2 id="more-title">🚗 Weitere beliebte Modelle</h2>
        <div class="related">
__RELATED__
        </div>
        <div class="related" style="margin-top:8px;">
          <a href="../stichtag.html">⏳ Zum Stichtags-Rechner &amp; PDF-Generator</a>
          <a href="../index.html">🏠 CarIntel Startseite</a>
        </div>
      </section>
    </div>
  </main>

  __FOOTER__

  <script src="../config.js"></script>
  <script>
    (function () {
      'use strict';
      var FALLBACK_VERS = 'https://a.partner-versicherung.de/click.php?partner_id=204798&ad_id=15&deep=kfz-versicherung';
      var aff = (window.CARINTEL_CONFIG && window.CARINTEL_CONFIG.AFFILIATE) || {};
      var url = aff.TARIFCHECK_VERSICHERUNG_URL || FALLBACK_VERS;
      document.querySelectorAll('.dynamic-versicherungs-link').forEach(function (a) { a.href = url; });

      var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var stichtag = new Date(today.getFullYear(), 10, 30);
      var d = Math.round((stichtag - today) / 86400000);
      var el = document.getElementById('countdown-text');
      var tail = ' · bei Erhöhung auch im Dezember (§ 40 VVG)';
      if (d > 1) el.innerHTML = 'Noch <strong>' + d + ' Tage</strong> bis zum Stichtag 30.11.' + tail;
      else if (d === 1) el.innerHTML = '<strong>Morgen</strong> ist Stichtag 30.11.!' + tail;
      else if (d === 0) el.innerHTML = '<strong>HEUTE</strong> ist Stichtag 30.11.!' + tail;
      else el.innerHTML = 'Stichtag 30.11. vorbei – <strong>Sonderkündigung nach § 40 VVG</strong> noch 1 Monat ab Rechnungserhalt möglich';
    })();
  </script>
  __CF__
</body>
</html>
"""


def esc(s):
    return html.escape(s, quote=True)


def build_page(i, m):
    slug, name, segment, kh, tk, vk, lo, hi = m
    url = f"{BASE_URL}/typklassen/kfz-versicherung-{slug}.html"
    # 12 verwandte Modelle: Nachbarn in der Liste (rotierend), ohne sich selbst
    related = [MODELS[(i + k) % len(MODELS)] for k in range(1, 13)]
    rel_html = "\n".join(
        f'          <a href="kfz-versicherung-{r[0]}.html">{esc(r[1])} Versicherung</a>' for r in related)
    jsonld = ('{"@context":"https://schema.org","@type":"Article",'
              f'"headline":"{esc(name)} Kfz-Versicherung 2027: Typklassen-Check & Sonderkündigung",'
              f'"url":"{url}","dateModified":"{TODAY}","inLanguage":"de",'
              '"publisher":{"@type":"Organization","name":"CarIntel","url":"https://carintel.de"}}')
    out = PAGE
    for key, val in {
        "__NAME__": esc(name), "__URL__": url, "__JSONLD__": jsonld, "__CSS__": CSS,
        "__EXTRA__": EXTRA_CSS, "__SEGMENT_TEXT__": esc(SEGMENT_TEXT[segment]),
        "__KH__": str(kh), "__TK__": str(tk), "__VK__": str(vk), "__LO__": f"{lo:,}".replace(",", "."),
        "__HI__": f"{hi:,}".replace(",", "."), "__IMPACT__": IMPACT, "__RELATED__": rel_html,
        "__FOOTER__": FOOTER, "__CF__": CF_SNIPPET,
    }.items():
        out = out.replace(key, val)
    return slug, out


def update_hub(path):
    marker_start, marker_end = "<!-- SEO-HUB-START -->", "<!-- SEO-HUB-END -->"
    links = "\n".join(
        f'          <a href="typklassen/kfz-versicherung-{m[0]}.html">{esc(m[1])}</a>' for m in MODELS)
    block = (f'{marker_start}\n'
             '      <details class="card" id="modell-check">\n'
             '        <summary style="cursor:pointer; font-weight:800; font-size:1.05rem; min-height:48px; display:flex; align-items:center;">🚗 Schnell-Check nach Fahrzeugmodell (Top 50 Typklassen 2027)</summary>\n'
             '        <div class="related">\n' + links + '\n        </div>\n'
             '      </details>\n'
             f'      {marker_end}')
    src = path.read_text(encoding="utf-8")
    if marker_start in src:
        src = re.sub(re.escape(marker_start) + r".*?" + re.escape(marker_end), lambda _: block, src, flags=re.S)
    else:
        # vor Ende des Hauptcontainers (nach WhatsApp-Sektion)
        anchor = "    </div>\n  </main>"
        assert anchor in src, "Anker in stichtag.html nicht gefunden"
        src = src.replace(anchor, "      " + block + "\n" + anchor, 1)
    # CSS fuer .related falls fehlt
    if ".related {" not in src:
        src = src.replace("  </style>", EXTRA_CSS + "  </style>", 1)
    path.write_text(src, encoding="utf-8")


def write_sitemap(directory):
    urls = [f"{BASE_URL}/", f"{BASE_URL}/stichtag.html"] + \
           [f"{BASE_URL}/typklassen/kfz-versicherung-{m[0]}.html" for m in MODELS]
    body = "\n".join(
        f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>" for u in urls)
    (directory / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
        encoding="utf-8")
    (directory / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {BASE_URL}/sitemap.xml\n", encoding="utf-8")


def main():
    assert len(MODELS) == 50, len(MODELS)
    for target in (ROOT, ROOT / "landingpage"):
        out_dir = target / "typklassen"
        out_dir.mkdir(exist_ok=True)
        for i, m in enumerate(MODELS):
            slug, content = build_page(i, m)
            (out_dir / f"kfz-versicherung-{slug}.html").write_text(content, encoding="utf-8")
        write_sitemap(target)
    update_hub(ROOT / "stichtag.html")
    # landingpage-Kopie bleibt 1:1 synchron
    (ROOT / "landingpage" / "stichtag.html").write_text(
        (ROOT / "stichtag.html").read_text(encoding="utf-8"), encoding="utf-8")
    print(f"OK: {len(MODELS)} Seiten x 2 Verzeichnisse, sitemap.xml, robots.txt, Hub in stichtag.html")


if __name__ == "__main__":
    main()

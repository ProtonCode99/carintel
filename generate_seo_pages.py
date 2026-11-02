#!/usr/bin/env python3
"""Programmatic SEO generator for carintel.de (Enriched against Thin Content).

Generates 50 model pages in typklassen/ and landingpage/typklassen/, rewrites the
hub section in stichtag.html (+ landingpage copy) and writes sitemap.xml/robots.txt.
"""
import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BASE_URL = "https://carintel.de"
TODAY = date.today().isoformat()

# slug, Anzeigename, Segment, Typklasse KH-Spanne, TK-Spanne, VK-Spanne, Beitrag VK von, bis (EUR/Jahr)
MODELS = [
    ("vw-golf-7", "VW Golf 7", "Kompaktklasse", "14–19", "17–24", "16–24", 650, 1100),
    ("vw-golf-8", "VW Golf 8", "Kompaktklasse", "14–18", "19–24", "18–23", 700, 1200),
    ("vw-polo", "VW Polo", "Kleinwagen", "14–17", "15–22", "16–23", 550, 950),
    ("vw-tiguan", "VW Tiguan", "SUV", "14–17", "19–23", "18–22", 750, 1300),
    ("vw-passat", "VW Passat", "Mittelklasse", "15–18", "19–23", "18–22", 700, 1250),
    ("vw-touran", "VW Touran", "Van", "14–16", "18–20", "17–20", 700, 1200),
    ("vw-t-roc", "VW T-Roc", "SUV", "13–17", "18–23", "17–22", 700, 1200),
    ("vw-id3", "VW ID.3", "Elektro", "14–16", "20–21", "20–22", 750, 1350),
    ("bmw-3er", "BMW 3er (F30/G20)", "Mittelklasse", "16–20", "22–26", "22–26", 850, 1500),
    ("bmw-1er", "BMW 1er", "Kompaktklasse", "15–19", "20–24", "20–24", 800, 1400),
    ("bmw-5er", "BMW 5er", "Oberklasse", "17–20", "24–28", "24–27", 950, 1700),
    ("bmw-x1", "BMW X1", "SUV", "15–18", "20–24", "20–23", 800, 1400),
    ("bmw-x3", "BMW X3", "SUV", "16–19", "23–27", "23–26", 900, 1600),
    ("mercedes-c-klasse", "Mercedes C-Klasse (W205/W206)", "Mittelklasse", "16–20", "22–26", "22–26", 900, 1600),
    ("mercedes-a-klasse", "Mercedes A-Klasse", "Kompaktklasse", "15–19", "20–24", "20–24", 800, 1400),
    ("mercedes-e-klasse", "Mercedes E-Klasse", "Oberklasse", "17–21", "24–28", "24–27", 950, 1750),
    ("mercedes-glc", "Mercedes GLC", "SUV", "17–20", "24–27", "24–27", 950, 1700),
    ("audi-a3", "Audi A3", "Kompaktklasse", "15–19", "19–24", "19–24", 750, 1350),
    ("audi-a4", "Audi A4", "Mittelklasse", "15–19", "21–25", "21–25", 850, 1500),
    ("audi-a6", "Audi A6", "Oberklasse", "17–20", "24–28", "24–27", 950, 1700),
    ("audi-q3", "Audi Q3", "SUV", "14–18", "19–23", "19–23", 800, 1400),
    ("audi-q5", "Audi Q5", "SUV", "16–19", "23–26", "23–26", 900, 1600),
    ("opel-corsa", "Opel Corsa", "Kleinwagen", "14–16", "15–18", "15–18", 500, 900),
    ("opel-astra", "Opel Astra", "Kompaktklasse", "14–17", "17–20", "17–20", 600, 1050),
    ("opel-mokka", "Opel Mokka", "SUV", "14–16", "17–20", "17–20", 600, 1050),
    ("opel-insignia", "Opel Insignia", "Mittelklasse", "15–18", "19–22", "19–22", 650, 1150),
    ("ford-fiesta", "Ford Fiesta", "Kleinwagen", "13–16", "15–19", "15–19", 500, 900),
    ("ford-focus", "Ford Focus", "Kompaktklasse", "14–17", "17–21", "17–21", 600, 1100),
    ("ford-kuga", "Ford Kuga", "SUV", "14–17", "19–23", "19–22", 700, 1200),
    ("ford-puma", "Ford Puma", "SUV", "13–16", "17–21", "17–20", 600, 1050),
    ("skoda-octavia", "Skoda Octavia", "Kompaktklasse", "14–17", "18–22", "17–21", 600, 1050),
    ("skoda-fabia", "Skoda Fabia", "Kleinwagen", "13–15", "15–18", "14–17", 480, 850),
    ("skoda-karoq", "Skoda Karoq", "SUV", "13–16", "18–21", "17–20", 650, 1100),
    ("skoda-superb", "Skoda Superb", "Mittelklasse", "15–18", "20–24", "19–23", 650, 1150),
    ("seat-leon", "Seat Leon", "Kompaktklasse", "15–18", "19–23", "19–23", 650, 1150),
    ("seat-ibiza", "Seat Ibiza", "Kleinwagen", "14–17", "16–20", "16–20", 550, 950),
    ("cupra-formentor", "Cupra Formentor", "SUV", "15–18", "21–25", "21–25", 850, 1450),
    ("hyundai-i20", "Hyundai i20", "Kleinwagen", "14–16", "16–19", "16–19", 500, 900),
    ("hyundai-i30", "Hyundai i30", "Kompaktklasse", "14–17", "18–22", "18–22", 600, 1050),
    ("hyundai-tucson", "Hyundai Tucson", "SUV", "15–17", "20–24", "20–23", 700, 1200),
    ("kia-ceed", "Kia Ceed", "Kompaktklasse", "14–17", "18–21", "18–21", 600, 1050),
    ("kia-sportage", "Kia Sportage", "SUV", "15–17", "20–24", "20–23", 700, 1200),
    ("toyota-yaris", "Toyota Yaris", "Kleinwagen", "13–16", "16–19", "16–19", 500, 900),
    ("toyota-corolla", "Toyota Corolla", "Kompaktklasse", "14–17", "18–21", "18–21", 550, 1000),
    ("dacia-sandero", "Dacia Sandero", "Kleinwagen", "14–16", "15–17", "15–17", 450, 800),
    ("dacia-duster", "Dacia Duster", "SUV", "14–17", "16–19", "16–19", 500, 900),
    ("renault-clio", "Renault Clio", "Kleinwagen", "14–16", "16–19", "16–19", 500, 900),
    ("fiat-500", "Fiat 500", "Kleinwagen", "13–15", "16–19", "16–19", 550, 1000),
    ("mazda-cx-5", "Mazda CX-5", "SUV", "15–18", "21–25", "20–24", 650, 1100),
    ("tesla-model-y", "Tesla Model Y", "Elektro", "19–21", "23–25", "26–28", 900, 1700),
]

SEGMENT_TEXT = {
    "Kleinwagen": "Kleinwagen werden oft von Fahranfängern und Pendlern gefahren. Genau diese Gruppe sieht bei der Rechnung selten genau hin – dabei summieren sich schon kleine Erhöhungen pro Jahr spürbar.",
    "Kompaktklasse": "Die Kompaktklasse ist das Rückgrat des deutschen Marktes. Entsprechend viele Unfälle und Reparaturen fließen in die Regionalklassen und Typklassen ein – ein Grund, warum Tarife hier besonders häufig angepasst werden.",
    "Mittelklasse": "Bei Mittelklasse-Modellen und Dienstwagen-Nachfolgern fallen Reparaturen an Assistenzsystemen, Sensorik und Karosserie-Teilen teuer aus. Das schlägt sich zeitverzögert in den Typklassen nieder.",
    "Oberklasse": "Oberklasse-Modelle haben hohe Ersatzteil- und Lackierkosten. Schon eine Typklassen-Verschiebung um eine Stufe kann bei Vollkasko mehrere hundert Euro Unterschied ausmachen.",
    "SUV": "SUV sind beliebt und werden häufiger in Parkremplern und Auffahrunfällen reguliert. Große Felgen, Kameras und Sensoren in Stoßfängern treiben die Reparaturkosten.",
    "Van": "Familien-Vans stehen oft viele Jahre in einer Hand. Genau bei langjährigen Bestandsverträgen lohnt sich der Vergleich, weil Neukunden-Tarife deutlich günstiger sein können.",
    "Elektro": "Bei Elektroautos wirken sich Batterie- und Spezialwerkstattkosten auf die Schadenaufwände aus. Die Typklassen werden deshalb regelmäßig neu bewertet – Bestandskunden zahlen mitunter mehr als Neukunden.",
}

# Modellspezifische Details (popular_engines, cost_drivers, saving_tip)
MODEL_DETAILS = {
    "vw-golf-7": (
        "1.4 TSI (125 PS): KH 14 / VK 17 · 2.0 TDI (150 PS): KH 17 / VK 20 · 2.0 GTI (220–245 PS): KH 18 / VK 24",
        "Beim VW Golf 7 treiben vor allem Frontschäden mit ACC-Radarsensorik im Kühlergrill sowie optionale LED-Scheinwerfer die Kaskokosten. Zudem weisen die 2.0-TDI-Varianten hohe Jahresfahrleistungen auf, während GTI- und R-Modelle durch überdurchschnittliche Schadenquoten in höheren Vollkasko-Klassen liegen.",
        "Prüfe bei älteren Golf-7-Baujahren (vor 2016), ob eine Umstellung von Vollkasko auf Teilkasko oder eine Werkstattbindung (ca. 15–20 % Rabatt) sinnvoll ist."
    ),
    "vw-golf-8": (
        "1.5 TSI (130–150 PS): KH 14 / VK 18 · 2.0 TDI (150 PS): KH 17 / VK 21 · GTI / GTE: KH 17–18 / VK 23",
        "Der Golf 8 verfügt serienmäßig über vernetzte Frontsensorik, Spurhalte-Kameras in der Windschutzscheibe und oft über teure IQ.Light-Matrix-LED-Scheinwerfer. Schon ein leichter Wild- oder Auffahrschaden erfordert aufwendige Kalibrierungen in der Fachwerkstatt.",
        "Ein Tarif mit Kasko-Werkstattbindung und erhöhter Selbstbeteiligung (300 € VK / 150 € TK) senkt die Prämie beim Golf 8 meist um über 200 € im Jahr."
    ),
    "vw-polo": (
        "1.0 MPI / 1.0 TSI (80–95 PS): KH 15 / VK 16 · 2.0 GTI (200–207 PS): KH 17 / VK 23",
        "Da der VW Polo häufig als Erstfahrzeug oder Zweitwagen im Stadtverkehr genutzt wird, fließt eine höhere Quote an Park- und Auffahrschäden in die Haftpflicht-Statistik ein.",
        "Werden junge Fahrer unter 23 Jahren mitversichert, bringen Telematik-Bausteine beim Polo bis zu 30 % Nachlass."
    ),
    "vw-tiguan": (
        "1.5 TSI (150 PS): KH 14 / VK 18 · 2.0 TDI 4Motion (190–200 PS): KH 16 / VK 21",
        "Beim Bestseller-SUV Tiguan sorgen lackierte Stoßfänger mit Park- und Radarsensorik, 360-Grad-Kameras sowie teure Matrix-Scheinwerfer für hohe Kasko-Regulierungen.",
        "Langjährige Tiguan-Halter in alten Bestandsverträgen sparen durch den Wechsel in aktuelle Neukunden-Tarife oft 250 bis 450 € jährlich."
    ),
    "vw-passat": (
        "2.0 TDI Variant (150 PS): KH 17 / VK 20 · 1.5 TSI (150 PS): KH 15 / VK 18",
        "Als klassischer Langstrecken- und Außendienst-Kombi legt der VW Passat überdurchschnittlich viele Autobahnkilometer zurück. Das erhöht das Risiko für Steinschläge in Kamerascheiben und teure Frontschäden.",
        "Achte beim Tarifvergleich auf eine genaue Angabe deiner tatsächlichen Jahresfahrleistung – wer im Homeoffice weniger fährt, wird sofort günstiger eingestuft."
    ),
    "bmw-3er": (
        "318i / 320i (156–184 PS): KH 16 / VK 22 · 320d Touring (190 PS): KH 18 / VK 24 · 330i / M340i: KH 19 / VK 26",
        "Beim BMW 3er (F30/G20) schlagen hohe Marken-Stundensätze, Laserlicht-/Matrix-LED-Scheinwerfer und die komplexe Vorderachskonstruktion bei Kaskoschäden stark zu Buche. Zudem sind Navigationssysteme und M-Sportlenkräder bei Aufbrüchen gefragt.",
        "Wegen der hohen Vollkasko-Einstufung der Diesel-Modelle (320d/330d) lohnt sich der jährliche Stichtags-Vergleich beim 3er besonders stark."
    ),
    "mercedes-c-klasse": (
        "C 180 / C 200 (Benzin): KH 17 / VK 23 · C 220 d T-Modell (194–200 PS): KH 19 / VK 25",
        "Digital Light / Multibeam-LED, Distronic-Radardome im Stern und hohe Mercedes-Originalteilepreise treiben die Vollkasko-Klassen der Baureihen W205 und W206 nach oben.",
        "Durch Kombination aus Garagenrabatt, jährlicher Zahlweise und Werkstattbindung lässt sich die hohe VK-Klasse der C-Klasse spürbar abfedern."
    ),
    "audi-a4": (
        "35 TFSI / 40 TFSI: KH 15 / VK 21 · 2.0 TDI / 40 TDI Avant (190–204 PS): KH 17 / VK 23",
        "Beim Audi A4 Avant führen hohe Laufleistungen der TDI-Modelle sowie kostenintensive Reparaturen an Matrix-LED-Einheiten und S-tronic-Komponenten zu gehobenen Kasko-Typklassen.",
        "Prüfe im Rechner Tarife mit freier Kilometerstaffelung und vergleiche den Einschluss von Rabattschutz nur, wenn deine SF-Klasse bereits sehr hoch ist."
    ),
    "opel-corsa": (
        "1.2 (75–100 PS): KH 15 / VK 16 · Corsa-e (136 PS): KH 14 / VK 18",
        "Der Opel Corsa ist in den Typklassen moderat eingestuft, wird aber durch gestiegene Lackier- und Blechteilepreise bei typischen innerstädtischen Parkremplern in Bestandsverträgen oft schrittweise verteuert.",
        "Für Fahranfänger lohnt sich die Versicherung als Zweitwagen über die Eltern mit SF-Klassen-Übernahme oder ein Telematik-Tarif."
    ),
    "skoda-octavia": (
        "1.5 TSI Combi (150 PS): KH 14 / VK 17 · 2.0 TDI Combi (150 PS): KH 15 / VK 19 · RS: KH 17 / VK 22",
        "Obwohl der Skoda Octavia günstigere Typklassen als viele Premium-Konkurrenten aufweist, steigen die Kaskokosten durch identische MQB-Konzern-Sensorik (Frontradar, Kamera-Windschutzscheiben) spürbar an.",
        "Vielfahrer im 2.0 TDI sollten jährlich prüfen, ob ein Tarifwechsel den schleichenden Beitragsanstieg im Bestandsvertrag ausgleicht."
    ),
    "tesla-model-y": (
        "Rear-Wheel Drive (SR): KH 19 / VK 26 · Long Range AWD / Performance: KH 20–21 / VK 27–28",
        "Beim Tesla Model Y führen die Gigacasting-Karosseriebauweise, hohe Spezialwerkstatt-Stundensätze, die hohe Motorleistung und die Schutzanforderungen rund um das Hochvolt-Akkupaket zu sehr hohen Vollkasko-Typklassen.",
        "Achte beim Wechsel zwingend auf einen speziellen E-Auto-Tarif mit Allgefahrendeckung für den Akku (inkl. Folgeschäden durch Tierbiss/Kurzschluss)."
    ),
}

DEFAULT_DETAIL_BY_SEGMENT = {
    "Kleinwagen": (
        "Basis-Benziner (70–95 PS): niedrige KH/VK · Top-Motorisierung / Turbo (ab 110 PS): +2 bis +4 Stufen in VK",
        "Auch bei kompakten Fahrzeugen sind moderne Frontkameras, LED-Scheinwerfer und Parksensoren heute Standard. Steigende Ersatzteilpreise und Lackierstundensätze führen dazu, dass Versicherer bestehende Verträge zum Jahreswechsel oft deutlich anheben.",
        "Ein jährlicher Tarifvergleich sowie die Nutzung von Telematik- oder Werkstattbindungs-Tarifen senkt die Prämie oft um 20 bis 30 %."
    ),
    "Kompaktklasse": (
        "Volumen-Benziner (110–150 PS): mittlere Einstufung · Diesel & Sportvarianten: +2 bis +5 Stufen in KH/VK",
        "In der Kompaktklasse treiben vernetzte Assistenzsysteme (Frontradar im Stoßfänger, Kameras in der Frontscheibe) und teure LED-Lichtsysteme die Reparaturkosten nach Auffahr- und Glasschäden massiv nach oben.",
        "Durch eine Selbstbeteiligung von 300 € (Vollkasko) / 150 € (Teilkasko) und Werkstattbindung lässt sich der Beitrag sofort deutlich reduzieren."
    ),
    "Mittelklasse": (
        "Benziner (150–190 PS): moderate Kasko · Langstrecken-Diesel & Allrad: höhere KH- und VK-Stufen",
        "Hohe Jahresfahrleistungen, teure Marken-Werkstattstundensätze und komplexe Assistenzsensorik führen in der Mittelklasse zu hohen durchschnittlichen Schadenaufwänden in der Vollkasko.",
        "Bestandskunden zahlen nach 2–3 Jahren oft einen erheblichen Treue-Aufschlag – der Wechsel in einen aktuellen Neukundentarif spart hier meist mehrere hundert Euro."
    ),
    "Oberklasse": (
        "Standard-Motorisierungen: gehobene VK-Klassen · 6-Zylinder / Performance-Modelle: Spitzenklassen in TK/VK",
        "In der Oberklasse sorgen Aluminium-/Verbundkarosserien, Matrix-/Laser-Scheinwerfer, Luftfahrwerke und ein erhöhtes Diebstahlrisiko bei Keyless-Systemen für sehr hohe Kasko-Einstufungen.",
        "Vergleiche gezielt Tarife mit erweiterten Neupreis-/Kaufpreisentschädigungen und prüfe den Nachlass durch abschließbare Einzelgaragen."
    ),
    "SUV": (
        "Frontantrieb-Benziner (130–150 PS): günstige Basis · Allrad-Diesel & Plug-in-Hybrid: höhere VK-Stufen",
        "Bei SUVs liegen teure Radarsensoren, Kameras und großflächige LED-Einheiten direkt im Aufprallbereich. Zudem erhöhen Keyless-Go-Diebstähle und teure Karosserieteile die Teil- und Vollkasko-Klassen.",
        "Prüfe im Tarifvergleich die Kombination aus Werkstattbindung und präziser Angabe deiner Jahreskilometer, um bis zu 400 € pro Jahr zu sparen."
    ),
    "Van": (
        "Benziner (110–150 PS): familienfreundliche Einstufung · 2.0 Diesel: leicht erhöhte Haftpflicht",
        "Familien-Vans verzeichnen zwar moderate Unfallquoten, doch Schiebetür-Mechaniken, große Glasflächen und moderne Frontsensorik haben die Reparaturkosten in den letzten zwei Jahren stark verteuert.",
        "Da Vans oft viele Jahre gehalten werden, schleichen sich in alte Verträge hohe Preissteigerungen ein – ein Wechsel zum Stichtag lohnt sich fast immer."
    ),
    "Elektro": (
        "Basis-Heck-/Frontantrieb: mittlere VK · Dual-Motor / Performance: hohe Vollkasko-Einstufung",
        "Bei Elektrofahrzeugen führen hohe Drehmomente, aufwendige Hochvolt-Schutzmaßnahmen in Spezialwerkstätten und teure Karosserie-/Batterie-Prüfungen nach Unfällen zu spürbar steigenden Vollkasko-Klassen.",
        "Wähle im Vergleich unbedingt einen Tarif mit expliziter Hochvolt-Akku-Abdeckung (Allgefahrendeckung) und vergleiche die stark abweichenden E-Auto-Rabatte der Versicherer."
    ),
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
    .engine-pill { margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25); font-size: 0.88rem; color: var(--text-main); }
    .faq-list details { border-bottom: 1px solid var(--border-color); padding: 12px 0; }
    .faq-list summary { cursor: pointer; font-weight: 700; color: var(--text-main); }
    .faq-list p { margin-top: 8px; color: var(--text-muted); font-size: 0.92rem; }
"""

PAGE = """<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>__NAME__ Kfz-Versicherung 2027 teurer? Typklassen, Stichtag 30.11. &amp; Sonderkündigung</title>
  <meta name="description" content="__NAME__ Versicherung 2027 prüfen: Aktuelle Typklassen-Bandbreite, Kostentreiber, Beitrags-Check zum Stichtag 30.11., § 40 VVG Sonderkündigungs-PDF &amp; bis zu 850 € sparen.">
  <link rel="canonical" href="__URL__">
  <meta property="og:title" content="__NAME__ Kfz-Versicherung 2027: Typklassen-Check &amp; Sonderkündigung">
  <meta property="og:description" content="Typklassen-Spanne, Stichtag 30.11. und § 40 VVG Sonderkündigung für den __NAME__ – kostenlos prüfen.">
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
        <h2 id="tk-title">📊 Typklassen-Bandbreite: __NAME__</h2>
        <div class="result">
          <div class="stat cyan"><div class="k">Haftpflicht (KH)</div><div class="v">TK __KH__</div></div>
          <div class="stat cyan"><div class="k">Teilkasko (TK)</div><div class="v">TK __TK__</div></div>
          <div class="stat cyan"><div class="k">Vollkasko (VK)</div><div class="v">TK __VK__</div></div>
        </div>
        <div class="engine-pill"><strong>Beliebte Motorisierungen &amp; Tendenz:</strong> __ENGINES__</div>
        <p>Typischer Vollkasko-Beitrag für den __NAME__ (je nach Alter, SF-Klasse, Region, Selbstbeteiligung): <strong>ca. __LO__–__HI__ € pro Jahr</strong>.</p>
        <p class="note">Hinweis: Typische Baureihen-Bandbreite je nach Motorisierung &amp; Baujahr (HSN/TSN) ohne Gewähr. Deine exakte Einstufung wird im kostenlosen Tarifvergleich direkt anhand deiner Fahrzeugdaten oder HSN/TSN ermittelt.</p>
      </section>

      <div class="cta-wrap" style="max-width:720px; margin-left:auto; margin-right:auto;">
        <a href="#" id="cta-hero" class="btn btn-emerald btn-hero dynamic-versicherungs-link" target="_blank" rel="noopener noreferrer sponsored">🛡️ Jetzt __NAME__ Tarif für 2027 kostenlos berechnen &amp; bis zu 850 € sparen ↗</a>
        <div class="ad-tag">[Partnerlink]</div>
        <p class="micro">✓ 100 % kostenlos &amp; unverbindlich · ✓ Inkl. kostenlosem 1-Klick-Kündigungsservice beim Wechsel · ✓ Fahranfänger- &amp; Familien-Tarife</p>
      </div>
      __IMPACT__
    </header>

    <div class="container">
      <section class="card" aria-labelledby="why-title">
        <h2 id="why-title">🔍 Warum wird der __NAME__ 2026/2027 in der Versicherung teurer?</h2>
        <p class="lead">__COST_DRIVERS__</p>
        <p style="margin-top:12px;"><strong>💡 Konkreter Spar-Hebel für den __NAME__:</strong> __SAVING_TIP__</p>
      </section>

      <section class="card" aria-labelledby="calc-title">
        <h2 id="calc-title">📄 Kündigung &amp; Beitrags-Check (§ 40 VVG)</h2>
        <p class="lead">Beitrag erhöht? Nach § 40 VVG kannst du bei einer Beitragserhöhung innerhalb eines Monats ab Zugang der Mitteilung kündigen – auch nach dem 30.11. Der reguläre Stichtag für die ordentliche Kündigung zum Jahresende ist der 30.11.</p>
        <a href="../stichtag.html" class="btn btn-cyan">📄 Deine __NAME__-Versicherung hat erhöht? Hier im 10-Sekunden-Rechner prüfen &amp; kostenloses § 40 VVG Kündigungs-PDF erstellen ➔</a>
      </section>

      <section class="card faq-list" aria-labelledby="faq-title">
        <h2 id="faq-title">❓ Häufige Fragen zur __NAME__ Kfz-Versicherung</h2>
        <details open>
          <summary>Welche Typklasse hat der __NAME__ in Haftpflicht und Vollkasko?</summary>
          <p>Je nach Motorisierung, Leistung und Baujahr bewegt sich der __NAME__ typischerweise im Bereich Haftpflicht (KH) __KH__, Teilkasko (TK) __TK__ und Vollkasko (VK) __VK__. Die exakte Einstufung für deine Schlüsselnummer (HSN/TSN) wird im Tarifvergleich automatisch hinterlegt.</p>
        </details>
        <details>
          <summary>Bis wann kann ich meine __NAME__ Versicherung kündigen?</summary>
          <p>Der reguläre Stichtag zur ordentlichen Kündigung ist der 30. November. Erhöht dein Versicherer den Beitrag (auch versteckt bei gestiegener SF-Klasse), hast du nach § 40 VVG ein Sonderkündigungsrecht von einem Monat ab Erhalt der Beitragsrechnung – auch im Dezember.</p>
        </details>
        <details>
          <summary>Wie spare ich beim __NAME__ am meisten Versicherungsbeitrag?</summary>
          <p>__SAVING_TIP__</p>
        </details>
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
    engines, cost_drivers, saving_tip = MODEL_DETAILS.get(slug, DEFAULT_DETAIL_BY_SEGMENT[segment])
    related = [MODELS[(i + k) % len(MODELS)] for k in range(1, 13)]
    rel_html = "\n".join(
        f'          <a href="kfz-versicherung-{r[0]}.html">{esc(r[1])} Versicherung</a>' for r in related)

    graph = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": f"{name} Kfz-Versicherung 2027: Typklassen-Check & Sonderkündigung",
                "url": url,
                "dateModified": TODAY,
                "inLanguage": "de",
                "publisher": {"@type": "Organization", "name": "CarIntel", "url": "https://carintel.de"}
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f"Welche Typklasse hat der {name} in Haftpflicht und Vollkasko?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f"Je nach Motorisierung und Baujahr liegt der {name} typischerweise im Bereich Haftpflicht {kh}, Teilkasko {tk} und Vollkasko {vk}. Die exakte Einstufung per HSN/TSN erfolgt direkt im Tarifvergleich."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"Bis wann kann ich meine {name} Versicherung kündigen?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ordentlich bis zum 30.11. Bei einer Beitragserhöhung besteht nach § 40 VVG ein Sonderkündigungsrecht von 1 Monat ab Zugang der Rechnung – auch im Dezember."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"Wie spare ich beim {name} am meisten Versicherungsbeitrag?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": saving_tip
                        }
                    }
                ]
            }
        ]
    }
    jsonld = json.dumps(graph, ensure_ascii=False)

    out = PAGE
    for key, val in {
        "__NAME__": esc(name), "__URL__": url, "__JSONLD__": jsonld, "__CSS__": CSS,
        "__EXTRA__": EXTRA_CSS, "__SEGMENT_TEXT__": esc(SEGMENT_TEXT[segment]),
        "__KH__": esc(str(kh)), "__TK__": esc(str(tk)), "__VK__": esc(str(vk)),
        "__ENGINES__": esc(engines), "__COST_DRIVERS__": esc(cost_drivers), "__SAVING_TIP__": esc(saving_tip),
        "__LO__": f"{lo:,}".replace(",", "."), "__HI__": f"{hi:,}".replace(",", "."),
        "__IMPACT__": IMPACT, "__RELATED__": rel_html, "__FOOTER__": FOOTER, "__CF__": CF_SNIPPET,
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
        anchor = "    </div>\n  </main>"
        assert anchor in src, "Anker in stichtag.html nicht gefunden"
        src = src.replace(anchor, "      " + block + "\n" + anchor, 1)
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
    (ROOT / "landingpage" / "stichtag.html").write_text(
        (ROOT / "stichtag.html").read_text(encoding="utf-8"), encoding="utf-8")
    print(f"OK: {len(MODELS)} Seiten x 2 Verzeichnisse inkl. Kostentreibern & FAQPage-Schema erstellt!")


if __name__ == "__main__":
    main()

# CarIntel – Gebrauchtwagen-Vergleich & Inserate-Radar
> Plattformübergreifender Echtzeit-Vergleich von Gebrauchtwagen-Inseraten (mobile.de & AutoScout24) mit integriertem Mängel-Radar, Ausstattungs-Matrix und lokalem PDF-Export.

---

## 1. Systemarchitektur & Leitprinzipien
* **Manifest V3:** Vollständige Konformität mit modernen Chrome-Erweiterungsstandards ohne Ausführung externen Remote-Codes (`eval()`, dynamische CDN-Skripte verboten).
* **Local-First & Zero-Server:** Alle Daten werden ausschließlich im lokalen Browserspeicher (`chrome.storage.local`) gehalten. Es existiert kein Tracking, kein Login und kein Backend-Server.
* **Datensparsamkeit:** Die Erweiterung greift ausschließlich auf Inseratsseiten von `mobile.de` und `autoscout24.de` zu, liest strukturierte Metadaten (JSON-LD & DOM) aus und verarbeitet diese lokal.

---

## 2. Kernfunktionen
* **Plattformübergreifende Extraktion:** Automatisches Parsen von Marke, Modell, Preis, Erstzulassung, Kilometerstand, Leistung, Kraftstoff und Ausstattungslisten.
* **Ausstattungs-Matrix:** Horizontale Gegenüberstellung identifizierter Fahrzeuge. Gleiche Ausstattungsmerkmale lassen sich per Toggle ausblenden, um Abweichungen sofort zu isolieren.
* **Mängel- & Klausel-Radar:** Heuristische Keyword-Erkennung zur Warnung vor problematischen Vertragsklauseln (z. B. „Kundenauftrag“, „Export bevorzugt“, „Bastlerfahrzeug“, „Hagelschaden“).
* **PDF-Probefahrt-Dossier:** Client-seitige Generierung einer druckfertigen Checkliste für Besichtigungen und Preisverhandlungen vor Ort.
* **Partner-Integration (carVertical):** Automatisierte Übergabe der Fahrzeug-Identifikationsnummer (FIN/VIN) an verifizierte Fahrzeughistorien-Prüfungen.

---

## 3. Repository-Struktur
```text
carintel/
├── manifest.json        # Erweiterungs-Konfiguration (MV3)
├── background.js        # Service Worker für Tab-Events & Lifecycle
├── content/
│   ├── mobile_scraper.js    # DOM/JSON-LD Extractor für mobile.de
│   └── autoscout_scraper.js # DOM/JSON-LD Extractor für AutoScout24
├── popup/
│   ├── popup.html       # Schnellauswahl & Status-Dashboard
│   ├── popup.js         # Event-Handler & Storage-Bindings
│   └── popup.css        # Dark-Mode Styling
├── compare/
│   ├── compare.html     # Haupt-Vergleichsmatrix & Filter
│   ├── compare.js       # Matrix-Logik, Diff-Filter & PDF-Generator
│   └── compare.css      # Tabellen- und Matrix-Layout
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png      # Offizielles Chrome Store Icon
└── landingpage/
    ├── index.html       # Offizielle Landingpage (GitHub Pages)
    ├── datenschutz.html # DSGVO-konforme Datenschutzerklärung
    ├── impressum.html   # Impressum gemäß § 5 DDG
    └── screenshot_store.png # 1280x800 Dashboard-Vorschau
```

## 4. Lokale Entwicklung & Testing
1. Repository klonen oder im Entwicklungsordner öffnen:
   ```bash
   git clone https://github.com/ProtonCode99/carintel.git
   cd carintel
   ```
2. Chrome öffnen und zu `chrome://extensions/` navigieren.
3. Den Schalter „Entwicklermodus“ (Developer Mode) oben rechts aktivieren.
4. Auf „Entpackte Erweiterung laden“ klicken und das Projektverzeichnis auswählen.
5. Nach Codeänderungen genügt ein Klick auf das Aktualisieren-Symbol der Erweiterungskarte.

## 5. Release- & Store-Packaging
Ein produktionsreifes ZIP-Archiv für das Chrome Developer Dashboard wird ohne unnötige Artefakte (Landingpage, Git-Metadaten, Quell-Screenshots) generiert:
```bash
zip -r carintel-inspector-v1.0.0.zip . \
  -x "landingpage/*" \
  -x ".git/*" \
  -x "*.DS_Store" \
  -x "*.tar.gz"
```

## 6. Live-URLs & Deployment
* **Landingpage:** https://protoncode99.github.io/carintel/
* **Datenschutz:** https://protoncode99.github.io/carintel/datenschutz.html
* **Impressum:** https://protoncode99.github.io/carintel/impressum.html
* **Hosting:** GitHub Pages via Branch `main` (Enforce HTTPS aktiviert).

---

**Nächste Projektschritte**
* **README im Repository committen:** Lege die obige Datei direkt als `README.md` im Hauptverzeichnis des GitHub-Repositorys ab, damit dein Code-Auftritt vollständig dokumentiert ist.
* **V1.0.1 Vorbereitung (Affiliate-Hook):** Bereite in `compare.js` die URL-Konstruktionsfunktion so vor, dass die `carVertical`-Partner-ID als Konstante hinterlegt ist. Sobald die Bestätigung per E-Mail eintrifft, muss dort nur der finale Tracking-Token eingesetzt werden.
* **Store-Review monitoren:** Das Dashboard auf Statusänderungen von *„Wird überprüft“* auf *„Veröffentlicht“* prüfen.

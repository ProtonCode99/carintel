const fs = require('fs');

const file = 'landingpage/index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace CSS
const oldCssStart = `    /* Mockup UI */`;
const oldCssEnd = `    /* Features Grid */`;

const cssToReplace = content.substring(content.indexOf(oldCssStart), content.indexOf(oldCssEnd));

const newCss = `    /* Compare Table UI */
    .showcase {
      padding: 2rem 0 6rem;
    }
    
    .table-container {
      width: 100%;
      overflow-x: auto;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(79, 70, 229, 0.15);
    }
    
    .compare-table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      text-align: left;
    }
    
    .compare-table th, .compare-table td {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      vertical-align: top;
    }
    
    .compare-table th:last-child, .compare-table td:last-child {
      border-right: none;
    }
    
    .compare-table tr:last-child th, .compare-table tr:last-child td {
      border-bottom: none;
    }

    .compare-table thead th {
      background: var(--bg-darker);
      position: sticky;
      top: 0;
      z-index: 10;
      text-align: center;
    }
    
    .compare-table tbody th {
      background: var(--bg-dark);
      width: 200px;
      color: var(--text-muted);
      font-weight: 600;
    }
    
    .car-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .car-title {
      font-size: 1.125rem;
      color: var(--text-main);
      font-weight: 700;
    }

    .badge-wrap {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .badge-green {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .badge-yellow {
      background: rgba(234, 179, 8, 0.15);
      color: #fde047;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }
    
    .badge-red {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .action-btn-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
      min-height: auto;
      width: 100%;
    }
    
`;

content = content.replace(cssToReplace, newCss);

// 2. Replace HTML
const oldHtmlStart = `  <!-- Product UI Mockup -->`;
const oldHtmlEnd = `  <!-- Features Grid -->`;

const htmlToReplace = content.substring(content.indexOf(oldHtmlStart), content.indexOf(oldHtmlEnd));

const newHtml = `  <!-- Product UI Mockup -->
  <section id="preview" class="showcase container">
    <div class="table-container">
      <table class="compare-table">
        <thead>
          <tr>
            <th></th>
            <th>
              <div class="car-header">
                <svg viewBox="0 0 24 24" fill="#475569" style="width: 100px; height: 50px;">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
                <div class="car-title">BMW 320d Touring (F31)</div>
              </div>
            </th>
            <th>
              <div class="car-header">
                <svg viewBox="0 0 24 24" fill="#475569" style="width: 100px; height: 50px;">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
                <div class="car-title">Audi A4 Avant 2.0 TDI</div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Kaufpreis & Finanzierung</th>
            <td>
              <div style="font-size: 1.125rem; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">14.800 €</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">ab ca. 195 €/Mt.*</div>
            </td>
            <td>
              <div style="font-size: 1.125rem; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">15.400 €</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">ab ca. 203 €/Mt.*</div>
            </td>
          </tr>
          <tr>
            <th>Marktwert-Einstufung</th>
            <td><div class="badge-wrap badge-green">🟢 Sehr guter Preis (1.200 € unter Marktschnitt)</div></td>
            <td><div class="badge-wrap badge-yellow">🟡 Fairer Preis</div></td>
          </tr>
          <tr>
            <th>Standzeit-Radar</th>
            <td><div style="color: #fca5a5;">68 Tage (Verhandlungsbasis!)</div></td>
            <td><div style="color: #4ade80;">12 Tage (neu inseriert)</div></td>
          </tr>
          <tr>
            <th>Entfernungs-Check</th>
            <td>📍 24 km entfernt</td>
            <td>📍 210 km entfernt</td>
          </tr>
          <tr>
            <th>Kilometer & EZ</th>
            <td>142.000 km<br>EZ 05/2018</td>
            <td>138.000 km<br>EZ 11/2017</td>
          </tr>
          <tr>
            <th>Serienfehler-Heuristik</th>
            <td><div class="badge-wrap badge-red">⚠️ Achtung: Steuerkette N47 prüfen</div></td>
            <td><div class="badge-wrap badge-green">🟢 Keine auffälligen Heuristiken</div></td>
          </tr>
          <tr>
            <th>Aktionen</th>
            <td>
              <div class="action-btn-group">
                <button class="btn btn-primary btn-sm">📄 Probefahrt-Dossier (PDF)</button>
                <button class="btn btn-secondary btn-sm">Konditionen prüfen ↗</button>
                <button class="btn btn-secondary btn-sm" style="border-color: #d97706; color: #f59e0b;">🔍 carVertical Historie ↗</button>
              </div>
            </td>
            <td>
              <div class="action-btn-group">
                <button class="btn btn-primary btn-sm">📄 Probefahrt-Dossier (PDF)</button>
                <button class="btn btn-secondary btn-sm">Konditionen prüfen ↗</button>
                <button class="btn btn-secondary btn-sm" style="border-color: #d97706; color: #f59e0b;">🔍 carVertical Historie ↗</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

`;

content = content.replace(htmlToReplace, newHtml);

fs.writeFileSync(file, content);
console.log('landingpage/index.html updated successfully.');

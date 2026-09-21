const fs = require('fs');
const path = require('path');

const compareJsPath = path.join(__dirname, 'compare.js');
let compareJs = fs.readFileSync(compareJsPath, 'utf8');

// 1. Update AFFILIATE_CONFIG
const oldConfig = `const AFFILIATE_CONFIG = {
  carVertical: {
    enabled: true,
    partnerId: "PENDING_APPROVAL",
    baseUrl: "https://www.carvertical.com/de/vorgeschichte"
  }
};`;

const newConfig = `const AFFILIATE_CONFIG = {
  CARVERTICAL_BASE_URL: "https://www.carvertical.com/de/landing/v3",
  CARVERTICAL_VOUCHER: "",
  FINANCE_URL: "",
  CAR_SELL_URL: "",
  INSURANCE_URL: ""
};

function calculateMonthlyRate(priceNumeric) {
  if (!priceNumeric || priceNumeric < 3000) return null;
  const months = 60;
  const annualInterest = 0.0699;
  const monthlyInterest = annualInterest / 12;
  const rate = (priceNumeric * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -months));
  return Math.round(rate);
}`;

compareJs = compareJs.replace(oldConfig, newConfig);

// 2. Update buildCarVerticalUrl
const oldBuildUrl = `function buildCarVerticalUrl(vin) {
  const cfg = AFFILIATE_CONFIG.carVertical;
  const cleanVin = vin ? encodeURIComponent(vin.trim().toUpperCase()) : "";
  const params = new URLSearchParams();
  if (cfg.partnerId && cfg.partnerId !== "PENDING_APPROVAL") {
    params.append("voucher", cfg.partnerId);
    params.append("utm_source", "affiliate");
    params.append("utm_medium", "carintel_extension");
  }
  if (cleanVin) {
    params.append("vin", cleanVin);
  }
  const queryString = params.toString();
  return queryString ? \`\${cfg.baseUrl}?\${queryString}\` : cfg.baseUrl;
}`;

const newBuildUrl = `function buildCarVerticalUrl(vin) {
  const cleanVin = vin ? encodeURIComponent(vin.trim().toUpperCase()) : "";
  const params = new URLSearchParams();
  if (AFFILIATE_CONFIG.CARVERTICAL_VOUCHER && AFFILIATE_CONFIG.CARVERTICAL_VOUCHER !== "PENDING_APPROVAL") {
    params.append("voucher", AFFILIATE_CONFIG.CARVERTICAL_VOUCHER);
    params.append("utm_source", "affiliate");
    params.append("utm_medium", "carintel_extension");
  }
  if (cleanVin) {
    params.append("vin", cleanVin);
  }
  const queryString = params.toString();
  return queryString ? \`\${AFFILIATE_CONFIG.CARVERTICAL_BASE_URL}?\${queryString}\` : AFFILIATE_CONFIG.CARVERTICAL_BASE_URL;
}`;

compareJs = compareJs.replace(oldBuildUrl, newBuildUrl);

// 3. Add Banner and Financing Row
const tableStartOld = `    let html = \`<table>
      <thead>
        <tr>
          <th>Fahrzeug</th>\`;`;

const tableStartNew = `    let html = \`<a href="\${AFFILIATE_CONFIG.CAR_SELL_URL}" target="_blank" rel="noopener noreferrer" class="action-banner" style="display: block; background: #1e293b; color: #e2e8f0; text-align: center; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-decoration: none; font-weight: 600; border: 1px solid #334155;">
      🚗 Altes Auto abgeben? <span style="color: #38bdf8;">Kostenlose Online-Bewertung erhalten ↗</span>
    </a>\`;
    html += \`<table>
      <thead>
        <tr>
          <th>Fahrzeug</th>\`;`;
compareJs = compareJs.replace(tableStartOld, tableStartNew);

const priceRowEndOld = `    html += \`</tr>\`;

    // Row: KM`;

const priceRowEndNew = `    html += \`</tr>\`;

    // Row: Finanzierung
    html += \`<tr><th>Finanzierung</th>\`;
    cars.forEach(car => {
      const val = parseNumber(car.price);
      if (val !== null && val >= 3000) {
        const rate = calculateMonthlyRate(val);
        html += \`<td>
          <div style="font-size: 13px; margin-bottom: 6px;">ab ca. <strong>\${rate} €</strong> / Mt.*</div>
          <a href="\${AFFILIATE_CONFIG.FINANCE_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-finance" style="background-color: #2563eb; color: #fff; padding: 6px; font-size: 12px; border-radius: 4px; display: inline-block; width: 100%; box-sizing: border-box; text-decoration: none; text-align: center;">Konditionen prüfen ↗</a>
        </td>\`;
      } else {
        html += \`<td>-</td>\`;
      }
    });
    html += \`</tr>\`;

    // Row: KM`;
compareJs = compareJs.replace(priceRowEndOld, priceRowEndNew);

// 4. Add Checklist
const tableEndOld = `    html += \`</tr></tbody></table>\`;

    container.innerHTML = html;`;

const tableEndNew = `    html += \`</tr></tbody></table>\`;

    html += \`<div class="checklist-section" style="margin-top: 32px; background: #1e293b; padding: 20px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #e2e8f0; font-size: 16px;">✅ Probefahrt- / Kaufentscheider-Checkliste</h3>
      <ul style="list-style: none; padding: 0; margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 8px;"><label><input type="checkbox" style="margin-right: 8px;"> Fahrzeugpapiere (Zulassungsbescheinigung Teil I & II) vollständig?</label></li>
        <li style="margin-bottom: 8px;"><label><input type="checkbox" style="margin-right: 8px;"> Serviceheft lückenlos gepflegt?</label></li>
        <li style="margin-bottom: 8px;"><label><input type="checkbox" style="margin-right: 8px;"> eVB-Nummer für Kfz-Zulassung beantragen <a href="\${AFFILIATE_CONFIG.INSURANCE_URL}" target="_blank" rel="noopener noreferrer" class="hide-print" style="color: #38bdf8; text-decoration: none;">(Tarifvergleich ↗)</a></label></li>
      </ul>
    </div>\`;

    container.innerHTML = html;`;
compareJs = compareJs.replace(tableEndOld, tableEndNew);

fs.writeFileSync(compareJsPath, compareJs);
console.log('compare.js updated.');

// ============================================
// UPDATE HTML
const compareHtmlPath = path.join(__dirname, 'compare.html');
let compareHtml = fs.readFileSync(compareHtmlPath, 'utf8');

const printCssOld = `.top-bar, .user-location-bar, #saveZipBtn, #exportPdfBtn, .btn, .remove-btn, .btn-carvertical, .actions-row { display: none !important; }`;
const printCssNew = `.top-bar, .user-location-bar, #saveZipBtn, #exportPdfBtn, .btn, .remove-btn, .btn-carvertical, .actions-row, .btn-finance, .action-banner, .hide-print { display: none !important; }`;
compareHtml = compareHtml.replace(printCssOld, printCssNew);

const footerOld = `*Mit [Werbung] gekennzeichnete Links sind Affiliate-Partnerlinks. Bei einem Kauf erhalten wir eine Provision ohne Zusatzkosten für Sie.
    </p>`;
const footerNew = `*Mit [Werbung] gekennzeichnete Links sind Affiliate-Partnerlinks. Bei einem Kauf erhalten wir eine Provision ohne Zusatzkosten für Sie.<br><br>
      *Beispielrechnung zur Orientierung (kein verbindliches Kreditangebot): Bei einem Nettodarlehensbetrag von 10.000 €, einer Laufzeit von 60 Monaten und einem effektiven Jahreszins von 6,99 % (gebundener Sollzins 6,78 % p.a.) beträgt die monatliche Rate ca. 197 €. Gesamtbetrag: ca. 11.820 €. Bonität vorausgesetzt. CarIntel ist reiner werblicher Tippgeber und vermittelt keine Kredite nach § 34c GewO.
    </p>`;
compareHtml = compareHtml.replace(footerOld, footerNew);

fs.writeFileSync(compareHtmlPath, compareHtml);
console.log('compare.html updated.');

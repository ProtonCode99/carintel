const AFFILIATE_CONFIG = {
  carVertical: {
    enabled: true,
    partnerId: "PENDING_APPROVAL",
    baseUrl: "https://www.carvertical.com/de/vorgeschichte"
  }
};

function buildCarVerticalUrl(vin) {
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
  return queryString ? `${cfg.baseUrl}?${queryString}` : cfg.baseUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  loadComparison();

  document.getElementById('diff-toggle')?.addEventListener('change', (e) => {
    const showDiff = e.target.checked;
    
    document.querySelectorAll('.feature-row').forEach(row => {
      if (showDiff && row.getAttribute('data-diff') === 'false') {
        row.style.display = 'none';
      } else {
        row.style.display = '';
      }
    });
    
    document.querySelectorAll('.category-row').forEach(catRow => {
      if (showDiff) {
        let next = catRow.nextElementSibling;
        let anyVisible = false;
        while(next && next.classList.contains('feature-row')) {
           if(next.style.display !== 'none') anyVisible = true;
           next = next.nextElementSibling;
        }
        catRow.style.display = anyVisible ? '' : 'none';
      } else {
        catRow.style.display = '';
      }
    });
  });

  const exportBtn = document.getElementById("exportPdfBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.print();
    });
  }
});

const CATEGORIES = [
  {
    name: "Kaufentscheider",
    features: [
      { id: "ahk", label: "Anhängerkupplung", keywords: ["anhängerkupplung", "ahk", "schwenkbar", "abnehmbar"] },
      { id: "panorama", label: "Panoramadach", keywords: ["panoramadach", "schiebedach", "glasdach"] },
      { id: "standheizung", label: "Standheizung", keywords: ["standheizung"] },
      { id: "allrad", label: "Allradantrieb", keywords: ["allrad", "4motion", "quattro", "xdrive", "awd", "4x4"] }
    ]
  },
  {
    name: "Assistenz & Parken",
    features: [
      { id: "acc", label: "Abstandstempomat / ACC", keywords: ["abstandstempomat", "adaptive cruise", "acc", "distronic", "abstandswarner"] },
      { id: "cam360", label: "Rückfahrkamera / 360°", keywords: ["360", "rückfahrkamera", "surround view", "area view", "rückfahr-kamera", "cam", "rückfahr"] },
      { id: "lane", label: "Spurhalteassistent", keywords: ["spurhalteassistent", "lane assist"] },
      { id: "blind", label: "Totwinkel-Assistent", keywords: ["totwinkel", "blind spot", "side assist"] }
    ]
  },
  {
    name: "Licht & Sicht",
    features: [
      { id: "matrix", label: "Matrix- / Voll-LED", keywords: ["matrix", "led-scheinwerfer", "voll-led", "iq.light", "laserlicht", "led"] }
    ]
  },
  {
    name: "Komfort & Cockpit",
    features: [
      { id: "sitzheizung", label: "Sitzheizung", keywords: ["sitzheizung"] },
      { id: "lenkradheizung", label: "Lenkradheizung", keywords: ["lenkradheizung", "beheizbares lenkrad"] },
      { id: "hud", label: "Head-Up Display", keywords: ["head-up", "head up"] },
      { id: "digital", label: "Digitales Cockpit", keywords: ["virtual cockpit", "digital cockpit", "volldigitales kombiinstrument"] }
    ]
  },
  {
    name: "Infotainment",
    features: [
      { id: "carplay", label: "Apple CarPlay / Android Auto", keywords: ["apple carplay", "android auto", "smartphone interface", "app-connect", "carplay"] },
      { id: "sound", label: "Premium Soundsystem", keywords: ["dynaudio", "bose", "harman", "burmester", "soundsystem", "bang & olufsen"] }
    ]
  }
];


const ZIP_COORDS = {
  "01": [51.05, 13.73], "02": [51.18, 14.42], "03": [51.75, 14.33], "04": [51.33, 12.37], "06": [51.48, 11.97], "07": [50.92, 11.58], "08": [50.71, 12.49], "09": [50.83, 12.92],
  "10": [52.52, 13.40], "11": [52.52, 13.40], "12": [52.52, 13.40], "13": [52.52, 13.40], "14": [52.39, 13.06], "15": [52.34, 14.55], "16": [52.83, 13.83], "17": [53.55, 13.26], "18": [54.08, 12.13], "19": [53.63, 11.41],
  "20": [53.55, 9.99], "21": [53.55, 9.99], "22": [53.55, 9.99], "23": [53.86, 10.68], "24": [54.32, 10.13], "25": [53.75, 9.66], "26": [53.14, 8.21], "27": [53.53, 8.58], "28": [53.07, 8.80], "29": [52.62, 10.08],
  "30": [52.37, 9.73], "31": [52.10, 9.93], "32": [52.12, 8.67], "33": [52.03, 8.53], "34": [51.31, 9.49], "35": [50.58, 8.67], "36": [50.55, 9.67], "37": [51.54, 9.93], "38": [52.26, 10.52], "39": [52.12, 11.62],
  "40": [51.22, 6.77], "41": [51.19, 6.44], "42": [51.25, 7.15], "44": [51.51, 7.46], "45": [51.45, 7.01], "46": [51.53, 6.88], "47": [51.43, 6.61], "48": [51.96, 7.62], "49": [52.27, 8.04],
  "50": [50.93, 6.95], "51": [50.93, 6.95], "52": [50.77, 6.08], "53": [50.73, 7.09], "54": [49.75, 6.63], "55": [49.99, 8.27], "56": [50.35, 7.59], "57": [50.87, 8.02], "58": [51.36, 7.47], "59": [51.67, 7.82],
  "60": [50.11, 8.68], "61": [50.22, 8.61], "63": [50.13, 8.92], "64": [49.87, 8.65], "65": [50.08, 8.23], "66": [49.24, 6.99], "67": [49.44, 7.75], "68": [49.48, 8.46], "69": [49.40, 8.67],
  "70": [48.77, 9.18], "71": [48.89, 9.19], "72": [48.52, 9.05], "73": [48.74, 9.32], "74": [49.14, 9.21], "75": [48.89, 8.70], "76": [49.00, 8.40], "77": [48.47, 7.94], "78": [48.06, 8.45], "79": [47.99, 7.84],
  "80": [48.13, 11.58], "81": [48.13, 11.58], "82": [48.13, 11.58], "83": [47.72, 10.31], "84": [48.53, 12.15], "85": [48.38, 11.75], "86": [48.37, 10.89], "87": [47.72, 10.31], "88": [47.65, 9.47], "89": [48.39, 9.99],
  "90": [49.45, 11.07], "91": [49.45, 11.07], "92": [49.26, 11.86], "93": [49.01, 12.09], "94": [48.57, 13.46], "95": [49.94, 11.57], "96": [49.89, 10.89], "97": [49.79, 9.93], "98": [50.61, 10.70], "99": [50.98, 11.03]
};

function calculateDistance(zip1, zip2) {
  if (!zip1 || !zip2 || zip1.length < 2 || zip2.length < 2) return null;
  const p1 = ZIP_COORDS[zip1.substring(0, 2)];
  const p2 = ZIP_COORDS[zip2.substring(0, 2)];
  if (!p1 || !p2) return null;
  
  const R = 6371; // km
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function hasFeature(car, feature) {
  let rawString = (car.subtitle || '') + ' ' + (car.title || '') + ' ';
  if (car.features && Array.isArray(car.features)) {
    rawString += car.features.join(' ');
  }
  rawString = rawString.toLowerCase();
  return feature.keywords.some(kw => rawString.includes(kw));
}

function loadComparison() {
  chrome.storage.local.get({ savedCars: [], userHomeZip: "" }, (result) => {
    const userZip = result.userHomeZip;
    const cars = result.savedCars;
    const container = document.getElementById('compare-container');
    
    if (cars.length === 0) {
      container.innerHTML = '<div class="empty-state">Keine Fahrzeuge gespeichert.</div>';
      return;
    }

    let prices = cars.map(c => parseNumber(c.price)).filter(n => n !== null);
    let bestPrice = prices.length > 0 ? Math.min(...prices) : null;

    let kms = cars.map(c => parseNumber(c.mileage)).filter(n => n !== null);
    let bestKm = kms.length > 0 ? Math.min(...kms) : null;

    let html = `<table>
      <thead>
        <tr>
          <th>Fahrzeug</th>`;
    cars.forEach(car => {
      html += `<td class="car-col">
        ${car.imageUrl ? `<img src="${car.imageUrl}" class="car-thumb" alt="${car.title}">` : '<div class="car-thumb" style="display:flex;align-items:center;justify-content:center;color:#64748b;background-color:#334155;">Kein Bild</div>'}
        <div class="car-title">${car.title || 'Unbekannt'}</div>
        ${car.subtitle ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 2px; line-height: 1.2;">${car.subtitle}</div>` : ''}
        ${car.zip || car.city ? (() => {
          let dist = null;
          if (car.zip && userZip) {
            dist = calculateDistance(userZip, car.zip);
          }
          const cityText = car.city || car.zip || 'Unbekannt';
          const distText = dist !== null ? `(ca. ${dist} km Entfernung)` : '';
          const fullText = `Standort: ${cityText} ${distText}`.trim();
          const color = (dist !== null && dist > 200) ? '#f59e0b' : '#94a3b8';
          return `<div class="car-location" style="color: ${color}; font-size: 11px; margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span style="font-size: 10px;" class="no-print">📍</span> <span>${fullText}</span></div>`;
        })() : ''}
      </td>`;
    });
    html += `</tr></thead><tbody>`;

    // Row: Preis
    html += `<tr><th>Preis (€)</th>`;
    cars.forEach(car => {
      const val = parseNumber(car.price);
      const isBest = val !== null && val === bestPrice;
      html += `<td><span class="${isBest ? 'highlight-best' : ''}">${car.price || '-'}</span></td>`;
    });
    html += `</tr>`;

    // Row: KM
    html += `<tr><th>Kilometerstand</th>`;
    cars.forEach(car => {
      const val = parseNumber(car.mileage);
      const isBest = val !== null && val === bestKm;
      html += `<td><span class="${isBest ? 'highlight-best' : ''}">${car.mileage || '-'}</span></td>`;
    });
    html += `</tr>`;

    // Row: EZ
    html += `<tr><th>Erstzulassung</th>`;
    cars.forEach(car => html += `<td>${car.firstRegistration || '-'}</td>`);
    html += `</tr>`;

    // Row: Kraftstoff & Leistung
    html += `<tr><th>Motor & Kraftstoff</th>`;
    cars.forEach(car => html += `<td>${car.power || '-'} <br> ${car.fuelType || '-'}</td>`);
    html += `</tr>`;

    // Row: Standzeit & Preisbewertung
    html += `<tr><th>Preisbewertung / Standzeit</th>`;
    cars.forEach(car => {
      const standzeitTxt = car.standzeit !== null ? car.standzeit + ' Tage' : 'Aktuell gelistet';
      let ratingStr = '';
      if (car.priceRating) {
        let badgeColor = '🟢';
        if (car.priceRating.toLowerCase().includes('erhöhter')) badgeColor = '🔴';
        else if (car.priceRating.toLowerCase().includes('fair')) badgeColor = '🟡';
        ratingStr = `${badgeColor} <strong>${car.priceRating}</strong><br>`;
      }
      html += `<td>${ratingStr}${standzeitTxt}</td>`;
    });
    html += `</tr>`;

    // Row: Risiko-Radar
    html += `<tr><th>Risiken & Warnungen</th>`;
    cars.forEach(car => {
      let badgesHtml = '';
      if (car.flags && car.flags.length > 0) {
        car.flags.forEach(f => {
          badgesHtml += `<div class="badge ${f.type}">${f.text}</div>`;
        });
      }
      html += `<td>${badgesHtml}</td>`;
    });
    html += `</tr>`;

    // --- EQUIPMENT MATRIX ---
    CATEGORIES.forEach(cat => {
      html += `<tr class="category-row"><td colspan="${cars.length + 1}" class="category-header">${cat.name}</td></tr>`;
      
      cat.features.forEach(feat => {
        const hasMap = cars.map(c => hasFeature(c, feat));
        const allHave = hasMap.every(v => v === true);
        const noneHave = hasMap.every(v => v === false);
        const isDiff = !(allHave || noneHave);
        
        html += `<tr class="feature-row" data-diff="${isDiff}">
          <th>${feat.label}</th>`;
        
        hasMap.forEach(hasIt => {
          html += `<td>${hasIt ? '<span class="badge-present">✓</span>' : '<span class="badge-absent">—</span>'}</td>`;
        });
        
        html += `</tr>`;
      });
    });

    // Row: Aktionen
    html += `<tr><th>Aktionen</th>`;
    cars.forEach(car => {
      html += `<td>
        <a href="${car.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Zum Inserat ↗</a>
        <a href="${buildCarVerticalUrl(car.vin)}" target="_blank" rel="noopener noreferrer" class="btn btn-carvertical" data-vin="${car.vin || ''}" data-title="${car.title}" style="display: block; text-align: center; text-decoration: none; box-sizing: border-box; background-color: #d97706; color: #ffffff; font-weight: 600; border: none; padding: 7px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 8px;">🔍 Historie prüfen (carVertical)*</a>
        <button class="btn btn-danger remove-btn" data-id="${car.id}" style="margin-top: 8px;">Entfernen</button>
      </td>`;
    });
    html += `</tr></tbody></table>`;

    container.innerHTML = html;

    const printDate = document.getElementById('print-date');
    if (printDate) printDate.innerText = new Date().toLocaleDateString('de-DE');

    // Reset toggle when table redraws
    const diffToggle = document.getElementById('diff-toggle');
    if (diffToggle) {
      diffToggle.checked = false;
    }

    
    const zipInput = document.getElementById('userZipInput');
    const zipBtn = document.getElementById('saveZipBtn');
    if (zipInput) {
      zipInput.value = userZip || '';
      zipBtn.onclick = () => {
        chrome.storage.local.set({ userHomeZip: zipInput.value.trim() }, () => {
          loadComparison();
        });
      };
    }

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        removeCar(id);
      });
    });

    document.querySelectorAll('.btn-carvertical').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const vin = e.currentTarget.getAttribute('data-vin');
        const title = e.currentTarget.getAttribute('data-title');
        
        if (!vin || vin === '') {
          e.preventDefault(); // Verhindere Standard-Link-Navigation
          const message = `Guten Tag,\n\nich interessiere mich für Ihr Fahrzeug (${title}).\nKönnten Sie mir bitte die Fahrgestellnummer (FIN / VIN) zukommen lassen, damit ich die Historie prüfen kann?\n\nVielen Dank im Voraus!`;
          navigator.clipboard.writeText(message).then(() => {
            const originalText = e.currentTarget.textContent;
            e.currentTarget.textContent = 'Anfragetext kopiert!';
            setTimeout(() => { e.currentTarget.textContent = originalText; }, 3000);
            window.open(buildCarVerticalUrl(''), '_blank', 'noopener,noreferrer');
          });
        }
        // Bei vorhandener FIN erfolgt der Seitenaufruf automatisch über das href-Attribut.
      });
    });
  });
}

function parseNumber(str) {
  if (!str) return null;
  const numStr = str.replace(/[^0-9,]/g, '').replace(',', '.');
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
}

function removeCar(id) {
  chrome.storage.local.get({ savedCars: [] }, (result) => {
    const updated = result.savedCars.filter(c => c.id !== id);
    chrome.storage.local.set({ savedCars: updated }, () => {
      loadComparison();
    });
  });
}

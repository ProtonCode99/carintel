const fs = require('fs');

// --- UPDATE content.js ---
let contentJs = fs.readFileSync('content.js', 'utf8');

// Add address extraction helper
if (!contentJs.includes('function findAddressInJson')) {
  const addressHelper = `
  function findAddressInJson(obj) {
    let result = { zip: '', city: '' };
    function search(node) {
      if (result.zip) return;
      if (node && typeof node === 'object') {
        if (Array.isArray(node)) {
          node.forEach(search);
        } else {
          if (node.postalCode) {
            result.zip = node.postalCode;
            result.city = node.addressLocality || node.addressRegion || '';
            return;
          }
          for (let key in node) search(node[key]);
        }
      }
    }
    search(obj);
    return result;
  }
`;
  contentJs = contentJs.replace('function findCarInJson', addressHelper + '\n  function findCarInJson');
}

// Add zip/city extraction to Mobile.de
if (!contentJs.includes('const addr = findAddressInJson(item);')) {
  contentJs = contentJs.replace('if (item.offers && item.offers.validFrom) {', `
          const addr = findAddressInJson(item);
          if (addr.zip) {
             data.zip = addr.zip;
             data.city = addr.city;
          }
          if (item.offers && item.offers.validFrom) {`);
}

// Add zip/city extraction to AutoScout24
if (!contentJs.includes('listing.location?.zip')) {
  contentJs = contentJs.replace('const extractedFeatures = extractAutoScoutEquipment(nextData);', `
          if (listing.location) {
             data.zip = listing.location.zip || '';
             data.city = listing.location.city || '';
          }
          const extractedFeatures = extractAutoScoutEquipment(nextData);`);
}

// Ensure zip/city are saved
contentJs = contentJs.replace('imageUrl: data.imageUrl,', 'imageUrl: data.imageUrl,\n      zip: data.zip,\n      city: data.city,');

fs.writeFileSync('content.js', contentJs);
console.log('content.js updated');

// --- UPDATE compare.js ---
let compareJs = fs.readFileSync('compare.js', 'utf8');

const geoMath = `
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
`;

if (!compareJs.includes('calculateDistance')) {
  compareJs = compareJs.replace('function hasFeature(car, feature) {', geoMath + '\nfunction hasFeature(car, feature) {');
}

// Update loadComparison to load userHomeZip
if (!compareJs.includes('userHomeZip: ""')) {
  compareJs = compareJs.replace('chrome.storage.local.get({ savedCars: [] }, (result) => {', 'chrome.storage.local.get({ savedCars: [], userHomeZip: "" }, (result) => {\n    const userZip = result.userHomeZip;');
  compareJs = compareJs.replace("const zipInput = document.getElementById('home-zip-input');", ""); // just in case
}

// Add location HTML rendering
const locRenderOld = `<div class="car-title">\${car.title || 'Unbekannt'}</div>
        \${car.subtitle ? \`<div style="color: #94a3b8; font-size: 11px; margin-top: 2px; line-height: 1.2;">\${car.subtitle}</div>\` : ''}`;

const locRenderNew = `<div class="car-title">\${car.title || 'Unbekannt'}</div>
        \${car.subtitle ? \`<div style="color: #94a3b8; font-size: 11px; margin-top: 2px; line-height: 1.2;">\${car.subtitle}</div>\` : ''}
        \${car.zip || car.city ? (() => {
          let distStr = '';
          if (car.zip && userZip) {
            const dist = calculateDistance(userZip, car.zip);
            if (dist !== null) {
              const color = dist > 200 ? '#f59e0b' : '#94a3b8';
              distStr = \`<span style="color: \${color};">ca. \${dist} km</span>\`;
            }
          }
          const locText = [distStr, car.city].filter(Boolean).join(' • ');
          return \`<div style="color: #94a3b8; font-size: 11px; margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span style="font-size: 10px;">📍</span> \${locText || car.zip}</div>\`;
        })() : ''}`;

if (compareJs.includes(locRenderOld)) {
  compareJs = compareJs.replace(locRenderOld, locRenderNew);
}

// Add UI event listener for zip input
const uiHandlers = `
    const zipInput = document.getElementById('home-zip-input');
    const zipBtn = document.getElementById('save-zip-btn');
    if (zipInput) {
      zipInput.value = userZip || '';
      zipBtn.onclick = () => {
        chrome.storage.local.set({ userHomeZip: zipInput.value.trim() }, () => {
          loadComparison();
        });
      };
    }
`;

if (!compareJs.includes('document.getElementById(\'home-zip-input\')')) {
  compareJs = compareJs.replace("document.querySelectorAll('.remove-btn').forEach(btn => {", uiHandlers + "\n    document.querySelectorAll('.remove-btn').forEach(btn => {");
}

fs.writeFileSync('compare.js', compareJs);
console.log('compare.js updated');

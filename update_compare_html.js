const fs = require('fs');
let html = fs.readFileSync('compare.html', 'utf8');

if (!html.includes('id="home-zip-input"')) {
  html = html.replace(
    '<div class="controls" style="display: flex; gap: 1rem; align-items: center;">',
    `<div class="controls" style="display: flex; gap: 1rem; align-items: center;">
      <div class="location-control" style="display: flex; align-items: center; gap: 0.5rem; background: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #334155;">
        <span style="font-size: 0.85rem; color: #94a3b8;">Mein Standort:</span>
        <input type="text" id="home-zip-input" placeholder="PLZ z.B. 33813" style="width: 100px; padding: 0.25rem; border: 1px solid #475569; border-radius: 4px; background: #0f172a; color: white; font-size: 0.85rem;" />
        <button id="save-zip-btn" style="padding: 0.25rem 0.5rem; border-radius: 4px; border: none; background: #0284c7; color: white; cursor: pointer; font-size: 0.85rem;">Speichern</button>
      </div>`
  );
  fs.writeFileSync('compare.html', html);
  console.log('compare.html updated');
}

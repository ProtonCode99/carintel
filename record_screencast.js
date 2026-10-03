const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Verbinde mit laufendem Chrome über CDP (Port 9222)...');
  
  let browser;
  try {
      browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (error) {
      console.error('FEHLER: Konnte nicht zu Chrome verbinden.');
      console.error('Bitte stelle sicher, dass Chrome komplett geschlossen war und mit folgendem Befehl gestartet wurde:');
      console.error('Auf Mac: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222');
      console.error('Auf Windows: chrome.exe --remote-debugging-port=9222');
      process.exit(1);
  }

  // Wir nutzen den bereits offenen, echten Kontext des Nutzers (umgeht Bot-Schutz)
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0] || await defaultContext.newPage();

  console.log('Erfolgreich verbunden. Übernehme Steuerung im aktiven Tab...');
  
  // WICHTIG: Da wir uns an einen bestehenden Browser hängen, unterstützt Playwright 
  // die native "recordVideo"-Funktion für diesen Kontext nicht out-of-the-box. 
  // Am besten startest du hier deine manuelle Bildschirmaufnahme (z.B. OBS oder Loom)!
  console.log('>>> TIPP: Starte JETZT deine Bildschirmaufnahme (Loom/OBS)! Ablauf beginnt in 3 Sekunden...');
  await page.waitForTimeout(3000);

  // 00:00 – 00:10 (Suche & Aufruf):
  console.log('00:00 - 00:10: Scrolle sanft über das Inserat...');
  // Wir gehen davon aus, dass das Inserat bereits im Tab geöffnet ist.
  // Falls nicht, navigieren wir zur Sicherheit nicht weg, sondern scrollen direkt.
  
  // Smooth scroll runter zu Preis/Bildern
  await page.evaluate(() => { window.scrollBy({ top: 600, behavior: 'smooth' }); });
  await page.waitForTimeout(4000);
  // Smooth scroll leicht hoch
  await page.evaluate(() => { window.scrollBy({ top: -200, behavior: 'smooth' }); });
  await page.waitForTimeout(4000);
  
  // 00:10 – 00:22 (Add-on Overlay):
  console.log('00:10 - 00:22: Hovering CarIntel Overlay...');
  try {
      const hud = await page.locator('.car-intel-hud, #car-intel-hud, .carintel-badge, .badge').first();
      await hud.hover({ force: true });
  } catch (e) {
      console.log('HUD nicht gefunden. Stelle sicher, dass die Extension aktiv und geladen ist.');
  }
  await page.waitForTimeout(6000);

  // 00:22 – 00:36 (Standzeit & Interaktion):
  console.log('00:22 - 00:36: Klicke auf Standzeit-Badge...');
  try {
      const standzeitBadge = await page.locator('.badge:has-text("Standzeit"), .badge:has-text("Tage")').first();
      if (await standzeitBadge.isVisible()) {
          await standzeitBadge.hover();
          await page.waitForTimeout(1000);
          await standzeitBadge.click();
      }
  } catch (e) {}
  await page.waitForTimeout(8000);

  // 00:36 – 00:50 (Mängel-Check):
  console.log('00:36 - 00:50: Mängel-Check öffnen...');
  try {
      const maengelCheckBtn = await page.locator('text="Mängel", text="Check", .vin-btn').first();
      if (await maengelCheckBtn.isVisible()) {
          await maengelCheckBtn.hover();
          await page.waitForTimeout(1000);
          await maengelCheckBtn.click();
      }
  } catch (e) {}
  await page.waitForTimeout(8000);

  // 00:50 – 01:02 (Dossier-Export / Add-on-Ablage):
  console.log('00:50 - 01:02: Fahrzeug speichern / Dossier exportieren...');
  try {
      const saveBtn = await page.locator('text="Fahrzeug merken", .save-btn, text="PDF"').first();
      if (await saveBtn.isVisible()) {
          await saveBtn.hover();
          await page.waitForTimeout(1000);
          await saveBtn.click();
      }
  } catch (e) {}
  await page.waitForTimeout(8000);

  // 01:02 – 01:15 (Landingpage):
  console.log('01:02 - 01:15: Gehe zu carintel.de...');
  await page.goto('https://carintel.de', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  // Highlight CTA "Zu Chrome hinzufügen"
  try {
      const installBtn = await page.locator('a[href*="chromewebstore"]').first();
      if (await installBtn.isVisible()) {
          await installBtn.hover();
      }
  } catch (e) {}
  await page.waitForTimeout(4000);
  
  console.log('Automatisierter Durchlauf beendet! Beende CDP-Verbindung (Browser bleibt offen).');
  // Wichtig: Wir schließen nur die Verbindung, nicht den Browser des Nutzers.
  await browser.close();
})();

(async function() {
  if (document.getElementById('car-intel-hud-script-loaded')) return;
  const marker = document.createElement('div');
  marker.id = 'car-intel-hud-script-loaded';
  marker.style.display = 'none';
  document.body.appendChild(marker);

  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id') || window.location.pathname.split('/').filter(Boolean).pop() || btoa(window.location.href).substring(0, 16);

  const url = window.location.href;
  const isMobileDe = url.includes('mobile.de');
  const isAutoScout24 = url.includes('autoscout24');

  let carData = {
    id: carId,
    title: '',
    subtitle: '',
    make: '',
    model: '',
    price: '',
    priceRating: '',
    mileage: '',
    firstRegistration: '',
    productionDate: '',
    power: '',
    fuelType: '',
    vin: '',
    imageUrl: '',
    features: [],
    listingDate: 0,
    standzeit: null,
    flags: [],
    url: window.location.href
  };

  let retryCount = 0;
  const maxRetries = 2;
  const retryDelays = [600, 1500];

  async function init() {
    await runPipeline();
    
    if (isMissingCriticalData(carData) && retryCount < maxRetries) {
      setTimeout(async () => {
        retryCount++;
        await init();
      }, retryDelays[retryCount - 1]);
    }
  }

  function isMissingCriticalData(data) {
    return !data.title || !data.price || data.title.includes('Unbekannt') || data.price.includes('Unbekannt');
  }

  async function runPipeline() {
    carData.flags = [];
    
    if (isMobileDe) {
      extractMobileDe(carData);
    } else if (isAutoScout24) {
      extractAutoScout(carData);
    }
    
    fallbackDOMExtraction(carData);
    formatData(carData);

    // --- Standzeit-Rechner ---
    if (carData.listingDate) {
      const daysActive = Math.floor((Date.now() - carData.listingDate) / (1000 * 60 * 60 * 24));
      carData.standzeit = daysActive;
    }

    // --- Gewährleistungs- & Risiko-Scan ---
    let hasRisks = false;
    const pageText = document.body.innerText.toLowerCase();
    
    if (pageText.match(/kundenauftrag|im kundenauftrag/)) {
      carData.flags.push({ type: 'warning', text: "⚠️ Keine Händlergewährleistung (Verkauf im Kundenauftrag)!" });
      hasRisks = true;
    }
    if (pageText.match(/nur an gewerbe|händlerpreis|nur export|für export/)) {
      carData.flags.push({ type: 'warning', text: "⚠️ Ausschluss von Verbraucherrechten (Nur Händler/Export)!" });
      hasRisks = true;
    }
    if (pageText.match(/bastler|ausschlachten|fahruntüchtig/)) {
      carData.flags.push({ type: 'warning', text: "⚠️ Bastlerfahrzeug ohne Sachmängelhaftung!" });
      hasRisks = true;
    }

    if (pageText.match(/7-gang dsg|doppelkupplung|dsg/)) {
      carData.flags.push({ type: 'info', text: "ℹ️ DSG-Getriebe: Schaltkomfort bei Probefahrt prüfen." });
    }

    // --- Engine Matching ---
    try {
      const enginesUrl = chrome.runtime.getURL('heuristics/engines.json');
      const response = await fetch(enginesUrl);
      const engines = await response.json();
      
      const searchText = `${carData.title} ${carData.make} ${carData.model} ${pageText}`.toLowerCase();
      
      let registrationYear = 0;
      if (carData.firstRegistration) {
        const yearMatch = carData.firstRegistration.match(/\d{4}/);
        if (yearMatch) registrationYear = parseInt(yearMatch[0], 10);
      }
      
      for (const engine of engines) {
        if (engine.keywords.some(kw => searchText.includes(kw))) {
          if (registrationYear === 0 || (registrationYear >= engine.years[0] && registrationYear <= engine.years[1])) {
            carData.flags.push({ type: 'warning', text: `⚠️ Risikomotor erkannt: ${engine.name}. ${engine.description}` });
            hasRisks = true;
            break; 
          }
        }
      }
    } catch (err) {}

    if (!hasRisks) {
      carData.flags.unshift({ type: 'success', text: "✅ Keine Serienfehler bekannt" });
      carData.flags.unshift({ type: 'success', text: "✅ Händler-Gewährleistung aktiv" });
    }

    renderOverlay(carData);
  }

  // --- Extractors ---
  
  
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

  function findCarInJson(obj) {
    let result = null;
    function search(node) {
      if (result) return;
      if (node && typeof node === 'object') {
        if (Array.isArray(node)) {
          node.forEach(search);
        } else {
          if (node['@type'] && ['Car', 'Vehicle', 'Product', 'Automobile'].includes(node['@type'])) {
            result = node;
            return;
          }
          for (let key in node) {
            search(node[key]);
          }
        }
      }
    }
    search(obj);
    return result;
  }

  function extractImageUrl() {
    const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                  document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    if (ogImg && ogImg.startsWith('http')) return ogImg;

    const domImg = document.querySelector('[data-testid*="gallery"] img, .gallery-picture img, #vip-gallery img, img[class*="gallery"]');
    if (domImg?.currentSrc) return domImg.currentSrc;
    if (domImg?.src && domImg.src.startsWith('http')) return domImg.src;

    return null;
  }

  function extractMobileDe(data) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const json = JSON.parse(script.textContent);
        const item = findCarInJson(json);
        if (item) {
          data.title = item.name || data.title;
          
          if (item.offers) {
            let offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer.price) data.price = `${offer.price} ${offer.priceCurrency || '€'}`;
            else if (offer.priceSpecification && offer.priceSpecification.price) {
               data.price = `${offer.priceSpecification.price} ${offer.priceSpecification.priceCurrency || '€'}`;
            }
          }
          
          if (item.image) {
            if (typeof item.image === 'string') data.imageUrl = item.image;
            else if (Array.isArray(item.image)) data.imageUrl = item.image[0];
            else if (item.image.url) data.imageUrl = item.image.url;
          }
          
          data.mileage = item.mileageFromOdometer?.value ? `${item.mileageFromOdometer.value} km` : data.mileage;
          data.firstRegistration = item.vehicleModelDate || data.firstRegistration;
          data.vin = item.vehicleIdentificationNumber || data.vin;
          
          
          const addr = findAddressInJson(item);
          if (addr.zip) {
             data.zip = addr.zip;
             data.city = addr.city;
          }
          if (item.offers && item.offers.validFrom) {
            data.listingDate = new Date(item.offers.validFrom).getTime();
          }
        }
      } catch(e) {}
    });
  }

  function extractAutoScoutEquipment(nextData) {
    const features = [];
    function crawl(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(crawl);
        return;
      }
      for (const [key, value] of Object.entries(node)) {
        const k = key.toLowerCase();
        if (['equipment', 'features', 'attributes', 'options', 'ausstattung'].some(term => k.includes(term))) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (typeof item === 'string') features.push(item);
              else if (item && typeof item === 'object') {
                if (item.name) features.push(item.name);
                if (item.label) features.push(item.label);
                if (Array.isArray(item.elements)) item.elements.forEach(el => features.push(typeof el === 'string' ? el : el.name));
              }
            });
          }
        }
        crawl(value);
      }
    }
    crawl(nextData);
    return [...new Set(features.filter(Boolean))];
  }

  function extractAutoScout(data) {
    let nextData = null;
    if (window.__NEXT_DATA__) {
      nextData = window.__NEXT_DATA__;
    } else {
      const nextDataScript = document.getElementById('__NEXT_DATA__');
      if (nextDataScript) {
        try {
          nextData = JSON.parse(nextDataScript.textContent);
        } catch (e) {}
      }
    }

    if (nextData) {
      try {
        const listing = nextData.props?.pageProps?.listingDetails || nextData.props?.pageProps?.listing;
        if (listing) {
          data.make = listing.vehicle?.make || data.make;
          data.model = listing.vehicle?.model || data.model;
          if (listing.vehicle && listing.vehicle.make && listing.vehicle.model) {
            data.title = `${listing.vehicle.make} ${listing.vehicle.model}`.trim();
          } else {
            data.title = `${data.make} ${data.model}`.trim();
          }
          
          if (listing.price?.raw) {
            data.price = formatEuroPrice(listing.price.raw);
          } else if (listing.price?.label) {
            data.price = listing.price.label;
          }
          data.mileage = listing.vehicle?.mileageInKm ? `${listing.vehicle.mileageInKm} km` : data.mileage;
          data.firstRegistration = listing.vehicle?.firstRegistrationDate || data.firstRegistration;
          data.vin = listing.vehicle?.vin || data.vin;
          if (listing.images && listing.images.length > 0) {
             data.imageUrl = listing.images[0];
          }
          
          if (listing.tracking?.publicationDate) {
            data.listingDate = new Date(listing.tracking.publicationDate).getTime();
          } else if (listing.publicationDate) {
            data.listingDate = new Date(listing.publicationDate).getTime();
          }
          
          
          if (listing.location) {
             data.zip = listing.location.zip || '';
             data.city = listing.location.city || '';
          }
          
          if (listing.location) {
             data.zip = listing.location.zip || '';
             data.city = listing.location.city || '';
          }
          const extractedFeatures = extractAutoScoutEquipment(nextData);
          if (extractedFeatures && extractedFeatures.length > 0) {
            data.features = extractedFeatures;
          }
        }
      } catch (e) {}
    }

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const json = JSON.parse(script.textContent);
        const item = findCarInJson(json);
        if (item) {
          if (!data.title) data.title = item.name;
          if (!data.price && item.offers) {
            let offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offer.price) data.price = `${offer.price} ${offer.priceCurrency || '€'}`;
          }
          if (!data.imageUrl && item.image) {
            if (typeof item.image === 'string') data.imageUrl = item.image;
            else if (Array.isArray(item.image)) data.imageUrl = item.image[0];
            else if (item.image.url) data.imageUrl = item.image.url;
          }
        }
      } catch(e) {}
    });
  }

  function fallbackDOMExtraction(data) {
    if (!data.title) {
      const h1 = document.querySelector('h1[data-testid="ad-title"], h1');
      if (h1 && h1.innerText) {
        const lines = h1.innerText.split('\n').map(l => l.trim()).filter(Boolean);
        data.title = lines[0];
      } else if (document.title) {
        let parsedTitle = document.title.split('|')[0];
        parsedTitle = parsedTitle.replace(/bei mobile\.de|für .*? €|AutoScout24/gi, '').trim();
        data.title = parsedTitle;
      }
    }

    if (!data.subtitle) {
      const h1 = document.querySelector('h1[data-testid="ad-title"], h1');
      if (h1 && h1.innerText) {
        const lines = h1.innerText.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          data.subtitle = lines.slice(1).join(' ');
        }
      }
      if (!data.subtitle) {
        const subEl = document.querySelector('[data-testid="ad-sub-title"], [data-testid="ad-subtitle"], .sub-title, .title-wrapper h2');
        if (subEl && subEl.innerText) {
          data.subtitle = subEl.innerText.replace(/\s+/g, ' ').trim();
        }
      }
    }

    if (!data.subtitle) {
      const subEl = document.querySelector('[data-testid="ad-sub-title"], [data-testid="ad-subtitle"], .sub-title, .title-wrapper h2');
      if (subEl && subEl.innerText) {
        data.subtitle = subEl.innerText.replace(/\s+/g, ' ').trim();
      }
    }

    if (!data.priceRating) {
      const ratingEl = document.querySelector('[data-testid*="price-rating"], [class*="price-rating"], [data-testid="prime-price-rating"]');
      if (ratingEl && ratingEl.innerText) {
        data.priceRating = ratingEl.innerText.replace(/\s+/g, ' ').trim();
      }
      if (!data.priceRating) {
        const pageText = document.body.innerText;
        const matches = pageText.match(/Sehr guter Preis|Guter Preis|Fairer Preis|Erhöhter Preis/i);
        if (matches) data.priceRating = matches[0];
      }
    }

    if (!data.price) {
      const primePrice = document.querySelector('[data-testid="prime-price"]');
      const mainPrice = document.querySelector('span[class*="main-price"], [class*="price-box"] h2, span[class*="pricePrimary"]');
      
      if (primePrice && primePrice.innerText) {
        data.price = primePrice.innerText.trim();
      } else if (mainPrice && mainPrice.innerText) {
        data.price = mainPrice.innerText.trim();
      } else {
        const text = document.body.innerText;
        const regex = /(\d{1,3}(?:\.\d{3})*\s*€)/g;
        let match;
        let bestPrice = 0;
        let bestPriceStr = '';
        while ((match = regex.exec(text)) !== null) {
          const num = parseInt(match[1].replace(/\./g, ''), 10);
          if (num > 1000 && num > bestPrice) {
            bestPrice = num;
            bestPriceStr = match[1];
          }
        }
        if (bestPriceStr) data.price = formatEuroPrice(bestPrice);
      }
    }

    if (!data.mileage) {
      const mileageMatch1 = document.body.innerText.match(/Kilometerstand\s*[:\n\r]*\s*([\d\.]+\s*km)/i);
      const mileageMatch2 = document.body.innerText.match(/([\d\.]+\s*km)/i);
      if (mileageMatch1) data.mileage = mileageMatch1[1];
      else if (mileageMatch2) data.mileage = mileageMatch2[1];
    }

    if (!data.firstRegistration) {
      const ezMatch = document.body.innerText.match(/Erstzulassung\s*[:\n\r]*\s*(\d{2}\/\d{4}|\d{4})/i);
      if (ezMatch) data.firstRegistration = ezMatch[1];
    }

    if (!data.power) {
      const powerMatch = document.body.innerText.match(/Leistung\s*[:\n\r]*\s*(\d+\s*kW\s*\(\d+\s*PS\))/i);
      if (powerMatch) data.power = powerMatch[1];
    }

    if (!data.fuelType) {
      const fuelMatch = document.body.innerText.match(/Kraftstoffart\s*[:\n\r]*\s*([A-Za-zäöüÄÖÜ]+)/i);
      if (fuelMatch) data.fuelType = fuelMatch[1];
    }

    if (!data.subtitle) {
      data.subtitle = `${data.power || ''} ${data.fuelType || ''}`.trim();
    }

    if (!data.imageUrl) {
      data.imageUrl = extractImageUrl();
    }

    if (!data.features || data.features.length === 0) {
      const featureEls = document.querySelectorAll('[data-testid*="feature"], [class*="bullet-list"] li, ul[class*="features"] li, #features li, [data-testid="car-feature-list"] span, section[data-test="equipment-section"] li, [class*="ausstattung"] li, [class*="equipment"] li');
      let fts = [];
      featureEls.forEach(el => {
        let t = el.innerText?.trim();
        if (t) fts.push(t);
      });
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const json = JSON.parse(script.textContent);
          const item = findCarInJson(json);
          if (item && Array.isArray(item.amenityFeature)) {
            item.amenityFeature.forEach(af => {
               if(typeof af === 'string') fts.push(af);
               else if(af.name) fts.push(af.name);
            });
          }
        } catch(e) {}
      });
      data.features = [...new Set(fts)];
    }

    if (!data.zip || !data.city) {
      const locEl = document.querySelector('[data-testid="location"], [class*="StageArea_location"], .seller-info-location, [data-testid="dealer-address"]');
      if (locEl && locEl.innerText) {
        const match = locEl.innerText.match(/\b(\d{5})\s+([A-Za-zäöüÄÖÜß\s\-]+)/);
        if (match) {
          data.zip = match[1];
          data.city = match[2].trim();
        }
      }
      
      if (!data.zip) {
        const pageText = document.body.innerText;
        const match = pageText.match(/\b(\d{5})\s+([A-Za-zäöüÄÖÜß\s\-]+)/);
        if (match) {
           data.zip = match[1];
           data.city = match[2].trim();
        }
      }
    }
  }

  function formatEuroPrice(num) {
    if (!num) return '';
    const parsed = typeof num === 'string' ? parseFloat(num.replace(/[^0-9\.]/g, '')) : num;
    if (isNaN(parsed)) return num;
    return parsed.toLocaleString('de-DE') + ' €';
  }

  function formatData(data) {
    let rawTitle = data.title || 'Unbekannt';
    let cleanTitle = rawTitle
      .replace(/\s+für\s+(?:€\s*)?[\d\.]+(?:\s*€|-|\s*EUR)?.*$/i, '')
      .replace(/\s*\|\s*(?:mobile\.de|AutoScout24).*$/i, '')
      .replace(/\s*bei\s*mobile\.de.*$/i, '')
      .trim();
    data.displayTitle = cleanTitle;
    if (data.price && !data.price.includes('€')) {
       data.displayPrice = formatEuroPrice(data.price);
    } else {
       data.displayPrice = data.price || 'Unbekannt';
    }
    data.displayMileage = data.mileage || 'Unbekannt';
    data.displayEZ = data.firstRegistration || 'Unbekannt';
  }

  function renderOverlay(data) {
    let hud = document.getElementById('car-intel-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'car-intel-hud';
      document.body.appendChild(hud);
    }
    
    let badgesHtml = '';
    data.flags.forEach(flag => {
      badgesHtml += `<div class="badge ${flag.type}">${flag.text}</div>`;
    });

    const standzeitHtml = data.standzeit !== null 
      ? `<div class="badge info">Standzeit: ${data.standzeit} Tage</div>` 
      : `<div class="badge success">Standzeit: Aktuell gelistet</div>`;

    const hasVin = !!data.vin;
    const vinActionHtml = hasVin
      ? `<a href="https://www.carvertical.com/de/pre-check?vin=${encodeURIComponent(data.vin)}&a=affiliate" target="_blank" rel="noopener noreferrer" class="vin-btn">🔍 FIN prüfen (CarVertical Affiliate)</a>`
      : `<button class="action-btn vin-btn" id="ci-request-vin">FIN beim Händler anfordern</button>`;

    hud.innerHTML = `
      <h3>
        CarIntel Inspector
        <button class="close-btn" id="ci-close" title="Schließen">×</button>
      </h3>
      <div class="car-summary">
        <div><strong>Fahrzeug:</strong> ${data.displayTitle}</div>
        <div><strong>Preis:</strong> ${data.displayPrice}</div>
        <div><strong>EZ:</strong> ${data.displayEZ}</div>
        <div><strong>KM:</strong> ${data.displayMileage}</div>
        ${data.vin ? `<div><strong>FIN:</strong> ${data.vin}</div>` : ''}
      </div>
      <div class="badges">
        ${standzeitHtml}
        ${badgesHtml}
      </div>
      <div class="actions">
        <button class="action-btn save-btn" id="ci-save">📌 In Vergleichsliste speichern</button>
        ${vinActionHtml}
      </div>
    `;

    document.getElementById('ci-close').addEventListener('click', () => {
      hud.style.opacity = '0';
      setTimeout(() => hud.remove(), 300);
    });

    const saveBtn = document.getElementById('ci-save');
    saveBtn.addEventListener('click', () => {
      saveCar(data, saveBtn);
    });

    const requestVinBtn = document.getElementById('ci-request-vin');
    if (requestVinBtn) {
      requestVinBtn.addEventListener('click', () => {
        const message = `Guten Tag,\n\nich interessiere mich für Ihr Fahrzeug (${data.displayTitle}).\nKönnten Sie mir bitte die Fahrgestellnummer (FIN / VIN) zukommen lassen, damit ich die Historie prüfen kann?\n\nVielen Dank im Voraus!`;
        navigator.clipboard.writeText(message).then(() => {
          requestVinBtn.textContent = 'Kopiert!';
          setTimeout(() => { requestVinBtn.textContent = 'FIN beim Händler anfordern'; }, 2000);
        });
      });
    }
  }

  function saveCar(data, btn) {
    const carToSave = {
      id: data.id,
      title: data.displayTitle,
      subtitle: data.subtitle,
      price: data.displayPrice,
      priceRating: data.priceRating,
      mileage: data.displayMileage,
      firstRegistration: data.displayEZ,
      power: data.power || '-',
      fuelType: data.fuelType || '-',
      features: data.features || [],
      imageUrl: data.imageUrl,
      zip: data.zip,
      city: data.city,
      zip: data.zip,
      city: data.city,
      standzeit: data.standzeit,
      flags: data.flags,
      url: data.url,
      savedAt: Date.now()
    };

    chrome.storage.local.get({ savedCars: [] }, (result) => {
      let list = result.savedCars || [];
      const exists = list.some(c => c.id === carToSave.id);
      
      if (!exists) {
        list.push(carToSave);
        chrome.storage.local.set({ savedCars: list }, () => {
          btn.textContent = `✓ Gespeichert (${list.length} im Vergleich)`;
          btn.disabled = true;
        });
      } else {
        btn.textContent = `✓ Bereits gespeichert (${list.length} im Vergleich)`;
        btn.disabled = true;
      }
    });
  }

  init();
})();

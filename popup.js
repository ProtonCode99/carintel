document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cars-container');
  const clearAllBtn = document.getElementById('clear-all');

  loadCars();

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Wirklich alle Fahrzeuge entfernen?')) {
      chrome.storage.local.set({ savedCars: [] }, () => {
        loadCars();
      });
    }
  });

  const openCompareBtn = document.getElementById('open-compare');
  if (openCompareBtn) {
    openCompareBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'compare.html' });
    });
  }

  function loadCars() {
    chrome.storage.local.get({ savedCars: [] }, (result) => {
      const cars = result.savedCars || [];
      container.innerHTML = '';

      if (cars.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <p>Keine Fahrzeuge gespeichert.</p>
            <p style="font-size: 13px; color: #64748b;">Öffne ein Inserat auf mobile.de oder autoscout24.de und klicke auf "In Vergleichsliste speichern".</p>
          </div>
        `;
        clearAllBtn.style.display = 'none';
        return;
      }

      clearAllBtn.style.display = 'block';
      
      // Sort by newest first
      cars.sort((a, b) => b.savedAt - a.savedAt);

      cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';

        let badgesHtml = '';
        if (car.flags && car.flags.length > 0) {
          badgesHtml = '<div class="badges">';
          car.flags.forEach(flag => {
            badgesHtml += `<div class="badge ${flag.type}">${flag.text}</div>`;
          });
          badgesHtml += '</div>';
        }

        card.innerHTML = `
          <div class="car-title">${car.title || 'Unbekannt'}</div>
          <div class="car-details">
            <div><strong>Preis:</strong> ${car.price || '-'}</div>
            <div><strong>KM:</strong> ${car.mileage || '-'}</div>
            <div><strong>EZ:</strong> ${car.firstRegistration || '-'}</div>
            <div><strong>Standzeit:</strong> ${car.standzeit ? car.standzeit + ' Tage' : '-'}</div>
          </div>
          ${badgesHtml}
          <div class="card-actions">
            <a href="${car.url}" target="_blank" class="btn btn-primary">Zum Inserat ↗</a>
            <button class="btn btn-danger remove-btn" data-id="${car.id}">Entfernen</button>
          </div>
        `;

        container.appendChild(card);
      });

      // Add remove listeners
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          removeCar(id);
        });
      });
    });
  }

  function removeCar(id) {
    chrome.storage.local.get({ savedCars: [] }, (result) => {
      const updatedCars = result.savedCars.filter(c => c.id !== id);
      chrome.storage.local.set({ savedCars: updatedCars }, () => {
        loadCars();
      });
    });
  }
});

const fs = require('fs');
const html = fs.readFileSync('landingpage/index.html', 'utf8');

const headMatch = html.match(/([\s\S]*?)<\/head>/)[1] + '</head>\n<body>';

const navBrand = `
  <nav id="top">
    <div class="nav-container">
      <div class="nav-brand">
        🚘 CarIntel<span>.</span>
      </div>
      <div class="nav-links">
        <a href="index.html" class="link-item">← Zurück zur Übersicht</a>
      </div>
    </div>
  </nav>
`;

const impressumContent = html.match(/(<section id="impressum" class="legal-section">[\s\S]*?<\/section>)/)[1];
const datenschutzContent = html.match(/(<section id="datenschutz" class="legal-section">[\s\S]*?<\/section>)/)[1];

const footer = `
  <footer>
    <div class="container">
      <div class="footer-links">
        <a href="index.html">Startseite</a>
      </div>
      <p class="footer-text">Copyright © 2026 CarIntel. Alle Rechte vorbehalten.</p>
    </div>
  </footer>
</body>
</html>
`;

fs.writeFileSync('landingpage/impressum.html', headMatch + navBrand + '\n<div class="container legal-container" style="padding: 4rem 0;">\n' + impressumContent + '\n</div>\n' + footer);
fs.writeFileSync('landingpage/datenschutz.html', headMatch + navBrand + '\n<div class="container legal-container" style="padding: 4rem 0;">\n' + datenschutzContent + '\n</div>\n' + footer);

let newIndex = html.replace(/<div class="container legal-container">[\s\S]*?<\/div>\s*<!-- Footer -->/, '<!-- Footer -->');
newIndex = newIndex.replace(/href="#datenschutz"/g, 'href="datenschutz.html"');
newIndex = newIndex.replace(/href="#impressum"/g, 'href="impressum.html"');

fs.writeFileSync('landingpage/index.html', newIndex);

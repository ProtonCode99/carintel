const fs = require('fs');

const files = [
  'landingpage/index.html',
  'index.html'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"https:\/\/chromewebstore\.google\.com"/g, '"https://chromewebstore.google.com/detail/koinofhjlhhdhmopedaggflmbadpmpdd"');
  fs.writeFileSync(file, content);
}

console.log('URLs updated successfully.');

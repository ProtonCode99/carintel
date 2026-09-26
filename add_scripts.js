const fs = require('fs');

function addConfigScript(filePath, scriptBefore) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('src="config.js"')) return;
  
  content = content.replace(
    `<script src="${scriptBefore}"></script>`,
    `<script src="config.js"></script>\n  <script src="${scriptBefore}"></script>`
  );
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

addConfigScript('compare.html', 'compare.js');
addConfigScript('popup.html', 'popup.js');

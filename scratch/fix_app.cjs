const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');
// Fix the malformed strings
content = content.replace(/\\\\'M\\\\'/g, "'M'");
content = content.replace(/\\\\'System\\\\'/g, "'System'");
fs.writeFileSync(filePath, content);
console.log('Fixed App.tsx');

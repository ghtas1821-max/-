const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');
// Use string split and join to be absolutely sure
content = content.split("\\'M\\'").join("'M'");
content = content.split("\\'System\\'").join("'System'");
fs.writeFileSync(filePath, content);
console.log('Fixed App.tsx using split/join');

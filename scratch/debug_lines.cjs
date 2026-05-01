const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
console.log('Line 6814:', lines[6813]); // 0-indexed
console.log('Line 6815:', lines[6814]);

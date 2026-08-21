const fs = require('fs');
const path = require('path');
const [, , file, b64] = process.argv;
if (!file || !b64) process.exit(1);
const dlr = path.dirname(file);
if (!fs.existsSync(dlr)) fs.mkdirSync(dlr, { recursive: true });
fs.writeFileSync(file, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
console.log('Successfully wrote: ' + file);
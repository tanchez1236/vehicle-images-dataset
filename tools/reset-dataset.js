const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const folders = [
  path.join(ROOT, 'catalog'),
  path.join(ROOT, 'images'),
  path.join(ROOT, 'imports'),
];

function removeContents(dir) {
  if (!fs.existsSync(dir)) return;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

for (const folder of folders) {
  fs.mkdirSync(folder, { recursive: true });
}

console.log('🗑️ Limpiando dataset...');

removeContents(path.join(ROOT, 'catalog'));
removeContents(path.join(ROOT, 'images'));

console.log('✅ Dataset reiniciado');
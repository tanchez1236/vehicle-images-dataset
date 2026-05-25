#!/usr/bin/env node
/**
 * Script para regenerar data.json escaneando la carpeta images/
 * Uso: node scripts/update-data-json.js
 */
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const DATA_FILE = path.join(__dirname, '..', 'data.json');
const BASE_URL = 'https://raw.githubusercontent.com/tanchez1236/vehicle-images-dataset/main/images';

const VALID_VIEWS = ['default', 'front', 'rear', 'interior'];
const VALID_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function scanVehicles() {
  const vehicles = [];

  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('Carpeta images/ no existe aún');
    return vehicles;
  }

  const makes = fs.readdirSync(IMAGES_DIR).filter(f => {
    const stat = fs.statSync(path.join(IMAGES_DIR, f));
    return stat.isDirectory();
  });

  for (const make of makes) {
    const makeDir = path.join(IMAGES_DIR, make);
    const models = fs.readdirSync(makeDir).filter(f =>
      fs.statSync(path.join(makeDir, f)).isDirectory()
    );

    for (const model of models) {
      const modelDir = path.join(makeDir, model);
      const years = fs.readdirSync(modelDir).filter(f =>
        fs.statSync(path.join(modelDir, f)).isDirectory() && /^\d{4}$/.test(f)
      );

      for (const year of years) {
        const yearDir = path.join(modelDir, model, year);
        const yearDirFull = path.join(modelDir, year);
        const targetDir = fs.existsSync(yearDirFull) ? yearDirFull : null;
        if (!targetDir) continue;

        const files = fs.readdirSync(targetDir).filter(f => {
          const ext = path.extname(f).toLowerCase();
          return VALID_EXTS.includes(ext) && f !== '.gitkeep';
        });

        const views = files
          .map(f => path.basename(f, path.extname(f)))
          .filter(v => VALID_VIEWS.includes(v));

        if (views.length === 0 && files.length === 0) continue;

        const displayMake = make.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const displayModel = model.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        vehicles.push({
          make,
          model,
          year: parseInt(year),
          views: views.length > 0 ? views : files.map(f => path.basename(f, path.extname(f))),
          display: `${displayMake} ${displayModel} ${year}`,
          url: `${BASE_URL}/${make}/${model}/${year}/default.jpg`
        });
      }
    }
  }

  return vehicles.sort((a, b) => {
    const makeComp = a.make.localeCompare(b.make);
    if (makeComp !== 0) return makeComp;
    const modelComp = a.model.localeCompare(b.model);
    if (modelComp !== 0) return modelComp;
    return a.year - b.year;
  });
}

const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const vehicles = scanVehicles();

const updated = {
  ...existing,
  updated: new Date().toISOString().split('T')[0],
  total: vehicles.length,
  vehicles
};

fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2) + '\n');
console.log(`✅ data.json actualizado: ${vehicles.length} vehículos indexados`);

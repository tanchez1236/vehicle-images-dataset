const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const catalogDir = path.join(ROOT, 'catalog');
const imagesDir = path.join(ROOT, 'images');

function slug(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function colorFolderName(name, code) {
  return `${name} [${code}]`
    .replace(/[<>:"/\\|?*]/g, '')
    .trim();
}

function section(title) {
  console.log('');
  console.log('='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

let totalMakes = 0;
let totalModels = 0;
let totalGenerations = 0;
let totalColorReferences = 0;

let imageFolders = 0;
let mainImages = 0;

const generationsWithoutColors = [];
const missingColorDefinitions = [];
const missingFolders = [];
const orphanColors = [];

section('DATASET HEALTH REPORT');

const files = fs
  .readdirSync(catalogDir)
  .filter(f => f.endsWith('.json'))
  .filter(f => f !== 'index.json');

totalMakes = files.length;

for (const file of files) {

  const fullPath = path.join(catalogDir, file);

  try {

    const catalog =
      JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const usedColors = new Set();

    console.log(`\n🏭 ${catalog.make}`);

    totalModels += catalog.models.length;

    for (const model of catalog.models) {

      for (const generation of model.generations) {

        totalGenerations++;

        if (
          !generation.colors ||
          generation.colors.length === 0
        ) {
          generationsWithoutColors.push(
            `${catalog.make} > ${model.name} > ${generation.name}`
          );
        }

        for (const color of generation.colors || []) {

          totalColorReferences++;

          usedColors.add(color.code);

          const colorData =
            catalog.colors[color.code];

          if (!colorData) {

            missingColorDefinitions.push(
              `${catalog.make} > ${model.name} > ${generation.name} > ${color.code}`
            );

            continue;
          }

          const folderPath = path.join(
            imagesDir,
            slug(catalog.make),
            slug(model.name),
            slug(generation.name),
            colorFolderName(
              colorData.name,
              color.code
            )
          );

          imageFolders++;

          if (!fs.existsSync(folderPath)) {
            missingFolders.push(folderPath);
          }

          const mainImage = path.join(
            folderPath,
            'main.webp'
          );

          if (fs.existsSync(mainImage)) {
            mainImages++;
          }
        }
      }
    }

    for (const code of Object.keys(catalog.colors)) {

      if (!usedColors.has(code)) {

        orphanColors.push(
          `${catalog.make} > ${code}`
        );
      }
    }

  } catch (err) {

    console.error(
      `❌ JSON inválido: ${file}`
    );
  }
}

const coverage =
  imageFolders === 0
    ? 0
    : ((mainImages / imageFolders) * 100);

section('RESUMEN');

console.log(`🏭 Marcas: ${totalMakes}`);
console.log(`📦 Modelos: ${totalModels}`);
console.log(`📦 Generaciones: ${totalGenerations}`);
console.log(`🎨 Referencias color: ${totalColorReferences}`);

console.log('');

console.log(`📁 Carpetas OEM: ${imageFolders}`);
console.log(`🖼️ main.webp: ${mainImages}`);

console.log('');

console.log(
  `📊 Cobertura imágenes: ${coverage.toFixed(2)}%`
);

console.log('');

console.log(
  `⚠ Generaciones vacías: ${generationsWithoutColors.length}`
);

console.log(
  `⚠ Colores huérfanos: ${orphanColors.length}`
);

console.log(
  `⚠ Colores sin definición: ${missingColorDefinitions.length}`
);

console.log(
  `⚠ Carpetas faltantes: ${missingFolders.length}`
);

if (generationsWithoutColors.length) {

  section('GENERACIONES SIN COLORES');

  generationsWithoutColors.forEach(x =>
    console.log(`• ${x}`)
  );
}

if (orphanColors.length) {

  section('COLORES HUÉRFANOS');

  orphanColors.forEach(x =>
    console.log(`• ${x}`)
  );
}

if (missingColorDefinitions.length) {

  section('COLORES SIN DEFINICIÓN');

  missingColorDefinitions.forEach(x =>
    console.log(`• ${x}`)
  );
}

if (missingFolders.length) {

  section('CARPETAS FALTANTES');

  missingFolders
    .slice(0, 100)
    .forEach(x => console.log(`• ${x}`));

  if (missingFolders.length > 100) {

    console.log(
      `... y ${missingFolders.length - 100} más`
    );
  }
}

console.log('');

if (
  generationsWithoutColors.length === 0 &&
  orphanColors.length === 0 &&
  missingColorDefinitions.length === 0 &&
  missingFolders.length === 0
) {

  console.log('✅ DATASET SALUDABLE');

} else {

  console.log('⚠ DATASET REQUIERE ATENCIÓN');
}
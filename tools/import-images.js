// tools/import-images.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

const catalogDir = path.join(ROOT, 'catalog');
const imagesDir = path.join(ROOT, 'images');

const importRoot = path.join(
  ROOT,
  'imports',
  'images'
);

const importedDir = path.join(
  importRoot,
  'imported'
);

const failedDir = path.join(
  importRoot,
  'failed'
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

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
  console.log('='.repeat(70));
  console.log(title);
  console.log('='.repeat(70));
}

const stats = {
  processed: 0,
  imported: 0,
  failed: 0,
  skipped: 0,
  converted: 0
};

ensureDir(importedDir);
ensureDir(failedDir);

const catalogFiles = fs
  .readdirSync(catalogDir)
  .filter(f => f.endsWith('.json'))
  .filter(f => f !== 'index.json');

const catalogs = {};

for (const file of catalogFiles) {

  const catalog =
    JSON.parse(
      fs.readFileSync(
        path.join(catalogDir, file),
        'utf8'
      )
    );

  catalogs[
    slug(catalog.make)
  ] = catalog;
}

section('IMPORTADOR DE IMÁGENES OEM');

for (const makeFolder of fs.readdirSync(importRoot)) {

  const makePath =
    path.join(importRoot, makeFolder);

  if (!fs.statSync(makePath).isDirectory()) {
    continue;
  }

  if (
    makeFolder === 'imported' ||
    makeFolder === 'failed'
  ) {
    continue;
  }

  const makeSlug = slug(makeFolder);

  const catalog =
    catalogs[makeSlug];

  if (!catalog) {

    console.log('');
    console.log(
      `❌ Marca sin catálogo: ${makeFolder}`
    );

    continue;
  }

  section(`MARCA: ${catalog.make}`);

  const files = fs.readdirSync(makePath);

  for (const file of files) {

    stats.processed++;

    try {

      const fullFile =
        path.join(makePath, file);

      if (
        !fs.statSync(fullFile).isFile()
      ) {
        continue;
      }

      const ext =
        path.extname(file);

      const parsed =
        path.basename(file, ext);

      const parts =
        parsed.split('__');

      if (parts.length !== 3) {

        throw new Error(
          'Nombre inválido. Debe ser modelo__generacion__codigo.ext'
        );
      }

      const [
        modelName,
        generationName,
        colorCodeRaw
      ] = parts;

      const colorCode =
        colorCodeRaw.toUpperCase();

      let targetModel = null;
      let targetGeneration = null;

      for (const model of catalog.models) {

        if (
          slug(model.name) === slug(modelName)
        ) {

          targetModel = model;

          break;
        }
      }

      if (!targetModel) {

        throw new Error(
          `Modelo no encontrado: ${modelName}`
        );
      }

      for (
        const generation
        of targetModel.generations
      ) {

        if (
          slug(generation.name)
          === slug(generationName)
        ) {

          targetGeneration =
            generation;

          break;
        }
      }

      if (!targetGeneration) {

        throw new Error(
          `Generación no encontrada: ${generationName}`
        );
      }

      const colorRef =
        targetGeneration.colors.find(
          c => c.code.toUpperCase()
            === colorCode
        );

      if (!colorRef) {

        throw new Error(
          `Color OEM no encontrado: ${colorCode}`
        );
      }

      const colorInfo =
        catalog.colors[colorCode];

      if (!colorInfo) {

        throw new Error(
          `Definición faltante para ${colorCode}`
        );
      }

      const destinationFolder =
        path.join(
          imagesDir,
          makeSlug,
          slug(targetModel.name),
          slug(targetGeneration.name),
          colorFolderName(
            colorInfo.name,
            colorCode
          )
        );

      ensureDir(destinationFolder);

      const destinationImage =
        path.join(
          destinationFolder,
          'main.webp'
        );

      console.log('');
      console.log(
        `📸 ${file}`
      );

      console.log(
        `   Modelo: ${targetModel.name}`
      );

      console.log(
        `   Generación: ${targetGeneration.name}`
      );

      console.log(
        `   Color: ${colorInfo.name} (${colorCode})`
      );

      console.log(
        `   Destino:`
      );

      console.log(
        `   ${destinationImage}`
      );

      if (
        fs.existsSync(
          destinationImage
        )
      ) {

        console.log(
          '   ⚠ main.webp ya existe'
        );

        stats.skipped++;

        const importedTarget =
          path.join(
            importedDir,
            file
          );

        fs.renameSync(
          fullFile,
          importedTarget
        );

        continue;
      }

      await sharp(fullFile)
        .webp({
          quality: 90
        })
        .toFile(
          destinationImage
        );

      stats.converted++;

      const importedTarget =
        path.join(
          importedDir,
          file
        );

      fs.renameSync(
        fullFile,
        importedTarget
      );

      console.log(
        '   ✅ Importada correctamente'
      );

      stats.imported++;

    } catch (error) {

      stats.failed++;

      console.log('');
      console.log(
        `❌ Error: ${file}`
      );

      console.log(
        `   ${error.message}`
      );

      try {

        const source =
          path.join(
            makePath,
            file
          );

        const target =
          path.join(
            failedDir,
            file
          );

        if (
          fs.existsSync(source)
        ) {

          fs.renameSync(
            source,
            target
          );
        }

      } catch {}

    }

  }

}

section('RESUMEN');

console.log(
  `📁 Archivos procesados: ${stats.processed}`
);

console.log(
  `✅ Importados: ${stats.imported}`
);

console.log(
  `🔄 Convertidos a WebP: ${stats.converted}`
);

console.log(
  `⚠ Omitidos: ${stats.skipped}`
);

console.log(
  `❌ Fallidos: ${stats.failed}`
);

console.log('');

if (stats.failed === 0) {

  console.log(
    '✅ PROCESO COMPLETADO SIN ERRORES'
  );

} else {

  console.log(
    '⚠ REVISAR CARPETA failed'
  );

}
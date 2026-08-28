const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const catalogDir = path.join(ROOT, 'catalog');

function section(title) {
  console.log('');
  console.log('='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function selectFromList(title, items, displayFn) {

  section(title);

  items.forEach((item, index) => {

    const label = displayFn
      ? displayFn(item)
      : item;

    console.log(
      `[${index + 1}] ${label}`
    );

  });

  console.log('');

  const answer =
    await ask('Seleccione opción: ');

  const selected =
    parseInt(answer, 10) - 1;

  if (
    isNaN(selected) ||
    selected < 0 ||
    selected >= items.length
  ) {

    console.log('');
    console.log('❌ Selección inválida');

    process.exit(1);
  }

  return items[selected];
}

(async () => {

  const catalogFiles = fs
    .readdirSync(catalogDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => file !== 'index.json')
    .sort();

  if (catalogFiles.length === 0) {

    console.log('❌ No hay catálogos disponibles');

    process.exit(1);
  }

  const brands =
    catalogFiles.map(file => ({
      name: path.basename(file, '.json'),
      file
    }));

  const brand =
    await selectFromList(
      'MARCAS DISPONIBLES',
      brands,
      item => item.name
    );

  const catalog = JSON.parse(
    fs.readFileSync(
      path.join(
        catalogDir,
        brand.file
      ),
      'utf8'
    )
  );

  const model =
    await selectFromList(
      `${catalog.make.toUpperCase()} - MODELOS`,
      catalog.models,
      item => item.name
    );

  const generation =
    await selectFromList(
      `${model.name.toUpperCase()} - GENERACIONES`,
      model.generations,
      item =>
        `${item.name} (${item.years.from}-${item.years.to})`
    );

  section(
    `${catalog.make.toUpperCase()} > ${model.name.toUpperCase()} > ${generation.name.toUpperCase()}`
  );

  console.log(
    `${generation.years.from}-${generation.years.to}`
  );

  console.log('');

  generation.colors.forEach(colorRef => {

    const color =
      catalog.colors[colorRef.code];

    const name =
      color?.name || 'DESCONOCIDO';

    console.log(
      `${colorRef.code} - ${name}`
    );

  });

  console.log('');
  console.log(
    `Total colores: ${generation.colors.length}`
  );

})();
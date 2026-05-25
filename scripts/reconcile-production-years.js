#!/usr/bin/env node
/*
 * Ajusta años por modelo usando fuentes públicas:
 * 1) Wikidata (inicio/fin de producción global)
 * 2) NHTSA vPIC (fallback por año en mercado US)
 *
 * Luego recorta/crea carpetas images/{make}/{model}/{year} y actualiza data.json.
 */

const fs = require('fs');
const path = require('path');

const START_BOUND = 1991;
const END_BOUND = 2026;
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data.json');
const imagesRoot = path.join(root, 'images');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function toNumberYear(timeLike) {
  if (!timeLike) return null;
  const m = String(timeLike).match(/([12][0-9]{3})/);
  if (!m) return null;
  const y = Number(m[1]);
  if (!Number.isFinite(y)) return null;
  return y;
}

function clampRange(from, to) {
  let f = Number(from);
  let t = Number(to);
  if (!Number.isFinite(f)) f = START_BOUND;
  if (!Number.isFinite(t)) t = END_BOUND;
  f = Math.max(START_BOUND, f);
  t = Math.min(END_BOUND, t);
  if (f > t) return { from: START_BOUND, to: END_BOUND };
  return { from: f, to: t };
}

async function fetchJson(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'MotorSeguro/1.0 (vehicle-images-dataset)' }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

async function getWikidataRange(makeDisplay, modelDisplay) {
  const queries = [
    `${makeDisplay} ${modelDisplay} automobile`,
    `${makeDisplay} ${modelDisplay} car`,
    `${makeDisplay} ${modelDisplay}`
  ];

  let entityId = null;

  for (const q of queries) {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=8&search=${encodeURIComponent(q)}`;
    const search = await fetchJson(searchUrl);
    const results = Array.isArray(search.search) ? search.search : [];

    const best = results.find((item) => {
      const d = String(item.description || '').toLowerCase();
      const l = String(item.label || '').toLowerCase();
      return d.includes('automobile') || d.includes('car model') || d.includes('pickup truck') || l.includes(String(modelDisplay).toLowerCase());
    });

    if (best && best.id) {
      entityId = best.id;
      break;
    }
  }

  if (!entityId) return null;

  const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${encodeURIComponent(entityId)}&props=claims`;
  const entity = await fetchJson(entityUrl);
  const claims = entity?.entities?.[entityId]?.claims || {};

  const readTimeClaim = (prop) => {
    const arr = claims[prop];
    if (!Array.isArray(arr) || !arr.length) return null;
    const val = arr[0]?.mainsnak?.datavalue?.value;
    if (typeof val === 'string') return val;
    if (val && typeof val.time === 'string') return val.time;
    return null;
  };

  const inception = toNumberYear(readTimeClaim('P571'));   // inception
  const start = toNumberYear(readTimeClaim('P2031'));       // work period start
  const dissolved = toNumberYear(readTimeClaim('P576'));    // dissolved
  const end = toNumberYear(readTimeClaim('P2032'));         // work period end

  const from = inception || start;
  let to = end || dissolved;
  if (!to) to = END_BOUND;

  if (!from) return null;
  return clampRange(from, to);
}

async function buildNhtsaMatrix(makeNames) {
  const matrix = new Map();

  for (const makeName of makeNames) {
    const byYear = new Map();
    for (let year = START_BOUND; year <= END_BOUND; year += 1) {
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(makeName)}/modelyear/${year}?format=json`;
      try {
        const data = await fetchJson(url);
        const items = Array.isArray(data?.Results) ? data.Results : [];
        const set = new Set(items.map((it) => normalize(it.Model_Name)));
        byYear.set(year, set);
      } catch {
        byYear.set(year, new Set());
      }
      await sleep(70);
    }
    matrix.set(makeName, byYear);
  }

  return matrix;
}

function buildNhtsaRange(byYearSet, modelDisplay) {
  const key = normalize(modelDisplay);
  const years = [];

  for (let year = START_BOUND; year <= END_BOUND; year += 1) {
    const set = byYearSet.get(year) || new Set();
    let found = false;

    if (set.has(key)) {
      found = true;
    } else {
      for (const candidate of set) {
        if (!candidate) continue;
        if (candidate.includes(key) || key.includes(candidate)) {
          found = true;
          break;
        }
      }
    }

    if (found) years.push(year);
  }

  if (!years.length) return null;
  return { from: years[0], to: years[years.length - 1] };
}

// Overrides explícitos para casos conocidos donde las APIs suelen fallar o arrancan tarde.
const MANUAL_OVERRIDES = {
  'acura/rdx': { from: 2007 },
  'acura/tlx': { from: 2015 },
  'audi/a3': { from: 1996 },
  'audi/a4': { from: 1994 },
  'audi/q3': { from: 2011 },
  'audi/q5': { from: 2008 },
  'audi/q7': { from: 2005 },
  'bmw/x1': { from: 2009 },
  'bmw/x3': { from: 2003 },
  'bmw/x5': { from: 1999 },
  'byd/f3': { from: 2005 },
  'byd/seal': { from: 2022 },
  'changan/alsvin': { from: 2009 },
  'chery/arrizo-5': { from: 2016 },
  'chevrolet/captiva': { from: 2006 },
  'chevrolet/colorado': { from: 2003 },
  'chevrolet/equinox': { from: 2004 },
  'chevrolet/silverado': { from: 1999 },
  'chevrolet/spark': { from: 1998 },
  'chevrolet/tahoe': { from: 1995 },
  'chevrolet/trailblazer': { from: 2001 },
  'chevrolet/traverse': { from: 2008 },
  'citroen/berlingo': { from: 1996 },
  'citroen/c3': { from: 2002 },
  'citroen/c4': { from: 2004 },
  'dodge/charger': { from: 2006 },
  'dodge/durango': { from: 1998 },
  'dodge/journey': { from: 2008 },
  'dodge/ram-1500': { from: 1994 },
  'dongfeng/sx5': { from: 2016 },
  'fiat/mobi': { from: 2016 },
  'fiat/palio': { from: 1996 },
  'fiat/pulse': { from: 2021 },
  'fiat/strada': { from: 1998 },
  'ford/bronco-sport': { from: 2020 },
  'ford/escape': { from: 2000 },
  'ford/focus': { from: 1998 },
  'foton/view': { from: 2003 },
  'geely/emgrand': { from: 2009 },
  'gmc/canyon': { from: 2004 },
  'gmc/terrain': { from: 2009 },
  'gmc/yukon': { from: 1992 },
  'great-wall/poer': { from: 2019 },
  'haval/h6': { from: 2011 },
  'honda/city': { from: 1996 },
  'honda/cr-v': { from: 1995 },
  'honda/fit': { from: 2001 },
  'honda/hr-v': { from: 1998 },
  'honda/odyssey': { from: 1994 },
  'honda/pilot': { from: 2002 },
  'honda/ridgeline': { from: 2005 },
  'hyundai/accent': { from: 1994 },
  'hyundai/grand-i10': { from: 2013 },
  'hyundai/h1': { from: 1997 },
  'hyundai/kona': { from: 2017 },
  'hyundai/santa-fe': { from: 2000 },
  'hyundai/tucson': { from: 2004 },
  'isuzu/d-max': { from: 2002 },
  'isuzu/mu-x': { from: 2013 },
  'jac/j7': { from: 2019 },
  'jac/s2': { from: 2015 },
  'jac/s3': { from: 2013 },
  'jeep/compass': { from: 2007 },
  'jeep/grand-cherokee': { from: 1992 },
  'jeep/renegade': { from: 2014 },
  'kia/cerato': { from: 2003 },
  'kia/forte': { from: 2008 },
  'kia/rio': { from: 1999 },
  'kia/sorento': { from: 2002 },
  'kia/sportage': { from: 1993 },
  'land-rover/range-rover-evoque': { from: 2011 },
  'land-rover/range-rover-sport': { from: 2005 },
  'lexus/gx': { from: 2002 },
  'lexus/lx': { from: 1995 },
  'lexus/nx': { from: 2014 },
  'lexus/rx': { from: 1998 },
  'mahindra/scorpio': { from: 2002 },
  'mazda/2': { from: 2002 },
  'mazda/3': { from: 2003 },
  'mazda/6': { from: 2002 },
  'mazda/bt-50': { from: 2006 },
  'mazda/cx-3': { from: 2014 },
  'mazda/cx-30': { from: 2019 },
  'mazda/cx-5': { from: 2012 },
  'mazda/cx-9': { from: 2006 },
  'mercedes-benz/a-class': { from: 1997 },
  'mercedes-benz/c-class': { from: 1993 },
  'mercedes-benz/glc': { from: 2015 },
  'mercedes-benz/gle': { from: 2015 },
  'mercedes-benz/sprinter': { from: 1995 },
  'mg/mg5': { from: 2012 },
  'mg/zs': { from: 2017 },
  'mitsubishi/outlander': { from: 2001 },
  'mitsubishi/pajero-sport': { from: 1996 },
  'nissan/altima': { from: 1992 },
  'nissan/frontier': { from: 1997 },
  'nissan/kicks': { from: 2016 },
  'nissan/pathfinder': { from: 1991 },
  'nissan/qashqai': { from: 2006 },
  'nissan/versa': { from: 2006 },
  'nissan/x-trail': { from: 2000 },
  'peugeot/206': { from: 1998 },
  'peugeot/207': { from: 2006 },
  'peugeot/208': { from: 2012 },
  'peugeot/3008': { from: 2008 },
  'peugeot/partner': { from: 1996 },
  'ram/1500': { from: 1994 },
  'renault/duster': { from: 2010 },
  'renault/koleos': { from: 2007 },
  'renault/logan': { from: 2004 },
  'renault/oroch': { from: 2015 },
  'renault/sandero': { from: 2007 },
  'renault/stepway': { from: 2008 },
  'seat/ateca': { from: 2016 },
  'seat/leon': { from: 1999 },
  'subaru/forester': { from: 1997 },
  'subaru/impreza': { from: 1992 },
  'subaru/outback': { from: 1994 },
  'subaru/xv': { from: 2011 },
  'suzuki/baleno': { from: 1995 },
  'suzuki/ciaz': { from: 2014 },
  'suzuki/ertiga': { from: 2012 },
  'suzuki/grand-vitara': { from: 1998 },
  'toyota/yaris': { from: 1999 },
  'toyota/rav4': { from: 1994 },
  'toyota/fortuner': { from: 2004 },
  'toyota/innova': { from: 2004 },
  'toyota/prado': { from: 1991 },
  'toyota/agya': { from: 2013 },
  'toyota/raize': { from: 2019 },
  'toyota/avanza': { from: 2003 },
  'mitsubishi/mirage': { from: 1991 },
  'mitsubishi/asx': { from: 2010 },
  'mitsubishi/xpander': { from: 2017 },
  'nissan/navara': { from: 1997 },
  'nissan/np300': { from: 2008 },
  'hyundai/creta': { from: 2014 },
  'hyundai/venue': { from: 2019 },
  'kia/picanto': { from: 2004 },
  'kia/seltos': { from: 2019 },
  'kia/sonet': { from: 2020 },
  'kia/carens': { from: 1999 },
  'chevrolet/aveo': { from: 2002 },
  'ford/ecosport': { from: 2003 },
  'ford/everest': { from: 2003 },
  'volkswagen/amarok': { from: 2010 },
  'volkswagen/taos': { from: 2020 },
  'volkswagen/tiguan': { from: 2007 },
  'volkswagen/saveiro': { from: 1991 },
  'suzuki/s-presso': { from: 2019 },
  'subaru/crosstrek': { from: 2012 },
  'ram/700': { from: 2014 },
  'peugeot/2008': { from: 2013 },
  'chery/tiggo-2': { from: 2016 },
  'chery/tiggo-4': { from: 2017 },
  'chery/tiggo-7': { from: 2016 },
  'great-wall/wingle-5': { from: 2009 },
  'haval/jolion': { from: 2020 },
  'jac/t6': { from: 2015 },
  'changan/cs35': { from: 2012 },
  'changan/cs55': { from: 2017 },
  'baic/x35': { from: 2016 },
  'baic/x55': { from: 2022 },
  'byd/song-pro': { from: 2019 },
  'byd/yuan-plus': { from: 2021 },
  'mg/rx5': { from: 2016 },
  'geely/coolray': { from: 2018 },
  'geely/gx3-pro': { from: 2020 },
  'dongfeng/rich-6': { from: 2018 },
  'mahindra/pik-up': { from: 2008 },
  'foton/tunland': { from: 2011 }
};

function mergeRanges(primary, secondary, key) {
  const manual = MANUAL_OVERRIDES[key] || null;
  let out = primary || secondary || { from: START_BOUND, to: END_BOUND };

  if (manual?.from) out.from = manual.from;
  if (manual?.to) out.to = manual.to;

  return clampRange(out.from, out.to);
}

function ensureYearDir(make, model, year) {
  const dir = path.join(imagesRoot, make, model, String(year));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const keep = path.join(dir, '.gitkeep');
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
}

function pruneYearDirs(make, model, range) {
  const modelDir = path.join(imagesRoot, make, model);
  if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });

  let removed = 0;
  for (const entry of fs.readdirSync(modelDir)) {
    const full = path.join(modelDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (!/^\d{4}$/.test(entry)) continue;
    const y = Number(entry);
    if (y < range.from || y > range.to) {
      fs.rmSync(full, { recursive: true, force: true });
      removed += 1;
    }
  }

  let ensured = 0;
  for (let y = range.from; y <= range.to; y += 1) {
    ensureYearDir(make, model, y);
    ensured += 1;
  }

  return { removed, ensured };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const catalog = Array.isArray(data.catalog) ? data.catalog : [];
  const skipNhtsa = process.argv.includes('--skip-nhtsa');

  // dedupe por make/model
  const items = [];
  const seen = new Set();
  for (const c of catalog) {
    const make = c.make;
    const model = c.model;
    const key = `${make}/${model}`;
    if (!make || !model || seen.has(key)) continue;
    seen.add(key);
    items.push({
      make,
      model,
      makeDisplay: c.make_display || make,
      modelDisplay: c.model_display || model
    });
  }

  const makeToApiName = new Map();
  for (const item of items) {
    // Algunas marcas funcionan mejor con alias en vPIC.
    let apiMake = item.makeDisplay;
    if (item.make === 'mercedes-benz') apiMake = 'mercedes-benz';
    if (item.make === 'great-wall') apiMake = 'great wall';
    makeToApiName.set(item.make, apiMake);
  }

  const uniqueApiMakes = Array.from(new Set(Array.from(makeToApiName.values())));
  const nhtsa = skipNhtsa ? new Map() : await buildNhtsaMatrix(uniqueApiMakes);

  const byKey = new Map();
  let removedTotal = 0;
  let ensuredTotal = 0;

  let idx = 0;
  for (const item of items) {
    idx += 1;
    const key = `${item.make}/${item.model}`;

    let wikidataRange = null;
    try {
      wikidataRange = await getWikidataRange(item.makeDisplay, item.modelDisplay);
    } catch {
      wikidataRange = null;
    }

    const apiMake = makeToApiName.get(item.make);
    const nhtsaRange = skipNhtsa ? null : buildNhtsaRange(nhtsa.get(apiMake) || new Map(), item.modelDisplay);

    const finalRange = mergeRanges(wikidataRange, nhtsaRange, key);
    byKey.set(key, finalRange);

    const { removed, ensured } = pruneYearDirs(item.make, item.model, finalRange);
    removedTotal += removed;
    ensuredTotal += ensured;

    if (idx % 25 === 0 || idx === items.length) {
      console.log(`[progress] ${idx}/${items.length}`);
    }

    await sleep(35);
  }

  const updatedCatalog = catalog.map((c) => {
    const key = `${c.make}/${c.model}`;
    const yrs = byKey.get(key);
    if (!yrs) return c;
    return {
      ...c,
      years: { from: yrs.from, to: yrs.to }
    };
  });

  const totalYearDirs = updatedCatalog.reduce((acc, c) => {
    const from = c?.years?.from;
    const to = c?.years?.to;
    if (!Number.isFinite(from) || !Number.isFinite(to)) return acc;
    return acc + (to - from + 1);
  }, 0);

  const next = {
    ...data,
    version: '1.3.0',
    updated: '2026-05-24',
    years_covered: { from: START_BOUND, to: END_BOUND },
    catalog: updatedCatalog,
    total_year_folders: totalYearDirs
  };

  fs.writeFileSync(dataPath, JSON.stringify(next, null, 2) + '\n', 'utf8');

  console.log(JSON.stringify({
    models: items.length,
    skipNhtsa,
    removedYearDirs: removedTotal,
    ensuredYearDirs: ensuredTotal,
    totalYearDirs
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const MAKES = {
  'toyota': ['corolla','yaris','camry','rav4','fortuner','hilux','land-cruiser','prado','4runner','innova','agya','raize','avanza'],
  'honda': ['civic','cr-v','accord','pilot','hr-v','fit','city','odyssey','ridgeline'],
  'mitsubishi': ['galant','lancer','mirage','outlander','l200','montero','eclipse','asx','pajero-sport','xpander'],
  'nissan': ['frontier','navara','x-trail','sentra','altima','pathfinder','march','kicks','versa','patrol','qashqai','np300'],
  'hyundai': ['tucson','santa-fe','elantra','accent','sonata','creta','grand-i10','h1','venue','kona'],
  'kia': ['sportage','sorento','forte','rio','picanto','seltos','sonet','carens','cerato'],
  'chevrolet': ['silverado','traverse','trailblazer','colorado','equinox','tahoe','spark','captiva','tracker','aveo'],
  'ford': ['ranger','f-150','escape','explorer','ecosport','focus','everest','bronco-sport'],
  'volkswagen': ['golf','jetta','tiguan','polo','passat','amarok','taos','saveiro'],
  'mazda': ['cx-5','3','6','cx-3','bt-50','cx-30','cx-9','2'],
  'suzuki': ['vitara','grand-vitara','swift','jimny','ertiga','s-presso','ciaz','baleno'],
  'jeep': ['wrangler','grand-cherokee','compass','cherokee','renegade'],
  'subaru': ['outback','forester','impreza','xv','crosstrek'],
  'bmw': ['serie-3','serie-5','x3','x5','x1'],
  'isuzu': ['d-max','mu-x','trooper'],
  'land-rover': ['defender','discovery','range-rover-evoque','range-rover-sport'],
  'renault': ['duster','sandero','logan','koleos','stepway','oroch'],
  'mercedes-benz': ['c-class','e-class','glc','gle','sprinter','a-class'],
  'audi': ['a3','a4','q3','q5','q7'],
  'lexus': ['rx','nx','gx','lx','es'],
  'acura': ['mdx','rdx','tlx'],
  'ram': ['1500','2500','700'],
  'gmc': ['sierra','terrain','yukon','canyon'],
  'dodge': ['durango','journey','ram-1500','charger'],
  'peugeot': ['206','207','208','2008','3008','partner'],
  'fiat': ['palio','strada','uno','mobi','pulse'],
  'citroen': ['c3','c4','berlingo'],
  'seat': ['ibiza','leon','ateca'],
  'chery': ['tiggo-2','tiggo-4','tiggo-7','arrizo-5'],
  'great-wall': ['wingle-5','poer'],
  'haval': ['h6','jolion'],
  'jac': ['t6','s2','s3','j7'],
  'changan': ['cs35','cs55','alsvin'],
  'baic': ['x35','x55'],
  'byd': ['f3','song-pro','yuan-plus','seal'],
  'mg': ['zs','rx5','mg5'],
  'geely': ['coolray','gx3-pro','emgrand'],
  'dongfeng': ['rich-6','sx5'],
  'mahindra': ['pik-up','scorpio'],
  'foton': ['tunland','view']
};

const MAKE_DISPLAY = {
  'mercedes-benz': 'Mercedes-Benz',
  'land-rover': 'Land Rover',
  'great-wall': 'Great Wall'
};

const MODEL_DISPLAY = {
  '4runner': '4Runner',
  'rav4': 'RAV4',
  'cr-v': 'CR-V',
  'hr-v': 'HR-V',
  'x-trail': 'X-Trail',
  'grand-i10': 'Grand i10',
  'h1': 'H1',
  'cx-5': 'CX-5',
  'cx-3': 'CX-3',
  'cx-30': 'CX-30',
  'cx-9': 'CX-9',
  'bt-50': 'BT-50',
  's-presso': 'S-Presso',
  'c-class': 'C-Class',
  'e-class': 'E-Class',
  'a-class': 'A-Class',
  'q3': 'Q3',
  'q5': 'Q5',
  'q7': 'Q7',
  'rx': 'RX',
  'nx': 'NX',
  'gx': 'GX',
  'lx': 'LX',
  'es': 'ES',
  'mdx': 'MDX',
  'rdx': 'RDX',
  'tlx': 'TLX',
  'tiggo-2': 'Tiggo 2',
  'tiggo-4': 'Tiggo 4',
  'tiggo-7': 'Tiggo 7',
  'arrizo-5': 'Arrizo 5',
  'wingle-5': 'Wingle 5',
  'h6': 'H6',
  't6': 'T6',
  's2': 'S2',
  's3': 'S3',
  'j7': 'J7',
  'cs35': 'CS35',
  'cs55': 'CS55',
  'x35': 'X35',
  'x55': 'X55',
  'f3': 'F3',
  'song-pro': 'Song Pro',
  'yuan-plus': 'Yuan Plus',
  'zs': 'ZS',
  'rx5': 'RX5',
  'mg5': 'MG5',
  'gx3-pro': 'GX3 Pro',
  'rich-6': 'Rich 6',
  'sx5': 'SX5',
  'pik-up': 'Pik-Up',
  'np300': 'NP300',
  'mu-x': 'MU-X',
  'd-max': 'D-Max',
  'glc': 'GLC',
  'gle': 'GLE',
  'sprinter': 'Sprinter',
  'grand-cherokee': 'Grand Cherokee',
  'ram-1500': 'Ram 1500',
  'range-rover-evoque': 'Range Rover Evoque',
  'range-rover-sport': 'Range Rover Sport',
  'pajero-sport': 'Pajero Sport',
  'grand-vitara': 'Grand Vitara',
  'f-150': 'F-150'
};

const years = Array.from({ length: 36 }, (_, i) => 1991 + i);
const baseUrl = 'https://raw.githubusercontent.com/tanchez1236/vehicle-images-dataset/main/images';
const root = path.resolve(__dirname, '..');
const imagesRoot = path.join(root, 'images');
const dataFile = path.join(root, 'data.json');

function titleCase(value) {
  return value
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

let created = 0;
for (const [make, models] of Object.entries(MAKES)) {
  for (const model of models) {
    for (const year of years) {
      const dir = path.join(imagesRoot, make, model, String(year));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, '.gitkeep'), '');
        created += 1;
      } else {
        const gitkeepPath = path.join(dir, '.gitkeep');
        if (!fs.existsSync(gitkeepPath)) {
          fs.writeFileSync(gitkeepPath, '');
        }
      }
    }
  }
}

const catalog = [];
for (const [make, models] of Object.entries(MAKES)) {
  for (const model of models) {
    catalog.push({
      make,
      make_display: MAKE_DISPLAY[make] || titleCase(make),
      model,
      model_display: MODEL_DISPLAY[model] || titleCase(model),
      years: { from: 1991, to: 2026 },
      url_pattern: `${baseUrl}/${make}/${model}/{year}/default.jpg`
    });
  }
}

catalog.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

const payload = {
  version: '1.2.0',
  updated: '2026-05-24',
  base_url: baseUrl,
  placeholder_url: 'https://raw.githubusercontent.com/tanchez1236/vehicle-images-dataset/main/placeholders/default.jpg',
  total_makes: Object.keys(MAKES).length,
  total_models: catalog.length,
  years_covered: { from: 1991, to: 2026 },
  focus_market: 'Guatemala',
  catalog
};

fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({
  created,
  totalMakes: payload.total_makes,
  totalModels: payload.total_models,
  totalYearDirs: payload.total_models * years.length
}, null, 2));

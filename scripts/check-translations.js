const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../messages/en.json'), 'utf-8'));

function collectKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const val = obj[k];
    const path = prefix ? `${prefix}.${k}` : k;
    // record key itself regardless of type
    keys.push(path);
    if (typeof val === 'object' && val !== null) {
      keys = keys.concat(collectKeys(val, path));
    }
  }
  return keys;
}

const defined = new Set(collectKeys(en));

function findUsedKeys(dir) {
  const files = fs.readdirSync(dir);
  let used = [];
  files.forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      used = used.concat(findUsedKeys(full));
    } else if (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.js')) {
      const txt = fs.readFileSync(full, 'utf-8');
      // capture calls like t('key'), tCommon('key'), tAccounts('key'), etc.
      const regex = /(t(?:Common|Accounts|Contacts|Deals|Users|Projects|Services|Reports)?)\('([^']+)'/g;
      let m;
      while ((m = regex.exec(txt)) !== null) {
        const helper = m[1];
        let key = m[2];
        if (helper !== 't') {
          // derive namespace from helper name
          // tCommon -> common, tAccounts -> accounts, etc.
          const ns = helper.replace(/^t/, '').toLowerCase();
          key = `${ns}.${key}`;
        }
        used.push(key);
      }
    }
  });
  return used;
}

const usedKeys = findUsedKeys(path.resolve(__dirname, '../app'));
const missing = usedKeys.filter(k => {
  if (defined.has(k)) return false;
  // ignore obviously invalid tokens
  if (!/^[A-Za-z0-9_.]+$/.test(k)) return false;
  // filter out single letter tokens
  if (k.length <= 1) return false;
  return true;
});

const uniqMissing = [...new Set(missing)].sort();
console.log('Total used keys:', usedKeys.length);
console.log('Unique missing keys:', uniqMissing);

// if run with --write, append missing keys to en/fr/ar with placeholder values
if (process.argv.includes('--write')) {
  const locales = ['en', 'fr', 'ar'];
  for (const loc of locales) {
    const filePath = path.resolve(__dirname, `../messages/${loc}.json`);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let changed = false;
    uniqMissing.forEach(key => {
      const parts = key.split('.');
      let obj = json;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]] || typeof obj[parts[i]] === 'string') {
          obj[parts[i]] = {};
          changed = true;
        }
        obj = obj[parts[i]];
      }
      const last = parts[parts.length - 1];
      if (obj[last] === undefined) {
        obj[last] = key; // placeholder
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
      console.log(`Updated ${loc}.json with ${uniqMissing.length} keys`);
    } else {
      console.log(`${loc}.json already contains all keys`);
    }
  }
}

if (process.argv.includes('--clean')) {
  const locales = ['en', 'fr', 'ar'];
  locales.forEach(loc => {
    const filePath = path.resolve(__dirname, `../messages/${loc}.json`);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    function cleanup(obj) {
      if (typeof obj !== 'object' || obj === null) return obj;
      for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'object') {
          obj[k] = cleanup(obj[k]);
        }
        if (obj[k] === k) {
          delete obj[k];
        }
      }
      return obj;
    }
    cleanup(json);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
    console.log(`Cleaned placeholders from ${loc}.json`);
  });
}


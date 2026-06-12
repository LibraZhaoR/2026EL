const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'acbce3442afa6bf6251bc8014a1594b8';
const BASE = 'https://restapi.amap.com/v3';

function geocode(address) {
  return new Promise((resolve, reject) => {
    const url = `${BASE}/geocode/geo?key=${API_KEY}&address=${encodeURIComponent(address)}&city=南京`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === '1' && json.geocodes && json.geocodes.length > 0) {
            const loc = json.geocodes[0].location.split(',');
            resolve({ lng: parseFloat(loc[0]), lat: parseFloat(loc[1]), formatted: json.geocodes[0].formatted_address || '', level: json.geocodes[0].level || '' });
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load current landmarks
const landmarksPath = path.join(__dirname, '..', '交互代码', '主app代码', '2026EL-main', 'src', 'main', 'resources', 'static', 'app', 'landmarks-data.js');
const raw = fs.readFileSync(landmarksPath, 'utf8');
// Extract JSON array
const match = raw.match(/window\.NANJING_LANDMARKS = (\[[\s\S]*?\]);/);
if (!match) { console.log('Failed to parse'); process.exit(1); }
const landmarks = JSON.parse(match[1]);

console.log(`Loaded ${landmarks.length} landmarks. Starting geocoding...`);

async function run() {
  let updated = 0;
  let failed = [];

  for (let i = 0; i < landmarks.length; i++) {
    const l = landmarks[i];
    const query = `${l.name} 南京`;
    process.stdout.write(`[${i+1}/${landmarks.length}] ${l.name}... `);

    const result = await geocode(query);
    if (result && result.lng && result.lat) {
      const oldLng = l.lng;
      const oldLat = l.lat;
      l.lng = result.lng;
      l.lat = result.lat;
      l.address = l.address || result.formatted || '';

      const dist = Math.sqrt(Math.pow(result.lng - oldLng, 2) + Math.pow(result.lat - oldLat, 2)) * 111000;
      if (dist > 200) {
        console.log(`UPDATED (${dist.toFixed(0)}m moved) -> [${result.lng}, ${result.lat}] ${result.level}`);
        updated++;
      } else {
        console.log(`OK (close enough, ${dist.toFixed(0)}m)`);
      }
    } else {
      console.log('FAILED - keeping original coords');
      failed.push(l.name);
    }
    await sleep(150); // Rate limit: ~7 req/s
  }

  console.log(`\nUpdated: ${updated}, Failed: ${failed.length}`);
  if (failed.length) console.log('Failed:', failed);

  // Write updated data
  const newData = '// ══════════════════════════════════════════\n' +
    '//  Nanjing Landmarks Data\n' +
    '//  南京景点数据库 - 坐标已通过高德API精确校准\n' +
    '//  Total: ' + landmarks.length + ' landmarks\n' +
    '//  Updated: ' + new Date().toISOString().split('T')[0] + '\n' +
    '// ══════════════════════════════════════════\n' +
    'window.NANJING_LANDMARKS = ' + JSON.stringify(landmarks, null, 2) + ';\n' +
    '\n' +
    raw.substring(raw.indexOf('// Helper: merge landmarks'));
  fs.writeFileSync(landmarksPath, newData, 'utf8');
  console.log('Written to:', landmarksPath);
}

run().catch(console.error);

const https = require('https');
const fs = require('fs');
const path = require('path');

function geocodeOSM(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=zh`;
    const opts = { headers: { 'User-Agent': 'NanjingLandmarksGeocoder/1.0' } };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const arr = JSON.parse(data);
          if (arr.length > 0) {
            resolve({ lng: parseFloat(arr[0].lon), lat: parseFloat(arr[0].lat), display: arr[0].display_name });
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const landmarksPath = path.join(__dirname, '..', '交互代码', '主app代码', '2026EL-main', 'src', 'main', 'resources', 'static', 'app', 'landmarks-data.js');
const raw = fs.readFileSync(landmarksPath, 'utf8');
const match = raw.match(/window\.NANJING_LANDMARKS = (\[[\s\S]*?\]);/);
if (!match) { console.log('Failed to parse'); process.exit(1); }
const landmarks = JSON.parse(match[1]);
console.log(`Loaded ${landmarks.length} landmarks. Geocoding via OSM Nominatim...\n`);

async function run() {
  let updated = 0;
  let failed = [];
  let totalDist = 0;

  for (let i = 0; i < landmarks.length; i++) {
    const l = landmarks[i];
    const query = `${l.name} 南京`;
    process.stdout.write(`[${String(i+1).padStart(2)}/${landmarks.length}] ${l.name.padEnd(20)}... `);

    const result = await geocodeOSM(query);
    if (result && result.lng && result.lat) {
      const oldLng = l.lng, oldLat = l.lat;
      const dist = Math.sqrt(Math.pow(result.lng - oldLng, 2) + Math.pow(result.lat - oldLat, 2)) * 111000;
      l.lng = parseFloat(result.lng.toFixed(6));
      l.lat = parseFloat(result.lat.toFixed(6));

      if (dist > 300) {
        console.log(`FIXED (was ${dist.toFixed(0)}m off) -> [${l.lng}, ${l.lat}]`);
        updated++;
        totalDist += dist;
      } else {
        console.log(`OK (${dist.toFixed(0)}m close)`);
      }
    } else {
      console.log('NOT FOUND - keeping original');
      failed.push(l.name);
    }
    await sleep(1200); // Nominatim rate limit: 1 req/sec
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated}/${landmarks.length} (avg correction: ${(totalDist/updated).toFixed(0)}m)`);
  console.log(`Not found: ${failed.length}`);
  if (failed.length) console.log('Not found:', failed);

  // Write updated data
  const newData = raw.replace(
    /window\.NANJING_LANDMARKS = \[[\s\S]*?\];/,
    'window.NANJING_LANDMARKS = ' + JSON.stringify(landmarks, null, 2) + ';'
  );
  fs.writeFileSync(landmarksPath, newData, 'utf8');
  console.log('\nWritten to:', landmarksPath);
}

run().catch(console.error);

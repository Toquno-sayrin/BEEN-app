const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const markPath = path.join(__dirname, '..', 'assets', 'beenin-mark.png');
const outPath = path.join(__dirname, '..', 'assets', '마크그라데이션스와치.png');

const src = PNG.sync.read(fs.readFileSync(markPath));

function pixelAt(px, py) {
  const idx = (src.width * py + px) << 2;
  return { r: src.data[idx], g: src.data[idx + 1], b: src.data[idx + 2], a: src.data[idx + 3] };
}

// Sample a small neighborhood average around a point to avoid anti-aliased edge pixels.
function sampleRegion(cx, cy, radius = 3) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = cx + dx, py = cy + dy;
      if (px < 0 || py < 0 || px >= src.width || py >= src.height) continue;
      const p = pixelAt(px, py);
      if (p.a < 200) continue;
      r += p.r; g += p.g; b += p.b; n++;
    }
  }
  if (!n) return null;
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

// Three shape centers, proportioned against actual image size.
const w = src.width, h = src.height;
const points = {
  skyBlue: [Math.round(w * 0.5), Math.round(h * 0.22)],   // top pale-blue circle
  blue: [Math.round(w * 0.22), Math.round(h * 0.72)],      // bottom-left vivid blue
  green: [Math.round(w * 0.78), Math.round(h * 0.72)],     // bottom-right green
};

const sampled = {};
for (const [name, [x, y]] of Object.entries(points)) {
  sampled[name] = sampleRegion(x, y, 4);
}

console.log('sampled colors:', sampled);

// Build gradient swatch: skyBlue -> blue -> green, horizontal, 70% opacity (alpha 178).
const outW = 360, outH = 120;
const out = new PNG({ width: outW, height: outH });

function lerp(a, b, t) { return a + (b - a) * t; }
function mixColor(c1, c2, t) {
  return { r: lerp(c1.r, c2.r, t), g: lerp(c1.g, c2.g, t), b: lerp(c1.b, c2.b, t) };
}

const stops = [sampled.skyBlue, sampled.blue, sampled.green];
const alpha = Math.round(255 * 0.7);

for (let x = 0; x < outW; x++) {
  const t = x / (outW - 1); // 0..1 across width
  const segT = t * (stops.length - 1);
  const i = Math.min(Math.floor(segT), stops.length - 2);
  const localT = segT - i;
  const c = mixColor(stops[i], stops[i + 1], localT);
  for (let y = 0; y < outH; y++) {
    const idx = (outW * y + x) << 2;
    out.data[idx] = Math.round(c.r);
    out.data[idx + 1] = Math.round(c.g);
    out.data[idx + 2] = Math.round(c.b);
    out.data[idx + 3] = alpha;
  }
}

fs.writeFileSync(outPath, PNG.sync.write(out));
console.log('wrote', outPath);

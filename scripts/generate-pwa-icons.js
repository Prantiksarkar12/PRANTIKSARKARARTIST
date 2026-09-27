import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a valid uncompressed PNG file of given width and height
function createSolidPNG(width, height, r, g, b, a = 255, drawPS = true) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type: RGBA (6)
  ihdrData.writeUInt8(0, 10); // compression method
  ihdrData.writeUInt8(0, 11); // filter method
  ihdrData.writeUInt8(0, 12); // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = width * 0.46;
  const innerRadius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let pr = r;
      let pg = g;
      let pb = b;
      let pa = a;

      // Dark background gradient
      const bgGrad = 1 - Math.min(dist / (width * 0.7), 1);
      pr = Math.floor(r * (0.6 + 0.4 * bgGrad));
      pg = Math.floor(g * (0.6 + 0.4 * bgGrad));
      pb = Math.floor(b * (0.6 + 0.4 * bgGrad));

      // Rose accent ring
      if (Math.abs(dist - innerRadius) < width * 0.015) {
        pr = 225;
        pg = 29;
        pb = 72; // #e11d48
      } else if (Math.abs(dist - outerRadius) < width * 0.008) {
        pr = 244;
        pg = 63;
        pb = 94; // #f43f5e
      }

      // Stylized Monogram P and S in the middle
      if (drawPS) {
        const nx = (x - cx) / (width * 0.3);
        const ny = (y - cy) / (height * 0.3);

        // Letter P: stem nx in [-0.6, -0.4], ny in [-0.7, 0.7]
        const inStemP = nx >= -0.65 && nx <= -0.45 && ny >= -0.7 && ny <= 0.7;
        const inLoopP = (
          (nx >= -0.55 && nx <= 0.05 && ny >= -0.7 && ny <= -0.5) || // top bar
          (nx >= -0.55 && nx <= 0.05 && ny >= -0.1 && ny <= 0.1) || // middle bar
          (nx >= -0.15 && nx <= 0.05 && ny >= -0.7 && ny <= 0.1) // right curve
        );

        // Letter S:
        const inS = (
          (nx >= 0.15 && nx <= 0.65 && ny >= -0.7 && ny <= -0.5) || // top
          (nx >= 0.15 && nx <= 0.35 && ny >= -0.7 && ny <= 0.0) || // top-left
          (nx >= 0.15 && nx <= 0.65 && ny >= -0.1 && ny <= 0.1) || // center
          (nx >= 0.45 && nx <= 0.65 && ny >= 0.0 && ny <= 0.7) || // bottom-right
          (nx >= 0.15 && nx <= 0.65 && ny >= 0.5 && ny <= 0.7) // bottom
        );

        if (inStemP || inLoopP) {
          pr = 244;
          pg = 63;
          pb = 94; // Crimson rose
        } else if (inS) {
          pr = 255;
          pg = 255;
          pb = 255; // Crisp white
        }
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  // IDAT chunk (compressed with zlib)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation for PNG chunks
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuffer, data]);

  const crc = crc32(typeAndData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  CRC_TABLE[n] = c >>> 0;
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
const png192 = createSolidPNG(192, 192, 11, 11, 16);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 2. pwa-512x512.png
const png512 = createSolidPNG(512, 512, 11, 11, 16);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 3. pwa-maskable-512x512.png (maskable has a generous margin)
const pngMaskable512 = createSolidPNG(512, 512, 7, 7, 9);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

// 4. apple-touch-icon.png (180x180 standard for iOS Safari)
const appleIcon = createSolidPNG(180, 180, 11, 11, 16);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 5. favicon.ico (can be a small png or ico)
const favicon = createSolidPNG(64, 64, 11, 11, 16);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated all PWA icons in /public!');

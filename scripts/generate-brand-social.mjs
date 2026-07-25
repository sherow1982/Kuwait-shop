import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const width = 1200;
const height = 630;
const pixels = Buffer.alloc(width * height * 4);

function setPixel(x, y, [red, green, blue, alpha = 255]) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  pixels[offset] = red;
  pixels[offset + 1] = green;
  pixels[offset + 2] = blue;
  pixels[offset + 3] = alpha;
}

function rectangle(left, top, right, bottom, color) {
  for (let y = Math.max(0, top); y < Math.min(height, bottom); y += 1) {
    for (let x = Math.max(0, left); x < Math.min(width, right); x += 1) setPixel(x, y, color);
  }
}

function circle(centerX, centerY, radius, color) {
  const radiusSquared = radius * radius;
  for (let y = Math.max(0, centerY - radius); y < Math.min(height, centerY + radius); y += 1) {
    for (let x = Math.max(0, centerX - radius); x < Math.min(width, centerX + radius); x += 1) {
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      if (deltaX * deltaX + deltaY * deltaY <= radiusSquared) setPixel(x, y, color);
    }
  }
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value ^= byte;
    for (let index = 0; index < 8; index += 1) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
  }
  return (value ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

// Kuwait-flag colour system, arranged as a clean social preview without text.
rectangle(0, 0, width, height, [0, 122, 61]);
circle(863, 266, 244, [248, 244, 231]);
circle(863, 266, 204, [234, 224, 181]);
rectangle(675, 169, 1050, 537, [17, 17, 17]);
rectangle(707, 201, 1018, 505, [0, 122, 61]);
rectangle(707, 263, 1018, 326, [255, 255, 255]);
rectangle(707, 326, 1018, 389, [206, 17, 38]);
for (let y = 263; y < 389; y += 1) {
  const progress = (y - 263) / 126;
  const edge = Math.round(707 + 87 * (progress < 0.5 ? progress * 2 : (1 - progress) * 2));
  for (let x = 707; x < edge; x += 1) setPixel(x, y, [17, 17, 17]);
}
circle(971, 225, 34, [206, 17, 38]);
rectangle(108, 139, 460, 490, [17, 17, 17]);
rectangle(138, 169, 430, 460, [248, 244, 231]);
rectangle(190, 226, 378, 278, [0, 122, 61]);
rectangle(190, 278, 378, 330, [255, 255, 255]);
rectangle(190, 330, 378, 382, [206, 17, 38]);
for (let y = 226; y < 382; y += 1) {
  const progress = (y - 226) / 156;
  const edge = Math.round(190 + 73 * (progress < 0.5 ? progress * 2 : (1 - progress) * 2));
  for (let x = 190; x < edge; x += 1) setPixel(x, y, [17, 17, 17]);
}
circle(351, 204, 23, [206, 17, 38]);

const raw = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y += 1) {
  const targetOffset = y * (width * 4 + 1);
  raw[targetOffset] = 0;
  pixels.copy(raw, targetOffset + 1, y * width * 4, (y + 1) * width * 4);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
]);

await writeFile(resolve('public/brand/kuwait-shop-social.png'), png);
console.log('Generated public/brand/kuwait-shop-social.png');

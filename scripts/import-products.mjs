import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const defaultSource = String.raw`C:\Users\sherow\Downloads\منتجات متاجر لاكويت ستورز ادز\منتجات_2026-07-25_20-48-57\┘à┘å╪¬╪¼╪º╪¬_2026-07-25_20-48-57.tsv`;
const inputPath = process.env.PRODUCTS_TSV || defaultSource;
const outputPath = resolve('public/data/products.json');

function parseTsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) quoted = true;
    else if (character === '\t') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) records.push(row);
      row = [];
      field = '';
    } else field += character;
  }

  if (field.length || row.length) {
    row.push(field);
    records.push(row);
  }
  return records;
}

function numericPrice(value) {
  const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function cleanText(value, maxLength = 900) {
  return String(value || '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^الوصف\s*/u, '')
    .trim()
    .slice(0, maxLength);
}

const source = await readFile(inputPath, 'utf8');
const rows = parseTsv(source);
const products = rows.slice(1).map((row, index) => {
  const original = numericPrice(row[2]);
  const sale = numericPrice(row[3]);
  return {
    id: cleanText(row[1]) || `product-${index + 1}`,
    title: cleanText(row[0], 180) || `منتج ${index + 1}`,
    price: sale > 0 ? sale : original,
    original: sale > 0 && original > sale ? original : 0,
    category: cleanText(row[15], 80) || 'متاجر الكويت',
    image: cleanText(row[13], 600),
    description: cleanText(row[12]),
    shipping: cleanText(row[11], 160),
    sourceUrl: cleanText(row[10], 800)
  };
}).filter((product) => product.price > 0 && product.title);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(products)}\n`, 'utf8');
console.log(`Imported ${products.length.toLocaleString('en-US')} products to ${outputPath}`);

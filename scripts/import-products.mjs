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

function slugify(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('ar')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 76);
}

const GOOGLE_TAXONOMY = [
  { test: /سيارة|سيارات|car|auto|تلميع|معطر.*سيار/iu, id: '2895', path: 'Vehicles & Parts > Vehicle Parts & Accessories > Vehicle Maintenance, Care & Decor > Vehicle Cleaning', label: 'السيارات وملحقاتها' },
  { test: /كاميرا|مراقبة|camera|surveillance|واي فاي|wifi/iu, id: '362', path: 'Cameras & Optics > Cameras > Surveillance Cameras', label: 'الكاميرات والبصريات' },
  { test: /تلوين|رسم|ألوان|فن|craft|paint|art/iu, id: '505370', path: 'Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits', label: 'الفنون والهوايات' },
  { test: /لعبة|العاب|أطفال|اطفال|طفل|دمية|تسلية|toy|doll|kids/iu, id: '1239', path: 'Toys & Games', label: 'الألعاب والهوايات' },
  { test: /مساج|تدليك|تدفئة|صحة|سيرم|كولاجين|بشرة|جمال|عناية|كريم|serum|beauty|skin|massage|heat/iu, id: '469', path: 'Health & Beauty', label: 'الصحة والجمال' },
  { test: /ملابس|مشد|حقيبة|شنطة|إكسسوار|اكسسوار|ملابس|shapewear|clothing|bag/iu, id: '166', path: 'Apparel & Accessories', label: 'الملابس والإكسسوارات' },
  { test: /طنجرة|طبخ|مطبخ|فرن|مفرمة|غسالة.*فاكه|ترمس|سكاكين|مكبس|موقد|kitchen|cook|oven/iu, id: '6070', path: 'Home & Garden > Kitchen & Dining > Cookware & Bakeware', label: 'المطبخ والأدوات المنزلية' },
  { test: /مروحة|مصباح|إضاءة|led|شاحن|usb|مكبر|جرس|منفاخ|إلكترون|الكترون|جهاز|lamp|charger|speaker|fan|electronics/iu, id: '222', path: 'Electronics', label: 'الإلكترونيات' },
  { test: /رياضة|حقيبة ظهر|تمرين|لياقة|sports|fitness/iu, id: '988', path: 'Sporting Goods', label: 'الرياضة واللياقة' },
  { test: /مكتب|قرطاسية|office|stationery/iu, id: '922', path: 'Office Supplies', label: 'مستلزمات المكتب' },
  { test: /حيوان|قط|كلب|pet|cat|dog/iu, id: '1', path: 'Animals & Pet Supplies', label: 'الحيوانات الأليفة' }
];

function classifyProduct(title, description, sourceCategory) {
  // Prefer explicit product title and source category; descriptions often mention incidental use cases.
  const text = `${title} ${sourceCategory}`;
  const match = GOOGLE_TAXONOMY.find((category) => category.test.test(text));
  return match || { id: '536', path: 'Home & Garden', label: 'المنزل والحديقة' };
}

const source = await readFile(inputPath, 'utf8');
const rows = parseTsv(source);
const products = rows.slice(1).map((row, index) => {
  const original = numericPrice(row[2]);
  const sale = numericPrice(row[3]);
  const sourceCategory = cleanText(row[15], 80) || 'متاجر الكويت';
  const category = classifyProduct(row[0], row[12], sourceCategory);
  const listedPrice = sale > 0 ? sale : original;
  const listedOriginal = sale > 0 && original > sale ? original : 0;
  return {
    id: cleanText(row[1]) || `product-${index + 1}`,
    title: cleanText(row[0], 180) || `منتج ${index + 1}`,
    slug: `${slugify(row[0]) || `منتج-${index + 1}`}-${cleanText(row[1]).slice(-6).toLocaleLowerCase('ar')}`,
    price: Math.ceil(listedPrice),
    original: listedOriginal ? Math.ceil(listedOriginal) : 0,
    category: category.label,
    sourceCategory,
    googleProductCategoryId: category.id,
    googleProductCategory: category.path,
    productType: `${category.label} > ${cleanText(row[0], 140)}`,
    image: cleanText(row[13], 600),
    description: cleanText(row[12]),
    shipping: cleanText(row[11], 160),
    sourceUrl: cleanText(row[10], 800)
  };
}).filter((product) => product.price > 0 && product.title);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(products)}\n`, 'utf8');
console.log(`Imported ${products.length.toLocaleString('en-US')} products to ${outputPath}`);

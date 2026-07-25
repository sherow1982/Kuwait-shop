import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const siteUrl = 'https://kuwait-shop.arabsads.shop';
const distPath = resolve('dist');
const products = JSON.parse(await readFile(resolve('public/data/products.json'), 'utf8'));
const baseHtml = await readFile(join(distPath, 'index.html'), 'utf8');

function xmlEscape(value = '') {
  return String(value).replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
}

function productUrl(product) {
  return `${siteUrl}/product/${encodeURIComponent(product.slug)}`;
}

function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: [product.image],
    category: product.googleProductCategory,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: productUrl(product),
      priceCurrency: 'KWD',
      price: Number(product.price).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'كويت شوب' }
    }
  };
}

const legalPages = [
  { slug: 'privacy-policy', title: 'سياسة الخصوصية', description: 'طريقة جمع واستخدام وحماية بيانات عملاء كويت شوب داخل دولة الكويت.' },
  { slug: 'terms-and-conditions', title: 'الشروط والأحكام', description: 'الشروط المنظمة لاستخدام كويت شوب وتأكيد الطلبات والتوصيل والدفع داخل الكويت.' },
  { slug: 'refund-policy', title: 'سياسة الاسترجاع والاسترداد', description: 'شروط ومدة طلب الاسترجاع أو الاستبدال وآلية فحص المنتجات في كويت شوب.' },
  { slug: 'shipping-policy', title: 'سياسة الشحن والتوصيل', description: 'نطاق التوصيل ومحافظات الكويت ورسوم الشحن المجانية أو التي تصل إلى 5 د.ك ومدة التسليم في كويت شوب.' },
  { slug: 'about-us', title: 'نبذة عن كويت شوب', description: 'تعرف على كويت شوب، متجر إلكتروني يركز على خيارات عملية للبيت والحياة اليومية داخل الكويت.' },
  { slug: 'contact-us', title: 'تواصل معنا', description: 'تواصل مع خدمة عملاء كويت شوب للاستفسار عن المنتجات والطلبات والتوصيل والاسترجاع.' }
];

const today = new Date().toISOString().slice(0, 10);
const sitemapEntries = [
  `<url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...legalPages.map((page) => `<url><loc>${xmlEscape(`${siteUrl}/ar/${page.slug}`)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`),
  ...products.map((product) => `<url><loc>${xmlEscape(productUrl(product))}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries.join('')}</urlset>\n`;
await writeFile(join(distPath, 'sitemap.xml'), sitemap, 'utf8');

const merchantItems = products.map((product) => `
  <item>
    <g:id>${xmlEscape(product.id)}</g:id>
    <g:title>${xmlEscape(product.title)}</g:title>
    <g:description>${xmlEscape(product.description)}</g:description>
    <g:link>${xmlEscape(productUrl(product))}</g:link>
    <g:image_link>${xmlEscape(product.image)}</g:image_link>
    <g:price>${Number(product.price).toFixed(2)} KWD</g:price>
    <g:availability>in_stock</g:availability>
    <g:condition>new</g:condition>
    <g:google_product_category>${xmlEscape(`${product.googleProductCategoryId} - ${product.googleProductCategory}`)}</g:google_product_category>
    <g:product_type>${xmlEscape(product.productType)}</g:product_type>
    <g:identifier_exists>false</g:identifier_exists>
  </item>`).join('');
const merchantFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>كويت شوب</title><link>${siteUrl}</link><description>منتجات كويت شوب المتاحة داخل الكويت</description>${merchantItems}\n</channel></rss>\n`;
await mkdir(join(distPath, 'feeds'), { recursive: true });
await writeFile(join(distPath, 'feeds', 'google-merchant.xml'), merchantFeed, 'utf8');

const llms = `# كويت شوب\n\n> متجر إلكتروني كويتي لمنتجات المنزل والحياة اليومية.\n\n- الموقع: ${siteUrl}\n- اللغة: العربية (الكويت)\n- العملة: الدينار الكويتي (KWD)\n- منطقة الخدمة: دولة الكويت\n- كتالوج Google Merchant Center: ${siteUrl}/feeds/google-merchant.xml\n- خريطة الموقع: ${siteUrl}/sitemap.xml\n`;
await writeFile(join(distPath, 'llms.txt'), llms, 'utf8');

for (const product of products) {
  const folder = join(distPath, 'product', product.slug);
  await mkdir(folder, { recursive: true });
  const title = `${product.title} | كويت شوب`;
  const description = product.description.slice(0, 155);
  const productHtml = baseHtml
    .replace(/<title>[^<]*<\/title>/i, `<title>${xmlEscape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${xmlEscape(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${xmlEscape(productUrl(product))}" />`)
    .replace('</head>', `<script id="product-jsonld" type="application/ld+json">${JSON.stringify(productSchema(product))}</script></head>`);
  await writeFile(join(folder, 'index.html'), productHtml, 'utf8');
}

for (const page of legalPages) {
  const folder = join(distPath, 'ar', page.slug);
  await mkdir(folder, { recursive: true });
  const pageUrl = `${siteUrl}/ar/${page.slug}`;
  const pageHtml = baseHtml
    .replace(/<title>[^<]*<\/title>/i, `<title>${xmlEscape(`${page.title} | كويت شوب`)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${xmlEscape(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${xmlEscape(pageUrl)}" />`)
    .replace('</head>', `<script id="legal-jsonld" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url: pageUrl, inLanguage: 'ar-KW' })}</script></head>`);
  await writeFile(join(folder, 'index.html'), pageHtml, 'utf8');
}

console.log(`Generated SEO pages, legal pages, sitemap, and Merchant feed for ${products.length.toLocaleString('en-US')} products.`);

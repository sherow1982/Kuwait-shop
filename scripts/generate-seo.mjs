import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const siteUrl = 'https://kuwait-shop.arabsads.shop';
const publicPath = resolve('public');
const products = JSON.parse(await readFile(join(publicPath, 'data', 'products.json'), 'utf8'));

function xmlEscape(value = '') {
  return String(value).replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[character]));
}

function productUrl(product) {
  return `${siteUrl}/product/${encodeURIComponent(product.slug)}`;
}

const legalPages = [
  'privacy-policy',
  'terms-and-conditions',
  'refund-policy',
  'shipping-policy',
  'about-us',
  'contact-us'
];

const seoTypes = ['شراء', 'افضل', 'احسن', 'تجربتي'];
const today = new Date().toISOString().slice(0, 10);
const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>\n`;

const productSitemapEntries = products.map((product) => `<url><loc>${xmlEscape(productUrl(product))}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
const siteSitemapEntries = [
  `<url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...legalPages.map((slug) => `<url><loc>${siteUrl}/ar/${slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`)
];
const seoSitemapEntries = products.flatMap((product) => seoTypes.map((type) => `<url><loc>${xmlEscape(`${siteUrl}/${encodeURIComponent(type)}/${encodeURIComponent(product.slug)}`)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`));

await mkdir(join(publicPath, 'sitemaps'), { recursive: true });
await writeFile(join(publicPath, 'sitemaps', 'products.xml'), urlset(productSitemapEntries), 'utf8');
await writeFile(join(publicPath, 'sitemaps', 'pages.xml'), urlset(siteSitemapEntries), 'utf8');
await writeFile(join(publicPath, 'sitemaps', 'seo-landings.xml'), urlset(seoSitemapEntries), 'utf8');
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteUrl}/sitemaps/pages.xml</loc><lastmod>${today}</lastmod></sitemap><sitemap><loc>${siteUrl}/sitemaps/products.xml</loc><lastmod>${today}</lastmod></sitemap><sitemap><loc>${siteUrl}/sitemaps/seo-landings.xml</loc><lastmod>${today}</lastmod></sitemap></sitemapindex>\n`;
await writeFile(join(publicPath, 'sitemap.xml'), sitemapIndex, 'utf8');

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
await mkdir(join(publicPath, 'feeds'), { recursive: true });
await writeFile(join(publicPath, 'feeds', 'google-merchant.xml'), merchantFeed, 'utf8');

const llms = `# كويت شوب\n\n> متجر إلكتروني كويتي لمنتجات المنزل والحياة اليومية.\n\n- الموقع: ${siteUrl}\n- اللغة: العربية (الكويت)\n- العملة: الدينار الكويتي (KWD)\n- منطقة الخدمة: دولة الكويت\n- كتالوج Google Merchant Center: ${siteUrl}/feeds/google-merchant.xml\n- خريطة الموقع: ${siteUrl}/sitemap.xml\n`;
await writeFile(join(publicPath, 'llms.txt'), llms, 'utf8');

console.log(`Generated public SEO artifacts for ${products.length.toLocaleString('en-US')} products and ${seoSitemapEntries.length.toLocaleString('en-US')} dynamic local SEO URLs.`);

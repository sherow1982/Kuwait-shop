import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const siteUrl = 'https://kuwait-shop.arabsads.shop';
const distPath = resolve('dist');
const products = JSON.parse(await readFile(resolve('public/data/products.json'), 'utf8'));
const baseHtml = await readFile(join(distPath, 'index.html'), 'utf8');
const organizationId = `${siteUrl}/#organization`;
const returnPolicyId = `${siteUrl}/#return-policy`;

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
      seller: { '@id': organizationId },
      hasMerchantReturnPolicy: { '@id': returnPolicyId }
    }
  };
}

function pageMetadata(html, { title, description, url, type = 'website', image = '' }) {
  const socialImage = image ? `<meta property="og:image" content="${xmlEscape(image)}" /><meta name="twitter:image" content="${xmlEscape(image)}" />` : '';
  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${xmlEscape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${xmlEscape(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${xmlEscape(url)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/i, `<meta property="og:title" content="${xmlEscape(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/i, `<meta property="og:description" content="${xmlEscape(description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${xmlEscape(url)}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/i, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/i, `<meta name="twitter:title" content="${xmlEscape(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/i, `<meta name="twitter:description" content="${xmlEscape(description)}" />`)
    .replace('</head>', `${socialImage}</head>`);
}

const legalPages = [
  { slug: 'privacy-policy', title: 'سياسة الخصوصية', description: 'طريقة جمع واستخدام وحماية بيانات عملاء كويت شوب داخل دولة الكويت.' },
  { slug: 'terms-and-conditions', title: 'الشروط والأحكام', description: 'الشروط المنظمة لاستخدام كويت شوب وتأكيد الطلبات والتوصيل والدفع داخل الكويت.' },
  { slug: 'refund-policy', title: 'سياسة الاسترجاع والاسترداد', description: 'شروط ومدة طلب الاسترجاع أو الاستبدال وآلية فحص المنتجات في كويت شوب.' },
  { slug: 'shipping-policy', title: 'سياسة الشحن والتوصيل', description: 'نطاق التوصيل ومحافظات الكويت ورسوم الشحن المجانية أو التي تصل إلى 5 د.ك ومدة التسليم في كويت شوب.' },
  { slug: 'about-us', title: 'نبذة عن كويت شوب', description: 'تعرف على كويت شوب، متجر إلكتروني يركز على خيارات عملية للبيت والحياة اليومية داخل الكويت.' },
  { slug: 'contact-us', title: 'تواصل معنا', description: 'تواصل مع خدمة عملاء كويت شوب للاستفسار عن المنتجات والطلبات والتوصيل والاسترجاع.' }
];

const seoPageTypes = [
  { slug: 'شراء', label: 'شراء', title: (product) => `شراء ${product.title} في الكويت`, intro: (product) => `دليل طلب ${product.title} في الكويت مع السعر والتوفر وطريقة التوصيل.` },
  { slug: 'افضل', label: 'أفضل', title: (product) => `أفضل ${product.title} في الكويت`, intro: (product) => `دليل اختيار ${product.title} في الكويت قبل الشراء، مع المواصفات والسعر والتوصيل المحلي.` },
  { slug: 'احسن', label: 'أحسن', title: (product) => `أحسن ${product.title} في الكويت`, intro: (product) => `معلومات تساعدك على مقارنة واختيار ${product.title} داخل الكويت.` },
  { slug: 'تجربتي', label: 'تجربتي مع', title: (product) => `تجربتي مع ${product.title} في الكويت`, intro: (product) => `ملخص معلوماتي عن ${product.title} في الكويت وما يجب التحقق منه قبل الطلب والاستخدام.` }
];

// These folders were used by an earlier static-page strategy. Their routes are
// now served by the Pages Function, so remove only these known generated paths
// before writing the deployable output.
await Promise.all([
  rm(join(distPath, 'product'), { recursive: true, force: true }),
  ...seoPageTypes.map((type) => rm(join(distPath, type.slug), { recursive: true, force: true }))
]);

function seoLandingUrl(product, type) {
  return `${siteUrl}/${encodeURIComponent(type.slug)}/${encodeURIComponent(product.slug)}`;
}

function seoLandingContent(product, type) {
  const currentPrice = `${Number(product.price).toLocaleString('ar-KW')} د.ك`;
  const productLink = productUrl(product);
  const common = `<p>السعر المعروض حالياً: <strong>${xmlEscape(currentPrice)}</strong>. التوصيل داخل محافظات الكويت، وتُراجع رسوم الشحن قبل تأكيد الطلب.</p><p><a href="${xmlEscape(productLink)}">عرض صفحة المنتج وطلبه</a></p>`;
  const typeContent = {
    'شراء': `<h2>السعر وطريقة الطلب</h2><p>أضف المنتج إلى السلة، ثم أدخل عنوانك ورقم هاتف كويتي بصيغة +965. ستُفتح رسالة واتساب منظمة لمراجعة الطلب قبل الإرسال.</p><h2>التوصيل في الكويت</h2><p>الشحن مجاني لبعض المناطق، بينما تصل رسوم المناطق ذات الخدمة الخاصة إلى 5 د.ك وفق العنوان.</p>`,
    'افضل': `<h2>كيف تختار المنتج المناسب؟</h2><p>راجع وصف المنتج والصور والتصنيف قبل الطلب، وقارن احتياجك بالسعر والتفاصيل المتاحة في صفحة المنتج.</p><h2>خدمة محلية</h2><p>يقتصر التوصيل على دولة الكويت مع تأكيد العنوان والتوفر قبل الإرسال.</p>`,
    'احسن': `<h2>نقاط مهمة قبل الشراء</h2><p>تحقق من الاستخدام المناسب والمواصفات الظاهرة في الوصف، ثم راجع السعر الحالي وخيارات التوصيل.</p><h2>بيانات واضحة</h2><p>تظهر الفئة والسعر والحالة في صفحة المنتج، مع سياسة شحن واسترجاع مستقلة للرجوع إليها.</p>`,
    'تجربتي': `<h2>ماذا تتوقع من المنتج؟</h2><p>هذه صفحة معلومات وليست تقييماً شخصياً مصطنعاً. نعرض مواصفات المنتج ووصفه المتاح لتساعدك على اتخاذ قرار واعٍ.</p><h2>بعد الاستلام</h2><p>راجع التعليمات والمنتج عند الاستلام واحتفظ بالعبوة الأصلية إذا احتجت إلى تقديم طلب استرجاع أو استبدال.</p>`
  }[type.slug];
  return `<main class="seo-static" dir="rtl"><nav><a href="${siteUrl}/">الرئيسية</a> ← <a href="${xmlEscape(productLink)}">${xmlEscape(product.title)}</a></nav><article><p>كويت شوب · ${xmlEscape(type.label)} في الكويت</p><h1>${xmlEscape(type.title(product))}</h1><p>${xmlEscape(type.intro(product))}</p><img src="${xmlEscape(product.image)}" alt="${xmlEscape(product.title)}" /><h2>${xmlEscape(product.title)}</h2><p>${xmlEscape(product.description || 'منتج مختار بعناية للتسوق داخل الكويت.')}</p>${common}${typeContent}</article></main>`;
}

const today = new Date().toISOString().slice(0, 10);
function urlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>\n`;
}

const productSitemapEntries = products.map((product) => `<url><loc>${xmlEscape(productUrl(product))}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
const siteSitemapEntries = [
  `<url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ...legalPages.map((page) => `<url><loc>${xmlEscape(`${siteUrl}/ar/${page.slug}`)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`)
];
const seoSitemapEntries = products.flatMap((product) => seoPageTypes.map((type) => `<url><loc>${xmlEscape(seoLandingUrl(product, type))}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`));
await mkdir(join(distPath, 'sitemaps'), { recursive: true });
await writeFile(join(distPath, 'sitemaps', 'products.xml'), urlset(productSitemapEntries), 'utf8');
await writeFile(join(distPath, 'sitemaps', 'pages.xml'), urlset(siteSitemapEntries), 'utf8');
await writeFile(join(distPath, 'sitemaps', 'seo-landings.xml'), urlset(seoSitemapEntries), 'utf8');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteUrl}/sitemaps/pages.xml</loc><lastmod>${today}</lastmod></sitemap><sitemap><loc>${siteUrl}/sitemaps/products.xml</loc><lastmod>${today}</lastmod></sitemap><sitemap><loc>${siteUrl}/sitemaps/seo-landings.xml</loc><lastmod>${today}</lastmod></sitemap></sitemapindex>\n`;
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

// Product and local-SEO URLs are rendered at the edge by functions/[[path]].js.
// Keeping their URLs in the sitemaps preserves discoverability while avoiding the
// Cloudflare Pages 20,000 deployed-file limit.

for (const page of legalPages) {
  const folder = join(distPath, 'ar', page.slug);
  await mkdir(folder, { recursive: true });
  const pageUrl = `${siteUrl}/ar/${page.slug}`;
  const pageHtml = pageMetadata(baseHtml, { title: `${page.title} | كويت شوب`, description: page.description, url: pageUrl })
    .replace('</head>', `<script id="legal-jsonld" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url: pageUrl, inLanguage: 'ar-KW' })}</script></head>`);
  await writeFile(join(folder, 'index.html'), pageHtml, 'utf8');
}

console.log(`Generated legal pages, sitemaps, and Merchant feed for ${products.length.toLocaleString('en-US')} products. ${seoSitemapEntries.length.toLocaleString('en-US')} local SEO URLs are served dynamically by the Pages Function.`);

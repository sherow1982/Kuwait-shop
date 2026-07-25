const SITE_URL = 'https://kuwait-shop.arabsads.shop';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const RETURN_POLICY_ID = `${SITE_URL}/#return-policy`;
const GOOGLE_VERIFICATION_PATH = '/googlef3dc7a494f07cb5c.html';
const GOOGLE_VERIFICATION_CONTENT = 'google-site-verification: googlef3dc7a494f07cb5c.html';
const LEGAL_ROUTE_SEGMENTS = new Set([
  'privacy-policy', 'terms-and-conditions', 'refund-policy', 'shipping-policy', 'about-us', 'contact-us',
  'privacy', 'terms', 'returns', 'shipping', 'about', 'contact'
]);

let productsPromise;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function productUrl(product) {
  return `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
}

function imageMimeType(imageUrl) {
  const pathname = imageUrl.split('?')[0].toLowerCase();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function price(product) {
  return `${new Intl.NumberFormat('ar-KW', { maximumFractionDigits: 0 }).format(Number(product.price))} د.ك`;
}

async function getProducts(context) {
  if (!productsPromise) {
    const dataUrl = new URL('/data/products.json', context.request.url);
    productsPromise = context.env.ASSETS.fetch(new Request(dataUrl.toString()))
      .then((response) => {
        if (!response.ok) throw new Error('Unable to read the product catalog.');
        return response.json();
      });
  }
  return productsPromise;
}

async function getIndexResponse(context) {
  const indexUrl = new URL('/index.html', context.request.url);
  return context.env.ASSETS.fetch(new Request(indexUrl.toString()));
}

function isLegalRoute(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1) return LEGAL_ROUTE_SEGMENTS.has(segments[0]);
  return segments.length === 2 && segments[0] === 'ar' && LEGAL_ROUTE_SEGMENTS.has(segments[1]);
}

function productSchema(product) {
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || 'منتج مختار بعناية للتسوق داخل الكويت.',
    image: [product.image],
    category: product.googleProductCategory || product.category,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'كويت شوب' },
    offers: {
      '@type': 'Offer',
      url: productUrl(product),
      priceCurrency: 'KWD',
      price: Number(product.price).toFixed(2),
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORGANIZATION_ID },
      hasMerchantReturnPolicy: { '@id': RETURN_POLICY_ID },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'KWD'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'KW'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' }
        }
      }
    }
  };
}

function replaceMetadata(html, { title, description, canonical, type, image, schema, body }) {
  const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const imageType = imageMimeType(image);
  return html
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\b(?=[^>]*\bname="description")[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\b(?=[^>]*\brel="canonical")[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:title")[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:description")[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:url")[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:type")[^>]*>/i, `<meta property="og:type" content="${type}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image")[^>]*>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image:secure_url")[^>]*>/i, `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image:type")[^>]*>/i, `<meta property="og:image:type" content="${imageType}" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image:width")[^>]*>/i, `<meta property="og:image:width" content="800" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image:height")[^>]*>/i, `<meta property="og:image:height" content="800" />`)
    .replace(/<meta\b(?=[^>]*\bproperty="og:image:alt")[^>]*>/i, `<meta property="og:image:alt" content="${escapeHtml(title)}" />`)
    .replace(/<meta\b(?=[^>]*\bname="twitter:title")[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\b(?=[^>]*\bname="twitter:description")[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\b(?=[^>]*\bname="twitter:image")[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta\b(?=[^>]*\bname="twitter:image:alt")[^>]*>/i, `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`)
    .replace('<div id="app"></div>', `<div id="app">${body}</div>`)
    .replace('</head>', `${script}</head>`);
}

function productFallback(product) {
  const title = escapeHtml(product.title);
  const description = escapeHtml(product.description || 'منتج مختار بعناية للتسوق داخل الكويت.');
  return `<main class="seo-static" dir="rtl"><nav><a href="/">الرئيسية</a> ← <strong>${title}</strong></nav><article><p>كويت شوب · منتج متوفر داخل الكويت</p><h1>${title}</h1><img src="${escapeHtml(product.image)}" alt="${title}" /><p>${description}</p><p>السعر الحالي: <strong>${escapeHtml(price(product))}</strong></p><p>التوصيل داخل دولة الكويت، والشحن مجاني لبعض المناطق وتصل رسوم المناطق الخاصة إلى 5 د.ك.</p><p><a href="/ar/shipping-policy">سياسة الشحن والتوصيل</a> · <a href="/ar/refund-policy">سياسة الاسترجاع</a></p></article></main>`;
}

const SEO_TYPES = {
  'شراء': {
    label: 'شراء',
    title: (product) => `شراء ${product.title} في الكويت`,
    intro: (product) => `دليل طلب ${product.title} في الكويت مع السعر والتوفر وطريقة التوصيل.`,
    section: 'أضف المنتج إلى السلة، ثم أدخل عنوانك ورقم هاتف كويتي بصيغة +965 لمراجعة الطلب قبل الإرسال.'
  },
  'افضل': {
    label: 'أفضل',
    title: (product) => `أفضل ${product.title} في الكويت`,
    intro: (product) => `دليل اختيار ${product.title} في الكويت قبل الشراء، مع المواصفات والسعر والتوصيل المحلي.`,
    section: 'راجع الوصف والصور والتصنيف، ثم قارن احتياجك بالسعر والتفاصيل الظاهرة في صفحة المنتج.'
  },
  'احسن': {
    label: 'أحسن',
    title: (product) => `أحسن ${product.title} في الكويت`,
    intro: (product) => `معلومات تساعدك على مقارنة واختيار ${product.title} داخل الكويت.`,
    section: 'تحقق من الاستخدام المناسب والمواصفات والسعر الحالي قبل إرسال طلبك.'
  },
  'تجربتي': {
    label: 'تجربتي مع',
    title: (product) => `تجربتي مع ${product.title} في الكويت`,
    intro: (product) => `ملخص معلوماتي عن ${product.title} في الكويت وما يجب التحقق منه قبل الطلب والاستخدام.`,
    section: 'هذه صفحة معلومات وليست مراجعة شخصية مصطنعة؛ نعتمد على وصف المنتج وبياناته لمساعدتك على قرار واعٍ.'
  }
};

function seoFallback(product, seoType) {
  const page = SEO_TYPES[seoType];
  const title = escapeHtml(page.title(product));
  const productTitle = escapeHtml(product.title);
  return `<main class="seo-static" dir="rtl"><nav><a href="/">الرئيسية</a> ← <a href="/product/${encodeURIComponent(product.slug)}">${productTitle}</a> ← <strong>${escapeHtml(page.label)}</strong></nav><article><p>كويت شوب · ${escapeHtml(page.label)} في الكويت</p><h1>${title}</h1><img src="${escapeHtml(product.image)}" alt="${productTitle}" /><p>${escapeHtml(page.intro(product))}</p><h2>${productTitle}</h2><p>${escapeHtml(product.description || 'منتج مختار بعناية للتسوق داخل الكويت.')}</p><p>السعر الحالي: <strong>${escapeHtml(price(product))}</strong></p><h2>معلومة قبل الطلب</h2><p>${escapeHtml(page.section)}</p><p>الشحن مجاني لبعض المناطق وتصل رسوم المناطق الخاصة إلى 5 د.ك حسب العنوان. راجع <a href="/ar/shipping-policy">سياسة الشحن والتوصيل</a>.</p></article></main>`;
}

function seoSchema(product, seoType, canonical, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: SEO_TYPES[seoType].title(product),
    description,
    inLanguage: 'ar-KW',
    mainEntityOfPage: canonical,
    about: { '@type': 'Product', name: product.title, sku: product.id, category: product.googleProductCategory || product.category, url: productUrl(product) },
    author: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    contentLocation: { '@type': 'Country', name: 'Kuwait', identifier: 'KW' }
  };
}

export async function onRequest(context) {
  if (!['GET', 'HEAD'].includes(context.request.method)) return context.next();
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(context.request.url).pathname).replace(/\/$/, '') || '/';
  } catch {
    return context.next();
  }
  if (pathname === GOOGLE_VERIFICATION_PATH) {
    return new Response(GOOGLE_VERIFICATION_CONTENT, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'public, max-age=300'
      }
    });
  }
  const productMatch = pathname.match(/^\/product\/(.+)$/);
  const seoMatch = pathname.match(/^\/(شراء|افضل|احسن|تجربتي)\/(.+)$/);
  if (!productMatch && !seoMatch) {
    return isLegalRoute(pathname) ? getIndexResponse(context) : context.next();
  }

  const slug = productMatch ? productMatch[1] : seoMatch[2];
  const products = await getProducts(context);
  const product = products.find((item) => item.slug === slug);
  if (!product) return context.next();

  const indexResponse = await getIndexResponse(context);
  const indexHtml = await indexResponse.text();
  const isProduct = Boolean(productMatch);
  const canonical = isProduct
    ? productUrl(product)
    : `${SITE_URL}/${encodeURIComponent(seoMatch[1])}/${encodeURIComponent(product.slug)}`;
  const title = isProduct ? `${product.title} | كويت شوب` : `${SEO_TYPES[seoMatch[1]].title(product)} | كويت شوب`;
  const description = isProduct
    ? `${product.title} — ${(product.description || 'منتج مختار بعناية للتسوق داخل الكويت.').slice(0, 145)}`
    : `${SEO_TYPES[seoMatch[1]].intro(product)} السعر الحالي ${price(product)}.`;
  const html = replaceMetadata(indexHtml, {
    title,
    description,
    canonical,
    type: isProduct ? 'product' : 'article',
    image: product.image,
    schema: isProduct ? productSchema(product) : seoSchema(product, seoMatch[1], canonical, description),
    body: isProduct ? productFallback(product) : seoFallback(product, seoMatch[1])
  });

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'public, max-age=0, s-maxage=3600',
      'content-security-policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kuwait-shop.arabsads.shop",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https://assets.wuiltstore.com https://kuwait-shop.arabsads.shop",
        "connect-src 'self' https://kuwait-shop.arabsads.shop https://fonts.googleapis.com https://fonts.gstatic.com",
        "frame-ancestors 'none'"
      ].join('; ')
    }
  });
}

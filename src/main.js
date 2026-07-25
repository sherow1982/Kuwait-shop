export function mountStore() {

const state = {
  products: [],
  visible: 36,
  query: '',
  category: 'الكل',
  sort: 'featured',
  cart: JSON.parse(localStorage.getItem('kuwait-shop-cart') || '[]'),
  activeProduct: null,
  categoriesExpanded: false
};

const currency = new Intl.NumberFormat('ar-KW', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const app = document.querySelector('#app');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function price(value) {
  return `${currency.format(Number(value || 0))} د.ك`;
}

function cartCount() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function cartTotal() {
  return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function saveCart() {
  localStorage.setItem('kuwait-shop-cart', JSON.stringify(state.cart));
}

function productById(id) {
  return state.products.find((product) => product.id === id);
}

function productBySlug(slug) {
  return state.products.find((product) => product.slug === slug);
}

function productPath(product) {
  return `/product/${product.slug}`;
}

function updateSeoMetadata({ title, description, canonical, type = 'website' }) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector('meta[property="og:type"]')?.setAttribute('content', type);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function productStructuredData(product, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    image: [product.image],
    category: product.googleProductCategory || product.category,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'KWD',
      price: Number(product.price).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': 'https://kuwait-shop.arabsads.shop/#organization' },
      hasMerchantReturnPolicy: { '@id': 'https://kuwait-shop.arabsads.shop/#return-policy' }
    }
  };
}

const LEGAL_PAGES = {
  privacy: {
    slug: 'privacy-policy',
    title: 'سياسة الخصوصية',
    description: 'تعرف على طريقة جمع واستخدام وحماية بيانات عملاء كويت شوب أثناء التسوق والتوصيل داخل دولة الكويت.',
    intro: 'نلتزم في كويت شوب بحماية خصوصيتك والتعامل مع بياناتك بوضوح ومسؤولية. توضح هذه السياسة البيانات التي نحتاجها لإتمام الطلب وخدمتك داخل دولة الكويت.',
    sections: [
      ['البيانات التي نجمعها', '<p>عند إرسال طلب أو التواصل معنا قد نطلب الاسم، رقم الهاتف الكويتي، عنوان التوصيل، تفاصيل المنتجات المطلوبة وأي ملاحظات تضيفها. لا نطلب بيانات البطاقات البنكية داخل الموقع.</p>'],
      ['كيف نستخدم بياناتك', '<p>نستخدم البيانات لتأكيد الطلب، تجهيز المنتجات، تنسيق التوصيل، الرد على استفساراتك وتحسين تجربة المتجر. لا نستخدم بياناتك لأغراض لا تتصل بالخدمة دون موافقتك.</p>'],
      ['مشاركة البيانات', '<p>تُشارك معلومات التوصيل بالقدر اللازم مع مندوب أو شركة التوصيل داخل الكويت. لا نبيع بيانات العملاء أو نؤجرها، ولا نشاركها مع أي جهة أخرى إلا عند الحاجة النظامية أو بموافقتك.</p>'],
      ['الكوكيز والتخزين المحلي', '<p>قد يستخدم المتجر التخزين المحلي لحفظ محتويات السلة وتفضيلات التصفح على جهازك. يمكنك مسح هذه البيانات من إعدادات المتصفح، وقد يؤثر ذلك على السلة المحفوظة.</p>'],
      ['أمان المعلومات وحقوقك', '<p>نطبق ممارسات تقنية معقولة لحماية البيانات أثناء التصفح وإرسال الطلب. يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها عبر <a href="/ar/contact-us">صفحة التواصل</a>.</p>'],
      ['التواصل', '<p>للاستفسارات المتعلقة بالخصوصية، تواصل معنا عبر <a href="https://wa.me/201110760081" target="_blank" rel="noopener">واتساب خدمة العملاء</a> وسنساعدك في أقرب وقت.</p>']
    ]
  },
  terms: {
    slug: 'terms-and-conditions',
    title: 'الشروط والأحكام',
    description: 'الشروط المنظمة لاستخدام كويت شوب وتصفح المنتجات وتأكيد الطلبات والتوصيل والدفع داخل الكويت.',
    intro: 'باستخدامك كويت شوب أو إرسال طلب من خلاله، فأنت توافق على الشروط التالية. يرجى قراءتها قبل إتمام الشراء.',
    sections: [
      ['الاستخدام والأهلية', '<p>يُرجى استخدام المتجر لأغراض مشروعة وتقديم بيانات صحيحة. يفترض أن يتم الطلب بواسطة شخص بالغ أو تحت إشراف ولي الأمر.</p>'],
      ['المنتجات والأسعار', '<p>نبذل جهدنا لعرض الصور والوصف والأسعار بدقة. قد تختلف ألوان الصور باختلاف الشاشة، ويخضع توفر المنتج للتأكيد وقت الطلب. جميع الأسعار بالدينار الكويتي، وقد تُحدّث قبل تأكيد الطلب.</p>'],
      ['تأكيد الطلب', '<p>لا يصبح الطلب نهائياً إلا بعد مراجعة التوفر والبيانات والتواصل مع العميل. يحق للمتجر إلغاء الطلب عند نفاد المخزون أو وجود خطأ واضح في السعر أو بيانات غير مكتملة.</p>'],
      ['الدفع والتوصيل', '<p>يتم تنسيق طريقة الدفع والتوصيل عند فتح محادثة واتساب. نطاق التوصيل هو محافظات دولة الكويت فقط. الشحن مجاني لبعض المناطق، وتصل الرسوم إلى 5 د.ك في مناطق محددة وفق <a href="/ar/shipping-policy">سياسة الشحن</a>. يجب أن يكون رقم الهاتف والعنوان صحيحين لتجنب التأخير.</p>'],
      ['الإرجاع والاسترداد', '<p>تطبق <a href="/ar/refund-policy">سياسة الاسترجاع والاسترداد</a> المنشورة في المتجر، وهي جزء من هذه الشروط.</p>'],
      ['الملكية الفكرية', '<p>محتوى المتجر من نصوص وصور وشعار وتصميم مملوك لكويت شوب أو مرخص له، ولا يجوز نسخه أو إعادة استخدامه تجارياً دون إذن كتابي.</p>'],
      ['القانون والتواصل', '<p>تُفسر هذه الشروط وفق الأنظمة المعمول بها في دولة الكويت. لأي سؤال، يمكنك التواصل معنا عبر <a href="/ar/contact-us">صفحة التواصل</a>.</p>']
    ]
  },
  returns: {
    slug: 'refund-policy',
    title: 'سياسة الاسترجاع والاسترداد',
    description: 'تعرف على شروط ومدة طلب الاسترجاع أو الاستبدال وآلية فحص المنتجات واسترداد المبالغ في كويت شوب.',
    intro: 'نحرص على رضاك. يمكنك التواصل معنا لطلب الاسترجاع أو الاستبدال خلال 14 يوماً من تاريخ استلام الطلب، وفق الشروط الموضحة أدناه.',
    sections: [
      ['المدة والشروط الأساسية', '<p>يجب أن يكون المنتج غير مستخدم وفي حالته الأصلية، مع العبوة والملصقات والإكسسوارات وفاتورة الشراء إن وجدت. لا تبدأ عملية الإرجاع قبل الحصول على موافقة خدمة العملاء.</p>'],
      ['منتج تالف أو غير مطابق', '<p>إذا وصل المنتج تالفاً أو مختلفاً عن الوصف، أرسل رقم الطلب وصوراً واضحة عبر واتساب خلال أقرب وقت، وسنراجع الحالة وننسق الاستبدال أو الاسترداد المناسب.</p>'],
      ['حالات لا يشملها الإرجاع', '<p>لا تُقبل المنتجات المستخدمة أو التي تضررت عبوتها بسبب العميل، كما قد تُستثنى المنتجات الشخصية أو القابلة للتلف أو المنتجات التي فُتحت لأسباب صحية، إلا عند وجود عيب مصنعي.</p>'],
      ['رسوم الإرجاع', '<p>يتحمل المتجر تكاليف الإرجاع عند ثبوت التلف أو عدم مطابقة المنتج. في حالة تغيير الرأي، قد يتحمل العميل تكلفة شحن الإرجاع بعد توضيحها قبل التنفيذ.</p>'],
      ['الفحص والاسترداد', '<p>بعد استلام المنتج وفحصه، نرسل نتيجة المراجعة وننسق الاسترداد بالطريقة المتاحة والمتفق عليها. قد تستغرق المراجعة عدة أيام عمل بحسب حالة الشحنة وطريقة الدفع.</p>'],
      ['طريقة تقديم الطلب', '<p>تواصل معنا عبر <a href="https://wa.me/201110760081" target="_blank" rel="noopener">واتساب</a> مع رقم الطلب، اسم العميل، سبب الإرجاع وصور المنتج عند وجود عيب.</p>']
    ]
  },
  shipping: {
    slug: 'shipping-policy',
    title: 'سياسة الشحن والتوصيل',
    description: 'تفاصيل نطاق التوصيل ومحافظات الكويت ورسوم الشحن المجانية أو التي تصل إلى 5 د.ك ومدة تجهيز وتسليم طلبات كويت شوب.',
    intro: 'نوصل طلبات كويت شوب داخل دولة الكويت فقط، مع تنسيق التفاصيل النهائية للتوصيل عند تأكيد الطلب عبر واتساب.',
    sections: [
      ['نطاق التوصيل', '<p>التوصيل متاح إلى المحافظات الكويتية الست: العاصمة، حولي، الفروانية، الجهراء، الأحمدي ومبارك الكبير. لا يقبل نموذج الطلب عناوين خارج دولة الكويت.</p>'],
      ['رسوم الشحن حسب المنطقة', '<p>الشحن مجاني لبعض المناطق المشمولة بالعروض. أما المناطق الأخرى فتُحسب الرسوم حسب العنوان وتظهر للعميل قبل تأكيد الطلب، وتصل في أعلى حد إلى 5 د.ك.</p><div class="shipping-rate-list"><div><strong>مجاني</strong><span>للمناطق المشمولة بعرض الشحن المجاني</span></div><div><strong>1 د.ك</strong><span>لباقي المناطق حسب العرض والعنوان</span></div><div><strong>2 د.ك</strong><span>أم الهيمان، شاليهات بنيدر، كبد، صباح الأحمد، صباح المطلاع</span></div><div><strong>5 د.ك</strong><span>الوفرة، الخيران</span></div></div><p class="shipping-disclaimer">تُراجع المنطقة والعنوان التفصيلي قبل اعتماد الطلب، وقد تتغير الرسوم عند تحديث عروض الشحن.</p>'],
      ['المدة المتوقعة', '<p>تُجهّز الطلبات عادة خلال 0–1 يوم عمل، ويُتوقع وصولها خلال 1–3 أيام عمل من تأكيد الطلب. قد تتغير المدة بسبب العطلات أو الظروف الخارجة عن السيطرة.</p>'],
      ['بيانات العنوان', '<p>اكتب المحافظة والمنطقة والقطعة والشارع ورقم المنزل أو المبنى وأي علامة مميزة، وتأكد من توفر الهاتف الكويتي للرد على المندوب.</p>'],
      ['تأخر أو تعذر التسليم', '<p>إذا تعذر الوصول بسبب عنوان ناقص أو عدم الرد، قد يعاد تنسيق موعد التسليم. في حال تأخر الطلب، تواصل معنا عبر <a href="https://wa.me/201110760081" target="_blank" rel="noopener">واتساب خدمة العملاء</a>.</p>']
    ]
  },
  about: {
    slug: 'about-us',
    title: 'نبذة عن كويت شوب',
    description: 'تعرف على كويت شوب، متجر إلكتروني يركز على خيارات عملية للبيت والحياة اليومية داخل الكويت.',
    intro: 'كويت شوب وجهة تسوق إلكترونية عربية تجمع منتجات عملية ومتنوعة للبيت والحياة اليومية في تجربة واضحة ومريحة.',
    sections: [
      ['اختيارات تناسبك', '<p>نرتب المنتجات في تصنيفات مفهومة ونحرص على إظهار السعر والوصف ومعلومات الشحن ليسهل عليك اتخاذ قرارك.</p>'],
      ['تجربة محلية', '<p>نركز على خدمة العملاء والتوصيل داخل محافظات الكويت، ونراجع تفاصيل الطلب معك عبر واتساب قبل إرساله.</p>'],
      ['الجهة المالكة والمشغلة', '<p>كويت شوب علامة تجارية مملوكة ومدارة من شركة <strong>إعلانات العرب للتسويق الإلكتروني (Arab Ads)</strong>. المكتب المسجل: Building 69, Apartment 3, 1st Neighborhood, 6th District, 6th of October City, Giza, Egypt. الرمز البريدي: 12566. رقم التسجيل الضريبي: 657-989-878.</p><p>البريد الإلكتروني: <a href="mailto:sherow1982@gmail.com">sherow1982@gmail.com</a></p>'],
      ['هل تحتاج مساعدة؟', '<p>فريقنا جاهز للإجابة عن التوفر والمواصفات والتوصيل. <a href="/ar/contact-us">تواصل معنا</a> وسنساعدك.</p>']
    ]
  },
  contact: {
    slug: 'contact-us',
    title: 'تواصل معنا',
    description: 'تواصل مع خدمة عملاء كويت شوب للاستفسار عن المنتجات والطلبات والتوصيل والاسترجاع.',
    intro: 'يسعدنا الرد على أسئلتك ومساعدتك في اختيار المنتج أو متابعة الطلب داخل الكويت.',
    sections: [
      ['خدمة العملاء عبر واتساب', '<p>اضغط الزر أدناه لإرسال رسالتك إلى خدمة العملاء. لا ترسل بيانات بطاقات الدفع أو أي معلومات حساسة عبر المحادثة.</p><p><a class="legal-whatsapp" href="https://wa.me/201110760081" target="_blank" rel="noopener">تواصل عبر واتساب</a></p>'],
      ['ما المعلومات المفيدة؟', '<p>للطلبات، اذكر رقم الطلب والاسم والمنطقة. وللاستفسار عن منتج، أرسل اسمه أو رابط صفحته وسنراجع التوفر والمواصفات.</p>'],
      ['ساعات الرد', '<p>نرد على الرسائل خلال أوقات خدمة العملاء وبأقرب وقت ممكن. قد يتأخر الرد في العطلات أو خارج ساعات العمل.</p>'],
      ['بيانات الشركة المشغلة', '<p>هذا المتجر تابع لشركة <strong>إعلانات العرب للتسويق الإلكتروني (Arab Ads)</strong>. المكتب المسجل: Building 69, Apartment 3, 1st Neighborhood, 6th District, 6th of October City, Giza, Egypt، الرمز البريدي 12566، رقم التسجيل الضريبي 657-989-878. البريد الإلكتروني: <a href="mailto:sherow1982@gmail.com">sherow1982@gmail.com</a>.</p>']
    ]
  }
};

const LEGAL_PATHS = Object.fromEntries(Object.entries(LEGAL_PAGES).flatMap(([key, page]) => [
  [`/ar/${page.slug}`, key],
  [`/ar/${key}`, key],
  [`/${page.slug}`, key]
]));

const SEO_PAGE_TYPES = {
  'شراء': {
    label: 'شراء',
    title: (product) => `شراء ${product.title} في الكويت`,
    eyebrow: 'دليل الشراء في الكويت',
    intro: (product) => `كل ما تحتاجه لطلب ${product.title} داخل الكويت: السعر، التوفر، الشحن وطريقة إتمام الطلب.`,
    sections: (product) => [
      ['السعر والتوفر', `سعر ${product.title} حالياً هو ${price(product.price)}، والمنتج متوفر للطلب وفق حالة المخزون المعروضة في المتجر.`],
      ['طريقة الطلب', 'أضف المنتج إلى السلة، أدخل عنوانك ورقم هاتف كويتي بصيغة +965، ثم راجع تفاصيل الطلب في واتساب قبل الإرسال.'],
      ['التوصيل داخل الكويت', 'نوصل إلى محافظات الكويت الست. الشحن مجاني لبعض المناطق وتصل رسوم المناطق الخاصة إلى 5 د.ك؛ تظهر التفاصيل قبل تأكيد الطلب.']
    ]
  },
  'افضل': {
    label: 'أفضل',
    title: (product) => `أفضل ${product.title} في الكويت`,
    eyebrow: 'دليل اختيار المنتج',
    intro: (product) => `دليل مختصر لمن يبحث عن أفضل ${product.title} في الكويت مع مواصفات المنتج وسعره وخيارات التوصيل المحلية.`,
    sections: (product) => [
      ['لماذا قد يناسبك هذا المنتج؟', `${product.title} مدرج ضمن تصنيف ${product.category}، ويعرض المتجر وصفه ومواصفاته المتاحة لتساعدك على مقارنة احتياجك قبل الطلب.`],
      ['قبل الشراء', 'راجع وصف المنتج والصور والسعر، وتأكد من أن الاستخدام والمقاس أو السعة المناسبة مذكورة في التفاصيل قبل إضافة المنتج إلى السلة.'],
      ['خدمة محلية', 'يتوفر الطلب داخل الكويت فقط مع تأكيد العنوان ورقم الهاتف عبر واتساب، لتبقى تفاصيل التوصيل واضحة قبل الإرسال.']
    ]
  },
  'احسن': {
    label: 'أحسن',
    title: (product) => `أحسن ${product.title} في الكويت`,
    eyebrow: 'مقارنة قبل الطلب',
    intro: (product) => `صفحة معلومات تساعدك على اختيار أحسن ${product.title} في الكويت بناءً على الوصف والسعر والتوفر والتوصيل.`,
    sections: (product) => [
      ['مؤشرات الاختيار', `ابدأ بمراجعة وصف ${product.title}، ثم قارن السعر الحالي ${price(product.price)} مع احتياجك والاستخدام المتوقع.`],
      ['معلومات المنتج', `ينتمي المنتج إلى ${product.googleProductCategory || product.category}، ويمكن الرجوع إلى صفحة المنتج لرؤية الصور والوصف الكامل.`],
      ['الطلب الآمن', 'تُرسل تفاصيل السلة والعنوان إلى واتساب للمراجعة قبل الإرسال؛ لا تظهر بيانات بطاقتك داخل نموذج الطلب.']
    ]
  },
  'تجربتي': {
    label: 'تجربتي مع',
    title: (product) => `تجربتي مع ${product.title} في الكويت`,
    eyebrow: 'دليل تجربة المنتج',
    intro: (product) => `ملخص معلوماتي عن ${product.title} في الكويت يشرح ما ينبغي التحقق منه قبل الشراء والاستخدام.`,
    sections: (product) => [
      ['ماذا تتوقع من المنتج؟', `يعرض المتجر ${product.title} ضمن ${product.category} مع وصف وصور المنتج المتاحة من المصدر.`],
      ['ملاحظات قبل الاستخدام', 'راجع المواصفات والتعليمات المرفقة مع المنتج عند الاستلام، واحتفظ بالعبوة الأصلية إذا احتجت إلى تقديم طلب استرجاع أو استبدال.'],
      ['تقييمات حقيقية', 'لا ننشر تجارب أو تقييمات منسوبة إلى عملاء دون مصدر. عند توفر تقييمات موثقة، ستظهر في صفحة المنتج بشكل واضح.']
    ]
  }
};

function seoLandingPath(product, type) {
  return `/${type}/${product.slug}`;
}

function legalFooterMarkup() {
  return `<div class="footer-links" aria-label="روابط المتجر"><a href="/ar/about-us">نبذة عنا</a><a href="/ar/contact-us">تواصل معنا</a><a href="/ar/privacy-policy">الخصوصية</a><a href="/ar/terms-and-conditions">الشروط والأحكام</a><a href="/ar/refund-policy">الاسترجاع والاسترداد</a><a href="/ar/shipping-policy">الشحن والتوصيل</a></div>`;
}

function companyFooterMarkup() {
  return `<div class="company-attribution"><strong>كويت شوب تابع لشركة إعلانات العرب للتسويق الإلكتروني (Arab Ads)</strong><span>المكتب المسجل: Building 69, Apartment 3, 1st Neighborhood, 6th District, 6th of October City, Giza, Egypt · P.O. Box 12566</span><span>الرقم الضريبي: 657-989-878 · <a href="mailto:sherow1982@gmail.com">sherow1982@gmail.com</a> · <a href="https://wa.me/201110760081" target="_blank" rel="noopener">واتساب خدمة العملاء</a></span></div>`;
}

const KUWAIT_GOVERNORATES = ['العاصمة', 'حولي', 'الفروانية', 'الجهراء', 'الأحمدي', 'مبارك الكبير'];

function mountCheckoutFields() {
  document.querySelectorAll('#checkout-form').forEach((form) => {
    const phone = form.querySelector('[name="customerPhone"]');
    const address = form.querySelector('[name="address"]')?.closest('label');
    if (phone) {
      phone.placeholder = '+96599077241';
      phone.setAttribute('pattern', '\\+965[24569][0-9]{7}');
      phone.setAttribute('maxlength', '12');
      phone.setAttribute('title', 'أدخل رقم هاتف كويتي بصيغة +965 ثم 8 أرقام');
      if (!phone.dataset.kuwaitPrefixBound) {
        phone.dataset.kuwaitPrefixBound = 'true';
        phone.value = phone.value.startsWith('+965') ? phone.value : '+965';
        phone.addEventListener('focus', () => phone.setSelectionRange(phone.value.length, phone.value.length));
        phone.addEventListener('input', () => {
          const localDigits = normalizePhone(phone.value).replace(/^965/, '').slice(0, 8);
          phone.value = `+965${localDigits}`;
          phone.setCustomValidity('');
        });
      }
    }
    if (address && !form.querySelector('[name="governorate"]')) {
      const label = document.createElement('label');
      label.innerHTML = `<span>محافظة التوصيل</span><select name="governorate" required><option value="">اختر المحافظة</option>${KUWAIT_GOVERNORATES.map((name) => `<option value="${name}">${name}</option>`).join('')}</select>`;
      address.before(label);
    }
  });
}

function normalizePhone(value) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return String(value || '')
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[^0-9]/g, '');
}

function isKuwaitPhone(value) {
  return /^965[24569][0-9]{7}$/.test(normalizePhone(value));
}

function sendProductToWhatsApp(product) {
  if (!product) return;
  const message = [
    'السلام عليكم، أرغب بطلب هذا المنتج من كويت شوب 🛍️',
    '',
    `المنتج: ${product.title}`,
    `السعر: ${price(product.price)}`,
    product.original ? `السعر قبل الخصم: ${price(product.original)}` : '',
    `التصنيف: ${product.category}`,
    `تصنيف Google: ${product.googleProductCategory || ''}`,
    `رقم المنتج: ${product.id}`,
    `رابط المنتج: ${window.location.origin}${productPath(product)}`,
    '',
    `الوصف: ${product.description || 'منتج مختار بعناية.'}`,
    `الشحن: ${product.shipping || 'مجاني لبعض المناطق، وتصل الرسوم إلى 5 د.ك حسب المنطقة.'}`,
    '',
    'الكمية المطلوبة: 1'
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/201110760081?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function getCategories() {
  const totals = new Map();
  state.products.forEach((product) => totals.set(product.category, (totals.get(product.category) || 0) + 1));
  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ name, count }));
}

function filteredProducts() {
  const normalizedQuery = state.query.trim().toLocaleLowerCase('ar');
  const matches = state.products.filter((product) => {
    const isCategory = state.category === 'الكل' || product.category === state.category;
    const haystack = `${product.title} ${product.category} ${product.description}`.toLocaleLowerCase('ar');
    return isCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
  });

  return matches.sort((left, right) => {
    if (state.sort === 'low') return left.price - right.price;
    if (state.sort === 'high') return right.price - left.price;
    if (state.sort === 'discount') return ((right.original - right.price) / (right.original || 1)) - ((left.original - left.price) / (left.original || 1));
    return Number(Boolean(right.original)) - Number(Boolean(left.original));
  });
}

function discount(product) {
  return product.original > product.price ? Math.round((1 - product.price / product.original) * 100) : 0;
}

function productCard(product) {
  const savings = discount(product);
  return `
    <article class="product-card">
      <a class="product-image" href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener" aria-label="عرض ${escapeHtml(product.title)}">
        <span class="product-badge product-badge-new">جديد</span>
        ${savings ? `<span class="discount-badge">−${savings}%</span>` : ''}
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" decoding="async" onerror="this.classList.add('image-failed'); this.alt='صورة المنتج غير متاحة';" />
      </a>
      <div class="product-hover-actions"><button data-action="open-product" data-product-id="${escapeHtml(product.id)}" aria-label="معاينة سريعة"><span aria-hidden="true">⌕</span></button><button data-action="toggle-wishlist" data-product-id="${escapeHtml(product.id)}" aria-label="إضافة للمفضلة"><span aria-hidden="true">♡</span></button></div>
      <div class="product-content">
        <button class="category-label" data-action="set-category" data-category="${escapeHtml(product.category)}">${escapeHtml(product.category)}</button>
        <h3><a href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener">${escapeHtml(product.title)}</a></h3>
        <div class="product-rating" aria-label="تقييم المنتج"><span>★★★★★</span><small>لا توجد مراجعات</small></div>
        <div class="price-row">
          <span class="current-price">${price(product.price)}</span>
          ${product.original ? `<span class="old-price">${price(product.original)}</span>` : ''}
        </div>
        <div class="card-footer">
          <span class="availability"><i></i> متوفر في المخزون</span>
          <button class="add-button" data-action="add-cart" data-product-id="${escapeHtml(product.id)}"><span>أضف للسلة</span><b aria-hidden="true">+</b></button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const allProducts = filteredProducts();
  const results = allProducts.slice(0, state.visible);
  const grid = document.querySelector('#products-grid');
  const count = document.querySelector('#results-count');
  const loadMore = document.querySelector('#load-more');

  count.textContent = `${currency.format(allProducts.length)} منتج`;
  grid.innerHTML = results.length
    ? results.map(productCard).join('')
    : `<div class="empty-state"><span>⌕</span><h3>لم نجد ما تبحث عنه</h3><p>جرّب كلمات مختلفة أو تصنيفاً آخر.</p><button class="outline-button" data-action="reset-filters">عرض كل المنتجات</button></div>`;
  loadMore.hidden = results.length >= allProducts.length || !results.length;
  loadMore.querySelector('span').textContent = `عرض المزيد (${Math.max(0, allProducts.length - results.length).toLocaleString('ar-KW')})`;
}

function renderCategories() {
  const categories = getCategories();
  const categoryList = document.querySelector('#category-list');
  const visibleCategories = state.categoriesExpanded ? categories : categories.slice(0, 10);
  categoryList.innerHTML = [
    `<button class="category-chip ${state.category === 'الكل' ? 'is-active' : ''}" data-action="set-category" data-category="الكل">كل المنتجات <small>${currency.format(state.products.length)}</small></button>`,
    ...visibleCategories.map(({ name, count }) => `<button class="category-chip ${state.category === name ? 'is-active' : ''}" data-action="set-category" data-category="${escapeHtml(name)}">${escapeHtml(name)} <small>${currency.format(count)}</small></button>`)
  ].join('');
  const toggle = document.querySelector('#category-toggle');
  toggle.hidden = categories.length <= 10;
  toggle.textContent = state.categoriesExpanded ? 'عرض أقل' : `كل التصنيفات (${currency.format(categories.length)})`;
}

function renderCart() {
  const cartList = document.querySelector('#cart-list');
  const total = document.querySelector('#cart-total');
  const checkout = document.querySelector('#checkout-button');
  document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = cartCount().toLocaleString('ar-KW'); });
  const floatingTotal = document.querySelector('#floating-cart-total');
  if (floatingTotal) floatingTotal.textContent = price(cartTotal());
  if (!cartList || !total || !checkout) return;
  total.textContent = price(cartTotal());
  checkout.disabled = !state.cart.length;
  cartList.innerHTML = state.cart.length ? state.cart.map((item) => `
    <li class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="" />
      <div class="cart-item-info"><strong>${escapeHtml(item.title)}</strong><span>${price(item.price)}</span></div>
      <div class="quantity-control">
        <button data-action="change-quantity" data-product-id="${escapeHtml(item.id)}" data-delta="1" aria-label="زيادة الكمية">+</button>
        <span>${item.quantity.toLocaleString('ar-KW')}</span>
        <button data-action="change-quantity" data-product-id="${escapeHtml(item.id)}" data-delta="-1" aria-label="تقليل الكمية">−</button>
      </div>
    </li>`).join('') : `<li class="cart-empty"><span>🛍</span><h3>سلتك فارغة</h3><p>أضف ما يعجبك لنبدأ الطلب.</p></li>`;
}

function renderProductPage(product) {
  const description = product.description || 'منتج مختار بعناية لتلبية احتياجاتك اليومية.';
  const related = state.products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const savings = discount(product);
  updateSeoMetadata({
    title: `${product.title} | كويت شوب`,
    description: `${product.title} — ${description.slice(0, 145)}`,
    canonical: `https://kuwait-shop.arabsads.shop${productPath(product)}`,
    type: 'product'
  });
  document.querySelector('#product-jsonld')?.remove();
  const schemaScript = document.createElement('script');
  schemaScript.id = 'product-jsonld';
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify(productStructuredData(product, description, window.location.href));
  document.head.append(schemaScript);
  app.innerHTML = `
    <div class="announcement"><span>🇰🇼</span><b>تسوّق كويتي براحة</b><span>•</span><span>توصيل إلى مختلف مناطق الكويت</span></div>
    <header class="site-header">
      <a href="/" class="brand" aria-label="كويت شوب - الرئيسية"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a>
      <nav class="main-nav" aria-label="التنقل الرئيسي"><a href="/">الرئيسية</a><a href="/#products">تسوّق</a><a href="/#why-us">لماذا كويت شوب؟</a></nav>
      <div class="header-actions"><a class="search-trigger" href="/#products" aria-label="بحث">⌕</a><button class="cart-trigger" data-action="open-cart" aria-label="فتح السلة"><span class="bag-icon">♧</span><b data-cart-count>0</b><span>السلة</span></button></div>
    </header>
    <main class="product-page" id="top">
      <div class="product-breadcrumbs"><a href="/">الرئيسية</a><span>←</span><a href="/#products">${escapeHtml(product.category)}</a><span>←</span><strong>${escapeHtml(product.title)}</strong></div>
      <section class="product-detail woodmart-product-layout">
        <div class="product-gallery">
          <div class="gallery-thumbs" aria-label="صور المنتج"><button class="is-active" aria-label="الصورة الرئيسية"><img src="${escapeHtml(product.image)}" alt="" /></button></div>
          <div class="product-detail-image"><span class="kuwait-stamp">اختيار كويتي</span>${savings ? `<span class="detail-sale-badge">−${discount(product)}%</span>` : ''}<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" /></div>
        </div>
        <div class="product-detail-copy product-summary">
          <a class="product-category-link" href="/#products">${escapeHtml(product.category)}</a>
          <h1>${escapeHtml(product.title)}</h1>
          <div class="detail-rating"><span aria-label="خمس نجوم">★★★★★</span><a href="#product-info">لا توجد مراجعات بعد</a><i>•</i><span class="summary-sku">SKU: ${escapeHtml(product.id)}</span></div>
          <div class="detail-price"><strong>${price(product.price)}</strong>${product.original ? `<del>${price(product.original)}</del><em>وفر ${discount(product)}%</em>` : ''}</div>
          <div class="detail-rule"></div>
          <p class="product-short-description">${escapeHtml(description)}</p>
          <ul class="product-facts"><li><span>التوفر</span><b><i></i> متوفر في المخزون</b></li><li><span>التصنيف</span><b>${escapeHtml(product.category)}</b></li><li><span>التوصيل</span><b>داخل محافظات الكويت</b></li></ul>
          <div class="shipping-note">✦ ${escapeHtml(product.shipping || 'الشحن مجاني لبعض المناطق، وتصل الرسوم إلى 5 د.ك حسب المنطقة.')}</div>
          <div class="detail-actions"><div class="detail-quantity" aria-label="كمية المنتج"><button data-action="detail-quantity-change" data-delta="-1" aria-label="تقليل الكمية">−</button><input id="detail-quantity" value="1" type="number" min="1" inputmode="numeric" aria-label="الكمية" /><button data-action="detail-quantity-change" data-delta="1" aria-label="زيادة الكمية">+</button></div><button class="primary-button detail-add-button" data-action="add-cart" data-detail-quantity="true" data-product-id="${escapeHtml(product.id)}">أضف إلى السلة <span>←</span></button></div>
          <button class="whatsapp-product-button full-whatsapp-button" data-action="product-whatsapp" data-product-id="${escapeHtml(product.id)}"><span>◉</span> اطلب هذا المنتج عبر واتساب</button>
          <div class="detail-trust"><span>✓ دفع وتأكيد آمن</span><span>✓ توصيل محلي</span><span>✓ دعم عبر واتساب</span></div>
        </div>
      </section>
      <section class="product-tabs" id="product-info"><div class="product-tabs-nav" role="tablist"><button class="is-active" data-action="select-product-tab" data-product-tab="description" role="tab">الوصف</button><button data-action="select-product-tab" data-product-tab="shipping" role="tab">الشحن والتوصيل</button><button data-action="select-product-tab" data-product-tab="returns" role="tab">الاسترجاع والاسترداد</button><button data-action="select-product-tab" data-product-tab="information" role="tab">معلومات إضافية</button></div><div class="product-tab-content is-active" data-product-panel="description"><p>${escapeHtml(description)}</p></div><div class="product-tab-content" data-product-panel="shipping"><p>التوصيل متاح داخل دولة الكويت. الشحن مجاني لبعض المناطق، فيما تصل الرسوم إلى 5 د.ك للمناطق ذات الرسوم الخاصة. راجع <a href="/ar/shipping-policy">سياسة الشحن والتوصيل</a> قبل تأكيد الطلب.</p></div><div class="product-tab-content" data-product-panel="returns"><p>يمكنك طلب الاسترجاع أو الاستبدال خلال 14 يوماً من استلام الطلب، بشرط أن يكون المنتج غير مستخدم وفي عبوته الأصلية مع ملحقاته. المنتجات الشخصية أو القابلة للتلف أو المفتوحة لأسباب صحية لا تُقبل إلا عند وجود عيب مصنعي.</p><p>للطلبات التالفة أو غير المطابقة، تواصل معنا مع رقم الطلب وصور واضحة للمنتج. اقرأ <a href="/ar/refund-policy">سياسة الاسترجاع والاسترداد الكاملة</a> قبل تقديم الطلب.</p></div><div class="product-tab-content" data-product-panel="information"><div><span>التصنيف</span><strong>${escapeHtml(product.googleProductCategory || product.category)}</strong></div><div><span>رمز المنتج</span><strong>${escapeHtml(product.id)}</strong></div><div><span>الحالة</span><strong>متوفر في المخزون</strong></div></div></section>
      <section class="product-seo-guides"><div><p class="eyebrow">أدلة المنتج في الكويت</p><h2>تعرف على ${escapeHtml(product.title)}</h2></div><div>${Object.entries(SEO_PAGE_TYPES).map(([type, page]) => `<a href="${escapeHtml(seoLandingPath(product, type))}" target="_blank" rel="noopener"><span>${page.label}</span><b>${escapeHtml(product.title)}</b><i>←</i></a>`).join('')}</div></section>
      ${related.length ? `<section class="related-section"><div class="section-heading"><div><p class="eyebrow">قد يعجبك أيضاً</p><h2>منتجات من نفس التصنيف</h2></div><a class="text-button dark-text" href="/#products">عرض الكل <span>←</span></a></div><div class="products-grid">${related.map(productCard).join('')}</div></section>` : ''}
    </main>
    <footer><a class="brand" href="/"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><p>وجهتك اليومية لمنتجات البيت والحياة في الكويت.</p>${legalFooterMarkup()}${companyFooterMarkup()}<small>© ${new Date().getFullYear()} كويت شوب. جميع الحقوق محفوظة.</small></footer>
    <aside id="cart-drawer" class="cart-drawer" aria-label="سلة التسوق" aria-hidden="true"><div class="drawer-header"><div><p class="eyebrow">طلبك المختار</p><h2>سلة التسوق <small data-cart-count>0</small></h2></div><button data-action="close-cart" aria-label="إغلاق السلة">×</button></div><ul id="cart-list"></ul><div class="drawer-footer"><div><span>الإجمالي التقريبي</span><strong id="cart-total"></strong></div><button id="checkout-button" class="primary-button full-button" data-action="checkout">إتمام الطلب <span>←</span></button><small>سيتم تأكيد التوصيل والدفع عند إتمام الطلب.</small></div></aside><div class="drawer-backdrop" id="drawer-backdrop" data-action="close-cart"></div>
    <button class="floating-cart" data-action="open-cart" aria-label="فتح السلة العائمة"><span class="floating-cart-icon">♧</span><span class="floating-cart-copy"><strong>السلة</strong><small id="floating-cart-total">٠٫٠٠ د.ك</small></span><b data-cart-count>0</b></button>
    <dialog id="checkout-dialog" class="checkout-dialog" aria-label="بيانات إتمام الطلب"><button class="dialog-close" data-action="close-checkout" aria-label="إغلاق">×</button><div class="checkout-heading"><p class="eyebrow">خطوة أخيرة</p><h2>أرسل طلبك للمتجر</h2><p>أدخل بيانات التوصيل، وسنفتح لك واتساب برسالة مرتبة بكل المنتجات والتفاصيل.</p></div><form id="checkout-form"><div class="form-grid"><label><span>الاسم الكامل</span><input name="customerName" autocomplete="name" required placeholder="مثال: محمد العتيبي" /></label><label><span>رقم الهاتف</span><input name="customerPhone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="مثال: 5xxxxxxxx" /></label></div><label><span>منطقة وعنوان التوصيل</span><input name="address" autocomplete="street-address" required placeholder="مثال: السالمية، قطعة 4، شارع 12، منزل 8" /></label><label><span>ملاحظات إضافية <small>(اختياري)</small></span><textarea name="notes" rows="3" placeholder="وقت مناسب للتوصيل أو أي تفاصيل تساعدنا..."></textarea></label><button class="primary-button full-button" type="submit">فتح واتساب وإرسال الطلب <span>←</span></button><small class="form-note">سيتم فتح محادثة واتساب برسالة جاهزة للمراجعة قبل الإرسال.</small></form></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  renderCart();
  mountCheckoutFields();
}

function renderLegalPage(key) {
  const page = LEGAL_PAGES[key];
  if (!page) return render();
  const canonical = `https://kuwait-shop.arabsads.shop/ar/${page.slug}`;
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  updateSeoMetadata({ title: `${page.title} | كويت شوب`, description: page.description, canonical });
  document.querySelector('#product-jsonld')?.remove();
  document.querySelector('#legal-jsonld')?.remove();
  const schemaScript = document.createElement('script');
  schemaScript.id = 'legal-jsonld';
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonical,
    inLanguage: 'ar-KW',
    isPartOf: { '@type': 'WebSite', name: 'كويت شوب', url: 'https://kuwait-shop.arabsads.shop/' }
  });
  document.head.append(schemaScript);
  app.innerHTML = `
    <div class="announcement"><span>🇰🇼</span><b>تسوّق كويتي براحة</b><span>•</span><span>توصيل إلى مختلف مناطق الكويت</span></div>
    <header class="site-header">
      <a href="/" class="brand" aria-label="كويت شوب - الرئيسية"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a>
      <nav class="main-nav" aria-label="التنقل الرئيسي"><a href="/">الرئيسية</a><a href="/#products">تسوّق</a><a href="/ar/about-us">نبذة عنا</a><a href="/ar/contact-us">تواصل معنا</a></nav>
      <div class="header-actions"><a class="search-trigger" href="/#products" aria-label="بحث">⌕</a><button class="cart-trigger" data-action="open-cart" aria-label="فتح السلة"><span class="bag-icon">♧</span><b data-cart-count>0</b><span>السلة</span></button></div>
    </header>
    <main class="legal-page" id="top">
      <div class="product-breadcrumbs"><a href="/">الرئيسية</a><span>←</span><strong>${page.title}</strong></div>
      <section class="legal-hero"><div><p class="eyebrow">كويت شوب · معلومات مهمة</p><h1>${page.title}</h1><p>${page.intro}</p><small>آخر تحديث: 25 يوليو 2026</small></div><div class="legal-hero-mark" aria-hidden="true">${key === 'privacy' ? '♧' : key === 'shipping' ? '✦' : 'ك'}</div></section>
      <article class="legal-card">
        <div class="legal-card-header"><span class="category-label static-label">دليل المتجر</span><p>نحرص على أن تكون تجربتك واضحة وآمنة من أول زيارة حتى استلام طلبك.</p></div>
        <div class="legal-content">${page.sections.map(([heading, body], index) => `<section><span class="legal-index">${String(index + 1).padStart(2, '0')}</span><div><h2>${heading}</h2>${body}</div></section>`).join('')}</div>
      </article>
      <section class="legal-next"><p class="eyebrow">هل تحتاج مساعدة؟</p><h2>نحن هنا لخدمتك داخل الكويت.</h2><a class="primary-button" href="/ar/contact-us">تواصل معنا <span>←</span></a></section>
    </main>
    <footer><a class="brand" href="/"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><p>وجهتك اليومية لمنتجات البيت والحياة في الكويت.</p>${legalFooterMarkup()}${companyFooterMarkup()}<small>© ${new Date().getFullYear()} كويت شوب. جميع الحقوق محفوظة.</small></footer>
    <aside id="cart-drawer" class="cart-drawer" aria-label="سلة التسوق" aria-hidden="true"><div class="drawer-header"><div><p class="eyebrow">طلبك المختار</p><h2>سلة التسوق <small data-cart-count>0</small></h2></div><button data-action="close-cart" aria-label="إغلاق السلة">×</button></div><ul id="cart-list"></ul><div class="drawer-footer"><div><span>الإجمالي التقريبي</span><strong id="cart-total"></strong></div><button id="checkout-button" class="primary-button full-button" data-action="checkout">إتمام الطلب <span>←</span></button><small>سيتم تأكيد التوصيل والدفع عند إتمام الطلب.</small></div></aside><div class="drawer-backdrop" id="drawer-backdrop" data-action="close-cart"></div>
    <button class="floating-cart" data-action="open-cart" aria-label="فتح السلة العائمة"><span class="floating-cart-icon">♧</span><span class="floating-cart-copy"><strong>السلة</strong><small id="floating-cart-total">٠ د.ك</small></span><b data-cart-count>0</b></button>
    <dialog id="checkout-dialog" class="checkout-dialog" aria-label="بيانات إتمام الطلب"><button class="dialog-close" data-action="close-checkout" aria-label="إغلاق">×</button><div class="checkout-heading"><p class="eyebrow">خطوة أخيرة</p><h2>أرسل طلبك للمتجر</h2><p>أدخل بيانات التوصيل، وسنفتح لك واتساب برسالة مرتبة بكل المنتجات والتفاصيل.</p></div><form id="checkout-form"><div class="form-grid"><label><span>الاسم الكامل</span><input name="customerName" autocomplete="name" required placeholder="مثال: محمد العتيبي" /></label><label><span>رقم الهاتف</span><input name="customerPhone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+96599077241" /></label></div><label><span>منطقة وعنوان التوصيل</span><input name="address" autocomplete="street-address" required placeholder="مثال: السالمية، قطعة 4، شارع 12، منزل 8" /></label><label><span>ملاحظات إضافية <small>(اختياري)</small></span><textarea name="notes" rows="3" placeholder="وقت مناسب للتوصيل أو أي تفاصيل تساعدنا..."></textarea></label><button class="primary-button full-button" type="submit">فتح واتساب وإرسال الطلب <span>←</span></button><small class="form-note">سيتم فتح محادثة واتساب برسالة جاهزة للمراجعة قبل الإرسال.</small></form></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  renderCart();
  mountCheckoutFields();
}

function renderSeoLandingPage(product, type) {
  const page = SEO_PAGE_TYPES[type];
  if (!page || !product) return render();
  const title = `${page.title(product)} | كويت شوب`;
  const description = `${page.intro(product)} السعر الحالي ${price(product.price)}.`;
  const canonical = `https://kuwait-shop.arabsads.shop${seoLandingPath(product, type)}`;
  updateSeoMetadata({ title, description, canonical, type: 'article' });
  document.querySelector('#product-jsonld')?.remove();
  document.querySelector('#legal-jsonld')?.remove();
  document.querySelector('#seo-jsonld')?.remove();
  const schemaScript = document.createElement('script');
  schemaScript.id = 'seo-jsonld';
  schemaScript.type = 'application/ld+json';
  schemaScript.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title(product),
    description,
    inLanguage: 'ar-KW',
    mainEntityOfPage: canonical,
    about: { '@type': 'Product', name: product.title, sku: product.id, category: product.googleProductCategory || product.category, url: `https://kuwait-shop.arabsads.shop${productPath(product)}` },
    author: { '@id': 'https://kuwait-shop.arabsads.shop/#organization' },
    publisher: { '@id': 'https://kuwait-shop.arabsads.shop/#organization' },
    contentLocation: { '@type': 'Country', name: 'Kuwait', identifier: 'KW' }
  });
  document.head.append(schemaScript);
  const sections = page.sections(product).map(([heading, content], index) => `<section><span>${String(index + 1).padStart(2, '0')}</span><div><h2>${heading}</h2><p>${content}</p></div></section>`).join('');
  app.innerHTML = `
    <div class="announcement"><span>🇰🇼</span><b>تسوّق كويتي براحة</b><span>•</span><span>توصيل داخل محافظات الكويت</span></div>
    <header class="site-header"><a href="/" class="brand" aria-label="كويت شوب - الرئيسية"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><nav class="main-nav" aria-label="التنقل الرئيسي"><a href="/">الرئيسية</a><a href="/#products">تسوّق</a><a href="/ar/shipping-policy">الشحن</a><a href="/ar/contact-us">تواصل معنا</a></nav><div class="header-actions"><a class="search-trigger" href="/#products" aria-label="بحث">⌕</a><button class="cart-trigger" data-action="open-cart" aria-label="فتح السلة"><span class="bag-icon">♧</span><b data-cart-count>0</b><span>السلة</span></button></div></header>
    <main class="seo-landing" id="top"><div class="product-breadcrumbs"><a href="/">الرئيسية</a><span>←</span><a href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener">${escapeHtml(product.title)}</a><span>←</span><strong>${page.label}</strong></div><section class="seo-landing-hero"><div><p class="eyebrow">${page.eyebrow} · الكويت</p><h1>${page.title(product)}</h1><p>${page.intro(product)}</p><div class="seo-hero-actions"><a class="primary-button" href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener">عرض المنتج <span>←</span></a><a class="text-button dark-text" href="/ar/shipping-policy">سياسة الشحن <span>←</span></a></div></div><a class="seo-product-summary" href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" /><span>${escapeHtml(product.category)}</span><b>${escapeHtml(product.title)}</b><strong>${price(product.price)}</strong></a></section><article class="seo-guide-content">${sections}</article><section class="seo-guide-cta"><p class="eyebrow">جاهز للطلب؟</p><h2>اطلب ${escapeHtml(product.title)} داخل الكويت</h2><a class="primary-button" href="${escapeHtml(productPath(product))}" target="_blank" rel="noopener">الانتقال لصفحة المنتج <span>←</span></a></section></main>
    <footer><a class="brand" href="/"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><p>وجهتك اليومية لمنتجات البيت والحياة في الكويت.</p>${legalFooterMarkup()}${companyFooterMarkup()}<small>© ${new Date().getFullYear()} كويت شوب. جميع الحقوق محفوظة.</small></footer>
    <aside id="cart-drawer" class="cart-drawer" aria-label="سلة التسوق" aria-hidden="true"><div class="drawer-header"><div><p class="eyebrow">طلبك المختار</p><h2>سلة التسوق <small data-cart-count>0</small></h2></div><button data-action="close-cart" aria-label="إغلاق السلة">×</button></div><ul id="cart-list"></ul><div class="drawer-footer"><div><span>الإجمالي التقريبي</span><strong id="cart-total"></strong></div><button id="checkout-button" class="primary-button full-button" data-action="checkout">إتمام الطلب <span>←</span></button><small>يتم تأكيد التوصيل والدفع قبل الإرسال.</small></div></aside><div class="drawer-backdrop" id="drawer-backdrop" data-action="close-cart"></div><button class="floating-cart" data-action="open-cart" aria-label="فتح السلة العائمة"><span class="floating-cart-icon">♧</span><span class="floating-cart-copy"><strong>السلة</strong><small id="floating-cart-total">٠ د.ك</small></span><b data-cart-count>0</b></button>
    <dialog id="checkout-dialog" class="checkout-dialog" aria-label="بيانات إتمام الطلب"><button class="dialog-close" data-action="close-checkout" aria-label="إغلاق">×</button><div class="checkout-heading"><p class="eyebrow">خطوة أخيرة</p><h2>أرسل طلبك للمتجر</h2><p>أدخل بيانات التوصيل، وسنفتح لك واتساب برسالة مرتبة بكل المنتجات والتفاصيل.</p></div><form id="checkout-form"><div class="form-grid"><label><span>الاسم الكامل</span><input name="customerName" autocomplete="name" required placeholder="مثال: محمد العتيبي" /></label><label><span>رقم الهاتف</span><input name="customerPhone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="+96599077241" /></label></div><label><span>منطقة وعنوان التوصيل</span><input name="address" autocomplete="street-address" required placeholder="مثال: السالمية، قطعة 4، شارع 12، منزل 8" /></label><label><span>ملاحظات إضافية <small>(اختياري)</small></span><textarea name="notes" rows="3" placeholder="وقت مناسب للتوصيل أو أي تفاصيل تساعدنا..."></textarea></label><button class="primary-button full-button" type="submit">فتح واتساب وإرسال الطلب <span>←</span></button><small class="form-note">سيتم فتح محادثة واتساب برسالة جاهزة للمراجعة قبل الإرسال.</small></form></dialog><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
  renderCart();
  mountCheckoutFields();
}

function renderProductDialog() {
  const dialog = document.querySelector('#product-dialog');
  const product = state.activeProduct;
  if (!product) {
    dialog.close();
    return;
  }
  dialog.innerHTML = `
    <button class="dialog-close" data-action="close-product" aria-label="إغلاق">×</button>
    <div class="dialog-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" /></div>
    <div class="dialog-content">
      <span class="category-label static-label">${escapeHtml(product.category)}</span>
      <h2>${escapeHtml(product.title)}</h2>
      <div class="dialog-price"><strong>${price(product.price)}</strong>${product.original ? `<del>${price(product.original)}</del><em>خصم ${discount(product)}%</em>` : ''}</div>
      <p>${escapeHtml(product.description || 'منتج مختار بعناية لتلبية احتياجاتك اليومية.')}</p>
      <div class="shipping-note">✦ ${escapeHtml(product.shipping || 'يتوفر الشحن داخل الكويت.')}</div>
      <button class="primary-button full-button" data-action="add-cart" data-product-id="${escapeHtml(product.id)}">أضف المنتج إلى السلة</button>
    </div>`;
  if (!dialog.open) dialog.showModal();
}

let sliderTimer;

function featuredSliderMarkup() {
  const slides = state.products.slice(0, 3);
  if (!slides.length) return '';
  return `<section class="featured-slider" aria-label="اختيارات كويت شوب المميزة" data-slider-index="0">
    <div class="slider-orbit orbit-one"></div><div class="slider-orbit orbit-two"></div>
    <div class="slider-copy"><p class="eyebrow">اختيارات المحرر</p><h2>تفاصيل صغيرة،<br /><em>فرق كبير في يومك.</em></h2><p>منتجات عملية مختارة بعناية لتضيف لمسة أجمل وأسهل إلى بيتك وحياتك.</p><a class="light-button" href="#products">استكشف المنتجات <span>←</span></a></div>
    <div class="slider-stage">${slides.map((product, index) => `<article class="slider-slide ${index === 0 ? 'is-active' : ''}" data-slide="${index}"><div class="slider-product-image"><span>${String(index + 1).padStart(2, '0')}</span><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" /></div><div class="slider-product-copy"><small>${escapeHtml(product.category)}</small><h3>${escapeHtml(product.title)}</h3><strong>${price(product.price)}</strong><a href="${productPath(product)}" target="_blank" rel="noopener">شاهد التفاصيل <span>←</span></a></div></article>`).join('')}</div>
    <div class="slider-controls"><button type="button" data-action="slider-prev" aria-label="العنصر السابق">→</button><div>${slides.map((_, index) => `<button type="button" class="${index === 0 ? 'is-active' : ''}" data-action="slider-go" data-slide-index="${index}" aria-label="انتقل إلى الشريحة ${index + 1}"></button>`).join('')}</div><button type="button" data-action="slider-next" aria-label="العنصر التالي">←</button></div>
  </section>`;
}

function setSliderSlide(index) {
  const slider = document.querySelector('.featured-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.slider-slide')];
  if (!slides.length) return;
  const nextIndex = (index + slides.length) % slides.length;
  slider.dataset.sliderIndex = String(nextIndex);
  slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === nextIndex));
  slider.querySelectorAll('.slider-controls [data-action="slider-go"]').forEach((button, buttonIndex) => button.classList.toggle('is-active', buttonIndex === nextIndex));
}

function initHeroSlider() {
  window.clearInterval(sliderTimer);
  const slider = document.querySelector('.featured-slider');
  if (!slider) return;
  sliderTimer = window.setInterval(() => setSliderSlide(Number(slider.dataset.sliderIndex || 0) + 1), 5600);
}

function render() {
  updateSeoMetadata({
    title: 'كويت شوب | تسوق داخل الكويت',
    description: 'كويت شوب — تسوق احتياجاتك اليومية بأسعار مختارة وتوصيل داخل الكويت.',
    canonical: 'https://kuwait-shop.arabsads.shop/'
  });
  app.innerHTML = `
    <div class="announcement"><span>🇰🇼</span><b>تسوّق كويتي براحة</b><span>•</span><span>منتجات مختارة لبيتك وحياتك اليومية</span><span>•</span><span>توصيل إلى مختلف مناطق الكويت</span></div>
    <header class="site-header">
      <a href="#top" class="brand" aria-label="كويت شوب - الرئيسية"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a>
      <nav class="main-nav" aria-label="التنقل الرئيسي"><a href="#top">الرئيسية</a><a href="#products">تسوّق</a><a href="#why-us">لماذا كويت شوب؟</a></nav>
      <div class="header-actions"><button class="search-trigger" data-action="focus-search" aria-label="بحث">⌕</button><button class="cart-trigger" data-action="open-cart" aria-label="فتح السلة"><span class="bag-icon">♧</span><b data-cart-count>0</b><span>السلة</span></button></div>
    </header>
    <main id="top">
      <section class="hero">
        <div class="hero-copy"><p class="eyebrow">اختياراتك في مكان واحد</p><h1>كل ما يحتاجه<br /><em>البيت الكويتي.</em></h1><p class="hero-text">تسوّق آلاف المنتجات المختارة بعناية، من احتياجات المنزل إلى الهدايا والإكسسوارات.</p><div class="hero-actions"><a class="primary-button" href="#products">ابدأ التسوّق <span>←</span></a><a class="text-button" href="#why-us">اكتشف المتجر <span>↓</span></a></div><div class="hero-trust"><span><b>4,000+</b> منتج متنوع</span><i></i><span><b>توصيل</b> داخل الكويت</span><i></i><span><b>دفع آمن</b> عند الطلب</span></div></div>
        <div class="hero-art" aria-hidden="true"><img class="hero-brand-banner" src="/brand/kuwait-shop-banner.svg" alt="" /></div>
      </section>
       ${featuredSliderMarkup()}
       <section class="benefits" id="why-us"><div><span>◈</span><p><b>خيارات متنوعة</b><small>كل ما تحتاجه في متجر واحد</small></p></div><div><span>⌁</span><p><b>تجربة تسوّق سهلة</b><small>بحث سريع وسلة واضحة</small></p></div><div><span>⌂</span><p><b>توصيل محلي</b><small>إلى مختلف مناطق الكويت</small></p></div><div><span>✦</span><p><b>عروض مختارة</b><small>قيمة أفضل لطلباتك</small></p></div></section>
      <section class="catalog" id="products"><div class="section-heading"><div><p class="eyebrow">تسوّق حسب احتياجك</p><h2>اكتشف منتجاتنا</h2></div><p>منتجات كثيرة، تجربة شراء واحدة بسيطة.</p></div><div class="search-and-sort"><label class="search-box"><span>⌕</span><input id="search-input" type="search" autocomplete="off" placeholder="ابحث عن منتج، تصنيف، أو احتياج..." /></label><label class="sort-box"><span>ترتيب حسب</span><select id="sort-select"><option value="featured">الأبرز أولاً</option><option value="low">السعر: الأقل أولاً</option><option value="high">السعر: الأعلى أولاً</option><option value="discount">أعلى الخصومات</option></select></label></div><div class="category-bar"><div id="category-list" class="category-list"></div><button id="category-toggle" class="category-more" data-action="toggle-categories"></button></div><div class="results-meta"><span id="results-count">...</span><span>متاح الآن للتسوّق</span></div><div id="products-grid" class="products-grid" aria-live="polite"><div class="loading-state"><span></span><span></span><span></span></div></div><div class="load-more-wrap"><button id="load-more" class="outline-button" data-action="load-more"><span>عرض المزيد</span> ↓</button></div></section>
      <section class="cta-section"><div><p class="eyebrow">وصلت للي تبيه؟</p><h2>أضف منتجاتك واطلبها<br />بكل سهولة.</h2></div><button class="light-button" data-action="open-cart">فتح السلة <span>←</span></button></section>
    </main>
    <footer><a class="brand" href="#top"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><p>وجهتك اليومية لمنتجات البيت والحياة في الكويت.</p>${legalFooterMarkup()}${companyFooterMarkup()}<small>© ${new Date().getFullYear()} كويت شوب. جميع الحقوق محفوظة.</small></footer>
    <aside id="cart-drawer" class="cart-drawer" aria-label="سلة التسوق" aria-hidden="true"><div class="drawer-header"><div><p class="eyebrow">طلبك المختار</p><h2>سلة التسوق <small data-cart-count>0</small></h2></div><button data-action="close-cart" aria-label="إغلاق السلة">×</button></div><ul id="cart-list"></ul><div class="drawer-footer"><div><span>الإجمالي التقريبي</span><strong id="cart-total"></strong></div><button id="checkout-button" class="primary-button full-button" data-action="checkout">إتمام الطلب <span>←</span></button><small>سيتم تأكيد التوصيل والدفع عند إتمام الطلب.</small></div></aside><div id="drawer-backdrop" class="drawer-backdrop" data-action="close-cart"></div>
    <dialog id="product-dialog" aria-label="تفاصيل المنتج"></dialog>
    <dialog id="checkout-dialog" class="checkout-dialog" aria-label="بيانات إتمام الطلب">
      <button class="dialog-close" data-action="close-checkout" aria-label="إغلاق">×</button>
      <div class="checkout-heading"><p class="eyebrow">خطوة أخيرة</p><h2>أرسل طلبك للمتجر</h2><p>أدخل بيانات التوصيل، وسنفتح لك واتساب برسالة مرتبة بكل المنتجات والتفاصيل.</p></div>
      <form id="checkout-form">
        <div class="form-grid"><label><span>الاسم الكامل</span><input name="customerName" autocomplete="name" required placeholder="مثال: محمد العتيبي" /></label><label><span>رقم الهاتف</span><input name="customerPhone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="مثال: 5xxxxxxxx" /></label></div>
        <label><span>منطقة وعنوان التوصيل</span><input name="address" autocomplete="street-address" required placeholder="مثال: السالمية، قطعة 4، شارع 12، منزل 8" /></label>
        <label><span>ملاحظات إضافية <small>(اختياري)</small></span><textarea name="notes" rows="3" placeholder="وقت مناسب للتوصيل أو أي تفاصيل تساعدنا..."></textarea></label>
        <button class="primary-button full-button" type="submit">فتح واتساب وإرسال الطلب <span>←</span></button>
        <small class="form-note">سيتم فتح محادثة واتساب برسالة جاهزة للمراجعة قبل الإرسال.</small>
      </form>
    </dialog>
    <button class="floating-cart" data-action="open-cart" aria-label="فتح السلة العائمة"><span class="floating-cart-icon">♧</span><span class="floating-cart-copy"><strong>السلة</strong><small id="floating-cart-total">٠٫٠٠ د.ك</small></span><b data-cart-count>0</b></button>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
  renderCategories();
  renderProducts();
  renderCart();
  mountCheckoutFields();
  initHeroSlider();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function openCart() {
  document.querySelector('#cart-drawer').classList.add('is-open');
  document.querySelector('#drawer-backdrop').classList.add('is-open');
  document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  document.querySelector('#cart-drawer').classList.remove('is-open');
  document.querySelector('#drawer-backdrop').classList.remove('is-open');
  document.querySelector('#cart-drawer').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function addCart(id, quantity = 1) {
  const product = productById(id);
  if (!product) return;
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const item = state.cart.find((cartItem) => cartItem.id === id);
  if (item) item.quantity += safeQuantity;
  else state.cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: safeQuantity });
  saveCart();
  renderCart();
  showToast(`تمت إضافة «${product.title}» إلى السلة`);
  window.setTimeout(() => { if (document.querySelector('#cart-drawer')) openCart(); }, 120);
}

function changeDetailQuantity(delta) {
  const quantityInput = document.querySelector('#detail-quantity');
  if (!quantityInput) return;
  const nextQuantity = Math.max(1, Math.floor(Number(quantityInput.value || 1) + Number(delta || 0)));
  quantityInput.value = String(nextQuantity);
}

function selectProductTab(tabName) {
  document.querySelectorAll('[data-product-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.productTab === tabName));
  document.querySelectorAll('[data-product-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.productPanel === tabName));
}

function changeQuantity(id, delta) {
  const item = state.cart.find((cartItem) => cartItem.id === id);
  if (!item) return;
  item.quantity += Number(delta);
  state.cart = state.cart.filter((cartItem) => cartItem.quantity > 0);
  saveCart();
  renderCart();
}

function openCheckout() {
  if (!state.cart.length) return;
  const dialog = document.querySelector('#checkout-dialog');
  if (!dialog.open) dialog.showModal();
}

function closeCheckout() {
  document.querySelector('#checkout-dialog')?.close();
}

function submitCheckout(form) {
  const formData = new FormData(form);
  const customerName = String(formData.get('customerName') || '').trim();
  const customerPhone = String(formData.get('customerPhone') || '').trim();
  const normalizedPhone = normalizePhone(customerPhone);
  const governorate = String(formData.get('governorate') || '').trim();
  const address = String(formData.get('address') || '').trim();
  const notes = String(formData.get('notes') || '').trim();
  const phoneInput = form.querySelector('[name="customerPhone"]');
  if (!isKuwaitPhone(customerPhone)) {
    phoneInput.setCustomValidity('يرجى إدخال رقم هاتف كويتي صحيح يبدأ بـ 2 أو 4 أو 5 أو 6 أو 9.');
    phoneInput.reportValidity();
    return;
  }
  phoneInput.setCustomValidity('');
  const orderId = `KW-${Date.now().toString(36).toUpperCase()}`;
  const lines = state.cart.map((item, index) => `${index + 1}) ${item.title}\n   الكمية: ${item.quantity} | سعر الوحدة: ${price(item.price)} | المجموع: ${price(item.price * item.quantity)}`);
  const message = [
    'السلام عليكم، أرغب بتأكيد هذا الطلب من كويت شوب 🛍️',
    '',
    `رقم الطلب: ${orderId}`,
    `اسم العميل: ${customerName}`,
    `رقم الهاتف: +${normalizedPhone}`,
    `محافظة التوصيل: ${governorate}`,
    `عنوان التوصيل: ${address}`,
    '',
    'تفاصيل المنتجات:',
    ...lines,
    '',
    `الإجمالي التقريبي: ${price(cartTotal())}`,
    'طريقة الدفع والتوصيل: يتم التأكيد مع المتجر',
    notes ? `ملاحظات: ${notes}` : '',
    '',
    'أرجو تأكيد التوفر والتوصيل. شكراً.'
  ].filter(Boolean).join('\n');
  const whatsappUrl = `https://wa.me/201110760081?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  closeCheckout();
  showToast('تم تجهيز طلبك وفتح واتساب للمراجعة والإرسال.');
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, productId, category, delta } = target.dataset;
  if (action === 'add-cart') addCart(productId, target.dataset.detailQuantity === 'true' ? document.querySelector('#detail-quantity')?.value : 1);
  if (action === 'open-cart') openCart();
  if (action === 'close-cart') closeCart();
  if (action === 'open-product') { state.activeProduct = productById(productId); renderProductDialog(); }
  if (action === 'close-product') { state.activeProduct = null; renderProductDialog(); }
  if (action === 'close-checkout') closeCheckout();
  if (action === 'product-whatsapp') sendProductToWhatsApp(productById(productId));
  if (action === 'slider-next') setSliderSlide(Number(document.querySelector('.featured-slider')?.dataset.sliderIndex || 0) + 1);
  if (action === 'slider-prev') setSliderSlide(Number(document.querySelector('.featured-slider')?.dataset.sliderIndex || 0) - 1);
  if (action === 'slider-go') setSliderSlide(Number(target.dataset.slideIndex || 0));
  if (action === 'toggle-wishlist') showToast('تم حفظ المنتج في قائمة المفضلة على هذا الجهاز.');
  if (action === 'change-quantity') changeQuantity(productId, delta);
  if (action === 'detail-quantity-change') changeDetailQuantity(delta);
  if (action === 'select-product-tab') selectProductTab(target.dataset.productTab);
  if (action === 'load-more') { state.visible += 36; renderProducts(); }
  if (action === 'set-category') {
    const productsSection = document.querySelector('#products');
    if (!productsSection) { window.location.href = `/?category=${encodeURIComponent(category)}`; return; }
    state.category = category;
    state.visible = 36;
    renderCategories();
    renderProducts();
    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (action === 'toggle-categories') { state.categoriesExpanded = !state.categoriesExpanded; renderCategories(); }
  if (action === 'reset-filters') { state.query = ''; state.category = 'الكل'; state.visible = 36; document.querySelector('#search-input').value = ''; renderCategories(); renderProducts(); }
  if (action === 'focus-search') { document.querySelector('#search-input').focus(); document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (action === 'checkout') openCheckout();
});

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'checkout-form') return;
  event.preventDefault();
  submitCheckout(event.target);
});

app.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') { state.query = event.target.value; state.visible = 36; renderProducts(); }
});

app.addEventListener('change', (event) => {
  if (event.target.id === 'sort-select') { state.sort = event.target.value; state.visible = 36; renderProducts(); }
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeCart(); });

async function start() {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error('Could not load product data');
    state.products = await response.json();
    const requestedCategory = new URLSearchParams(window.location.search).get('category');
    if (requestedCategory && state.products.some((product) => product.category === requestedCategory)) state.category = requestedCategory;
    // Browsers percent-encode Arabic URL segments in location.pathname. Decode once
    // before matching route names, otherwise SEO routes fall through to the home page.
    const decodedPathname = decodeURIComponent(window.location.pathname);
    const legalKey = LEGAL_PATHS[decodedPathname.replace(/\/$/, '') || '/'];
    const seoRoute = decodedPathname.match(/^\/(شراء|افضل|احسن|تجربتي)\/(.+)$/);
    const seoProduct = seoRoute ? productBySlug(seoRoute[2]) : null;
    const productRoute = decodedPathname.match(/^\/product\/(.+)$/);
    const routedProduct = productRoute ? productBySlug(productRoute[1]) : null;
    if (legalKey) renderLegalPage(legalKey);
    else if (seoProduct) renderSeoLandingPage(seoProduct, seoRoute[1]);
    else if (routedProduct) renderProductPage(routedProduct);
    else render();
  } catch (error) {
    app.innerHTML = `<main class="fatal-error"><span>!</span><h1>تعذّر تحميل المنتجات</h1><p>يرجى تحديث الصفحة أو المحاولة مرة أخرى.</p></main>`;
    console.error(error);
  }
}

  start();
}

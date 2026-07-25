import './styles.css';

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
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
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
      <button class="product-image" data-action="open-product" data-product-id="${escapeHtml(product.id)}" aria-label="عرض ${escapeHtml(product.title)}">
        ${savings ? `<span class="discount-badge">وفر ${savings}%</span>` : ''}
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" decoding="async" onerror="this.classList.add('image-failed'); this.alt='صورة المنتج غير متاحة';" />
      </button>
      <div class="product-content">
        <button class="category-label" data-action="set-category" data-category="${escapeHtml(product.category)}">${escapeHtml(product.category)}</button>
        <h3><button data-action="open-product" data-product-id="${escapeHtml(product.id)}">${escapeHtml(product.title)}</button></h3>
        <div class="price-row">
          <span class="current-price">${price(product.price)}</span>
          ${product.original ? `<span class="old-price">${price(product.original)}</span>` : ''}
        </div>
        <div class="card-footer">
          <span class="availability"><i></i> متوفر الآن</span>
          <button class="add-button" data-action="add-cart" data-product-id="${escapeHtml(product.id)}">أضف للسلة <span>+</span></button>
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

function render() {
  app.innerHTML = `
    <div class="announcement"><span>تسوّق براحة</span><b>منتجات مختارة لبيتك وحياتك اليومية</b><span>•</span><span>توصيل داخل الكويت</span></div>
    <header class="site-header">
      <a href="#top" class="brand" aria-label="كويت شوب - الرئيسية"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a>
      <nav class="main-nav" aria-label="التنقل الرئيسي"><a href="#top">الرئيسية</a><a href="#products">تسوّق</a><a href="#why-us">لماذا كويت شوب؟</a></nav>
      <div class="header-actions"><button class="search-trigger" data-action="focus-search" aria-label="بحث">⌕</button><button class="cart-trigger" data-action="open-cart" aria-label="فتح السلة"><span class="bag-icon">♧</span><b data-cart-count>0</b><span>السلة</span></button></div>
    </header>
    <main id="top">
      <section class="hero">
        <div class="hero-copy"><p class="eyebrow">اختياراتك في مكان واحد</p><h1>كل ما يحتاجه<br /><em>البيت الكويتي.</em></h1><p class="hero-text">تسوّق آلاف المنتجات المختارة بعناية، من احتياجات المنزل إلى الهدايا والإكسسوارات.</p><div class="hero-actions"><a class="primary-button" href="#products">ابدأ التسوّق <span>←</span></a><a class="text-button" href="#why-us">اكتشف المتجر <span>↓</span></a></div><div class="hero-trust"><span><b>4,000+</b> منتج متنوع</span><i></i><span><b>توصيل</b> داخل الكويت</span><i></i><span><b>دفع آمن</b> عند الطلب</span></div></div>
        <div class="hero-art" aria-hidden="true"><div class="sun-disc"></div><div class="arch arch-back"></div><div class="arch arch-front"></div><div class="hero-card hero-card-one"><span>✦</span><b>تجربة سهلة</b><small>من الاختيار حتى الطلب</small></div><div class="hero-card hero-card-two"><span>✓</span><b>منتجات متاحة</b><small>اختيارات يومية متجددة</small></div><div class="palm palm-one">⌇</div><div class="palm palm-two">⌇</div></div>
      </section>
      <section class="benefits" id="why-us"><div><span>◈</span><p><b>خيارات متنوعة</b><small>كل ما تحتاجه في متجر واحد</small></p></div><div><span>⌁</span><p><b>تجربة تسوّق سهلة</b><small>بحث سريع وسلة واضحة</small></p></div><div><span>⌂</span><p><b>توصيل محلي</b><small>إلى مختلف مناطق الكويت</small></p></div><div><span>✦</span><p><b>عروض مختارة</b><small>قيمة أفضل لطلباتك</small></p></div></section>
      <section class="catalog" id="products"><div class="section-heading"><div><p class="eyebrow">تسوّق حسب احتياجك</p><h2>اكتشف منتجاتنا</h2></div><p>منتجات كثيرة، تجربة شراء واحدة بسيطة.</p></div><div class="search-and-sort"><label class="search-box"><span>⌕</span><input id="search-input" type="search" autocomplete="off" placeholder="ابحث عن منتج، تصنيف، أو احتياج..." /></label><label class="sort-box"><span>ترتيب حسب</span><select id="sort-select"><option value="featured">الأبرز أولاً</option><option value="low">السعر: الأقل أولاً</option><option value="high">السعر: الأعلى أولاً</option><option value="discount">أعلى الخصومات</option></select></label></div><div class="category-bar"><div id="category-list" class="category-list"></div><button id="category-toggle" class="category-more" data-action="toggle-categories"></button></div><div class="results-meta"><span id="results-count">...</span><span>متاح الآن للتسوّق</span></div><div id="products-grid" class="products-grid" aria-live="polite"><div class="loading-state"><span></span><span></span><span></span></div></div><div class="load-more-wrap"><button id="load-more" class="outline-button" data-action="load-more"><span>عرض المزيد</span> ↓</button></div></section>
      <section class="cta-section"><div><p class="eyebrow">وصلت للي تبيه؟</p><h2>أضف منتجاتك واطلبها<br />بكل سهولة.</h2></div><button class="light-button" data-action="open-cart">فتح السلة <span>←</span></button></section>
    </main>
    <footer><a class="brand" href="#top"><span class="brand-mark">ك</span><span><b>كويت</b> شوب<small>لبيتٍ أجمل</small></span></a><p>وجهتك اليومية لمنتجات البيت والحياة في الكويت.</p><small>© ${new Date().getFullYear()} كويت شوب. جميع الحقوق محفوظة.</small></footer>
    <aside id="cart-drawer" class="cart-drawer" aria-label="سلة التسوق" aria-hidden="true"><div class="drawer-header"><div><p class="eyebrow">طلبك المختار</p><h2>سلة التسوق <small data-cart-count>0</small></h2></div><button data-action="close-cart" aria-label="إغلاق السلة">×</button></div><ul id="cart-list"></ul><div class="drawer-footer"><div><span>الإجمالي التقريبي</span><strong id="cart-total"></strong></div><button id="checkout-button" class="primary-button full-button" data-action="checkout">إتمام الطلب <span>←</span></button><small>سيتم تأكيد التوصيل والدفع عند إتمام الطلب.</small></div></aside><div id="drawer-backdrop" class="drawer-backdrop" data-action="close-cart"></div>
    <dialog id="product-dialog" aria-label="تفاصيل المنتج"></dialog>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
  renderCategories();
  renderProducts();
  renderCart();
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

function addCart(id) {
  const product = productById(id);
  if (!product) return;
  const item = state.cart.find((cartItem) => cartItem.id === id);
  if (item) item.quantity += 1;
  else state.cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`تمت إضافة «${product.title}» إلى السلة`);
}

function changeQuantity(id, delta) {
  const item = state.cart.find((cartItem) => cartItem.id === id);
  if (!item) return;
  item.quantity += Number(delta);
  state.cart = state.cart.filter((cartItem) => cartItem.quantity > 0);
  saveCart();
  renderCart();
}

function checkout() {
  if (!state.cart.length) return;
  const lines = state.cart.map((item, index) => `${index + 1}. ${item.title} × ${item.quantity} — ${price(item.price * item.quantity)}`);
  const message = `مرحباً، أرغب بطلب المنتجات التالية من كويت شوب:%0A%0A${encodeURIComponent(lines.join('\n'))}%0A%0Aالإجمالي التقريبي: ${encodeURIComponent(price(cartTotal()))}%0A%0Aالاسم:%0Aرقم الهاتف:%0Aالعنوان:`;
  navigator.clipboard?.writeText(decodeURIComponent(message.replaceAll('%0A', '\n'))).catch(() => {});
  showToast('تم تجهيز تفاصيل طلبك ونسخها لتشاركها مع المتجر.');
  window.setTimeout(() => window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer'), 350);
}

app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, productId, category, delta } = target.dataset;
  if (action === 'add-cart') addCart(productId);
  if (action === 'open-cart') openCart();
  if (action === 'close-cart') closeCart();
  if (action === 'open-product') { state.activeProduct = productById(productId); renderProductDialog(); }
  if (action === 'close-product') { state.activeProduct = null; renderProductDialog(); }
  if (action === 'change-quantity') changeQuantity(productId, delta);
  if (action === 'load-more') { state.visible += 36; renderProducts(); }
  if (action === 'set-category') { state.category = category; state.visible = 36; renderCategories(); renderProducts(); document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (action === 'toggle-categories') { state.categoriesExpanded = !state.categoriesExpanded; renderCategories(); }
  if (action === 'reset-filters') { state.query = ''; state.category = 'الكل'; state.visible = 36; document.querySelector('#search-input').value = ''; renderCategories(); renderProducts(); }
  if (action === 'focus-search') { document.querySelector('#search-input').focus(); document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (action === 'checkout') checkout();
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
    render();
  } catch (error) {
    app.innerHTML = `<main class="fatal-error"><span>!</span><h1>تعذّر تحميل المنتجات</h1><p>يرجى تحديث الصفحة أو المحاولة مرة أخرى.</p></main>`;
    console.error(error);
  }
}

start();

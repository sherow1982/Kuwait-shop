# كويت شوب

واجهة متجر عربية متجاوبة مبنية بـ Node.js وVite، ومهيأة للنشر على Cloudflare Pages.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## تحديث المنتجات

شغّل الأمر التالي عند استبدال ملف المنتجات، أو مرّر مساره في متغير `PRODUCTS_TSV`:

```bash
npm run import:products
```

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 20.19 أو أحدث

بعد ربط المستودع بـ Cloudflare Pages، أضف `kuwait-shop.arabsads.shop` من **Custom domains** في إعدادات المشروع. إذا كانت منطقة `arabsads.shop` في الحساب نفسه فسيُنشأ سجل DNS تلقائياً؛ وإلا أضف سجل CNAME للاسم `kuwait-shop` يشير إلى نطاق المشروع على `pages.dev`.

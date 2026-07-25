import Head from 'next/head';
import { useEffect } from 'react';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': 'https://kuwait-shop.arabsads.shop/#organization',
  name: 'كويت شوب',
  url: 'https://kuwait-shop.arabsads.shop/',
  description: 'متجر إلكتروني كويتي لمنتجات المنزل والحياة اليومية مع التوصيل داخل الكويت.',
  currenciesAccepted: 'KWD',
  paymentAccepted: 'الدفع عند الاستلام',
  inLanguage: 'ar-KW',
  areaServed: { '@type': 'Country', name: 'Kuwait', identifier: 'KW' },
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    '@id': 'https://kuwait-shop.arabsads.shop/#return-policy',
    applicableCountry: 'KW',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    refundType: 'https://schema.org/FullRefund',
    merchantReturnLink: 'https://kuwait-shop.arabsads.shop/ar/refund-policy'
  },
  hasShippingService: {
    '@type': 'ShippingService',
    '@id': 'https://kuwait-shop.arabsads.shop/#shipping-service',
    name: 'التوصيل داخل الكويت',
    description: 'التوصيل متاح داخل المحافظات الكويتية الست. الشحن مجاني لبعض المناطق وتصل رسوم المناطق الخاصة إلى 5 د.ك؛ تُراجع الرسوم النهائية حسب العنوان قبل تأكيد الطلب.',
    fulfillmentType: 'https://schema.org/FulfillmentTypeDelivery'
  }
};

export default function KuwaitShopHome() {
  useEffect(() => {
    let mounted = true;
    import('../src/main.js').then(({ mountStore }) => {
      if (mounted) mountStore();
    });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <Head>
        <title>كويت شوب | تسوق داخل الكويت</title>
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="description" content="كويت شوب — تسوق احتياجاتك اليومية بأسعار مختارة وتوصيل داخل الكويت." />
        <meta property="og:title" content="كويت شوب | تسوق داخل الكويت" />
        <meta property="og:description" content="آلاف المنتجات المختارة لبيتك وحياتك اليومية." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kuwait-shop.arabsads.shop/" />
        <meta property="og:image" content="https://kuwait-shop.arabsads.shop/brand/kuwait-shop-social.png" />
        <meta property="og:image:secure_url" content="https://kuwait-shop.arabsads.shop/brand/kuwait-shop-social.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="كويت شوب - كل ما يحتاجه البيت الكويتي" />
        <meta property="og:locale" content="ar_KW" />
        <meta property="og:site_name" content="كويت شوب" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="كويت شوب | تسوق داخل الكويت" />
        <meta name="twitter:description" content="آلاف المنتجات المختارة لبيتك وحياتك اليومية داخل الكويت." />
        <meta name="twitter:image" content="https://kuwait-shop.arabsads.shop/brand/kuwait-shop-social.png" />
        <meta name="twitter:image:alt" content="كويت شوب - كل ما يحتاجه البيت الكويتي" />
        <link rel="canonical" href="https://kuwait-shop.arabsads.shop/" />
        <link rel="alternate" hrefLang="ar-KW" href="https://kuwait-shop.arabsads.shop/" />
        <link rel="alternate" hrefLang="ar" href="https://kuwait-shop.arabsads.shop/" />
        <link rel="alternate" hrefLang="x-default" href="https://kuwait-shop.arabsads.shop/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </Head>
      <div id="app" />
    </>
  );
}

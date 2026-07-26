import Head from 'next/head';
import { useEffect } from 'react';

export default function CheckoutPage() {
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
        <title>إتمام الطلب | كويت شوب</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="أتمم طلبك من كويت شوب وأدخل بيانات التوصيل داخل الكويت." />
        <link rel="canonical" href="https://kuwait-shop.arabsads.shop/checkout" />
      </Head>
      <div id="app" />
    </>
  );
}

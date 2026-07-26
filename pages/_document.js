import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#007a3d" />
        <meta name="geo.region" content="KW" />
        <meta name="geo.country" content="KW" />
        <meta name="geo.placename" content="Kuwait" />
        <meta name="geo.position" content="29.3759;47.9774" />
        <meta name="ICBM" content="29.3759, 47.9774" />
        <link rel="icon" href="/brand/kuwait-shop-logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/brand/kuwait-shop-logo.jpg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://assets.wuiltstore.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/brand/banner-768.jpg" imageSrcSet="/brand/banner-768.jpg 768w, /brand/banner-1280.jpg 1280w, /brand/banner.jpg 1717w" imageSizes="100vw" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" />
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'Cairo-Fallback';
            src: local('Arial'), local('Tahoma');
            size-adjust: 105%;
            ascent-override: 95%;
            descent-override: 25%;
            line-gap-override: 0%;
          }
        ` }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

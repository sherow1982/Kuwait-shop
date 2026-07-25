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
        <link rel="icon" href="/brand/kuwait-shop-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/kuwait-shop-mark.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://assets.wuiltstore.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

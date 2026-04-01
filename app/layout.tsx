import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import IntlClientProvider from '@/components/IntlClientProvider';
import { cookies } from 'next/headers';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Devex CRM',
  description: 'Modern CRM platform',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

const SUPPORTED_LOCALES = ['en', 'fr', 'ar'];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = SUPPORTED_LOCALES.includes(cookieLocale ?? '') ? cookieLocale! : 'en';
  const messages = await import(`../messages/${locale}.json`).then(m => m.default).catch(async (err) => {
    return (await import('../messages/en.json')).default;
  });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`${geist.className} ${geistMono.className} antialiased`}
      >
        <IntlClientProvider locale={locale} messages={messages}>
          {children}
          <Analytics />
        </IntlClientProvider>
      </body>
    </html>
  );
}

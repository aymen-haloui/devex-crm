'use client';

import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';

/**
 * Thin 'use client' wrapper around NextIntlClientProvider.
 * This ensures the provider only runs in a client context,
 * preventing next-intl from calling server APIs (which require
 * the webpack plugin that's incompatible with Turbopack).
 */
export default function IntlClientProvider({
    locale,
    messages,
    children,
}: {
    locale: string;
    messages: AbstractIntlMessages;
    children: React.ReactNode;
}) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}

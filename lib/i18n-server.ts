import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'fr', 'ar'];

/**
 * Reads the NEXT_LOCALE cookie and returns a validated locale string.
 * Falls back to 'en' if the cookie is missing or invalid.
 *
 * This helper exists because next-intl's getLocale() / getTranslations() require
 * the next-intl webpack plugin, which is incompatible with Turbopack in Next.js 16.
 * Instead, we read the cookie directly and load translations manually.
 */
export async function getServerLocale(): Promise<string> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    return SUPPORTED_LOCALES.includes(cookieLocale ?? '') ? cookieLocale! : 'en';
}

type Messages = Record<string, unknown>;

function getNestedValue(obj: Messages, key: string): string {
    const parts = key.split('.');
    let current: unknown = obj;
    for (const part of parts) {
        if (current == null || typeof current !== 'object') return key;
        current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
}

function interpolate(template: string, values?: Record<string, string | number>): string {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? `{${k}}`));
}

/**
 * Server-side translation function for use in async server components.
 * Returns a t() function scoped to the given namespace.
 * No next-intl plugin required.
 */
export async function getServerTranslations(namespace: string) {
    const locale = await getServerLocale();
    let allMessages: Messages;
    try {
        allMessages = (await import(`../messages/${locale}.json`)).default as Messages;
    } catch {
        allMessages = (await import('../messages/en.json')).default as Messages;
    }
    const ns = (allMessages[namespace] ?? {}) as Messages;

    return function t(key: string, values?: Record<string, string | number>): string {
        const value = getNestedValue(ns, key);
        return interpolate(value, values);
    };
}

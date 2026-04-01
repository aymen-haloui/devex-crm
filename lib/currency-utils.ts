/**
 * Converts a number to French words.
 * Simplified version for CRM invoicing needs.
 */
export function numberToFrenchWords(n: number): string {
    if (n === 0) return "zéro";

    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

    function convert(num: number): string {
        if (num < 10) return units[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const t = Math.floor(num / 10);
            const u = num % 10;
            if (u === 0) return tens[t];
            if (u === 1 && t < 8) return tens[t] + " et un";
            if (t === 7) return "soixante-" + teens[u];
            if (t === 9) return "quatre-vingt-" + teens[u];
            return tens[t] + "-" + units[u];
        }
        if (num < 1000) {
            const h = Math.floor(num / 100);
            const r = num % 100;
            const hStr = h === 1 ? "cent" : units[h] + " cents";
            return hStr + (r > 0 ? " " + convert(r) : "");
        }
        if (num < 1000000) {
            const m = Math.floor(num / 1000);
            const r = num % 1000;
            const mStr = m === 1 ? "mille" : convert(m) + " mille";
            return mStr + (r > 0 ? " " + convert(r) : "");
        }
        return num.toString(); // Fallback for very large numbers
    }

    const integerPart = Math.floor(n);
    const decimalPart = Math.round((n - integerPart) * 100);

    let result = convert(integerPart);

    if (decimalPart > 0) {
        result += " et " + convert(decimalPart) + " centimes";
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
}

export function formatCurrency(amount: number, currency: string = 'DZD') {
    const symbols: Record<string, string> = {
        'DZD': 'د.ج',
        'USD': '$',
        'EUR': '€'
    };
    const symbol = symbols[currency] || symbols['DZD'];
    return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

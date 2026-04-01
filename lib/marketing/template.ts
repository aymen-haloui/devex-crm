type TemplateVariables = Record<string, string | number | boolean | null | undefined>;

const VARIABLE_REGEX = /\{\{\s*([\w.]+)\s*\}\}/g;

export function renderTemplate(input: string, variables: TemplateVariables): string {
  return input.replace(VARIABLE_REGEX, (_, key: string) => {
    const value = variables[key];
    if (value === null || value === undefined) return '';
    return String(value);
  });
}

export function extractTemplateVariables(input: string): string[] {
  const matches = input.matchAll(VARIABLE_REGEX);
  const keys = new Set<string>();
  for (const match of matches) keys.add(match[1]);
  return Array.from(keys);
}

export function buildRecipientVariables(recipient: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  company?: string | null;
  customFields?: Record<string, unknown> | null;
}): TemplateVariables {
  const base: TemplateVariables = {
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    fullName: [recipient.firstName, recipient.lastName].filter(Boolean).join(' '),
    email: recipient.email,
    company: recipient.company,
  };

  if (recipient.customFields && typeof recipient.customFields === 'object') {
    for (const [key, value] of Object.entries(recipient.customFields)) {
      base[`custom.${key}`] = value as string | number | boolean | null | undefined;
      base[key] = value as string | number | boolean | null | undefined;
    }
  }

  return base;
}

export function withTracking(
  html: string,
  options: {
    appBaseUrl: string;
    trackingToken: string;
    unsubscribeToken: string;
  }
): string {
  const clickTracked = html.replace(
    /href=["']([^"']+)["']/gi,
    (_, url: string) => `href="${options.appBaseUrl}/api/email/track/click/${options.trackingToken}?url=${encodeURIComponent(url)}"`
  );

  const pixel = `<img src="${options.appBaseUrl}/api/email/track/open/${options.trackingToken}" alt="" width="1" height="1" style="display:none" />`;
  const unsubscribe = `<p style="font-size:12px;color:#666;margin-top:16px">If you no longer want to receive these emails, <a href="${options.appBaseUrl}/api/email/unsubscribe/${options.unsubscribeToken}">unsubscribe here</a>.</p>`;

  return `${clickTracked}${pixel}${unsubscribe}`;
}

import { UserRole } from '@/types';

export interface RouteConfig {
    href: string;
    labelKey: string;
    roles: UserRole[];
}

export interface GroupConfig {
    title: string;
    labelKey: string;
    roles: UserRole[];
    items: RouteConfig[];
}

// Feature flags for optional modules
const integrationsEnabled = process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED === 'true';
const projectsEnabled = process.env.NEXT_PUBLIC_PROJECTS_ENABLED !== 'false';
const vocEnabled = process.env.NEXT_PUBLIC_VOC_ENABLED !== 'false';
const servicesEnabled = process.env.NEXT_PUBLIC_SERVICES_ENABLED !== 'false';

export const SIDEBAR_GROUPS: GroupConfig[] = [
    {
        title: "Sales",
        labelKey: "sales",
        roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.EXECUTIVE],
        items: [
            { href: '/leads', labelKey: 'leads', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.MARKETING_USER] },
            { href: '/contacts', labelKey: 'contacts', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/accounts', labelKey: 'accounts', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/deals', labelKey: 'deals', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/forecasts', labelKey: 'forecasts', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.EXECUTIVE] },
            { href: '/documents', labelKey: 'documents', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/campaigns', labelKey: 'campaigns', roles: [UserRole.ADMIN, UserRole.MARKETING_USER, UserRole.SALES_MANAGER] },
        ]
    },
    {
        title: "Activities",
        labelKey: "activities",
        roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.SUPPORT_AGENT],
        items: [
            { href: '/activities/tasks', labelKey: 'tasks', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.SUPPORT_AGENT] },
            { href: '/activities/meetings', labelKey: 'meetings', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.SUPPORT_AGENT] },
            { href: '/activities/calls', labelKey: 'calls', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.SUPPORT_AGENT] },
        ]
    },
    {
        title: "Inventory",
        labelKey: "inventory",
        roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.EXECUTIVE],
        items: [
            { href: '/inventory/products', labelKey: 'products', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/inventory/price-books', labelKey: 'priceBooks', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
            { href: '/inventory/quotes', labelKey: 'quotes', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/inventory/sales-orders', labelKey: 'salesOrders', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/inventory/purchase-orders', labelKey: 'purchaseOrders', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
            { href: '/inventory/invoices', labelKey: 'invoices', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP] },
            { href: '/inventory/vendors', labelKey: 'vendors', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
        ]
    },
    {
        title: "Support",
        labelKey: "support",
        roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT, UserRole.EXECUTIVE],
        items: [
            { href: '/support/cases', labelKey: 'cases', roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT] },
            { href: '/support/solutions', labelKey: 'solutions', roles: [UserRole.ADMIN, UserRole.SUPPORT_AGENT] },
        ]
    },
];

// Add optional modules based on feature flags
if (projectsEnabled) {
    SIDEBAR_GROUPS.push({
        title: "Projects",
        labelKey: "projects",
        roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.EXECUTIVE],
        items: [
            { href: '/projects', labelKey: 'projects', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.EXECUTIVE] },
        ]
    });
}

if (servicesEnabled) {
    SIDEBAR_GROUPS.push({
        title: "Services",
        labelKey: "services",
        roles: [UserRole.ADMIN, UserRole.SALES_MANAGER],
        items: [
            { href: '/services', labelKey: 'services', roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
        ]
    });
}

if (vocEnabled) {
    SIDEBAR_GROUPS.push({
        title: "Voice of Customer",
        labelKey: "voc",
        roles: [UserRole.ADMIN, UserRole.MARKETING_USER, UserRole.SUPPORT_AGENT],
        items: [
            { href: '/voice-of-the-customer', labelKey: 'voiceOfCustomer', roles: [UserRole.ADMIN, UserRole.MARKETING_USER, UserRole.SUPPORT_AGENT] },
        ]
    });
}

// optionally append integrations group
if (integrationsEnabled) {
    SIDEBAR_GROUPS.push({
        title: "Integrations",
        labelKey: "integrations",
        roles: [UserRole.ADMIN],
        items: [
            { href: '/integrations/salesinbox', labelKey: 'salesInbox', roles: [UserRole.ADMIN] },
            { href: '/integrations/social', labelKey: 'social', roles: [UserRole.ADMIN] },
            { href: '/integrations/visits', labelKey: 'visits', roles: [UserRole.ADMIN] },
        ]
    });
}

export const TOP_MENU_ROLES = {
    '/home': [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.MARKETING_USER, UserRole.SUPPORT_AGENT, UserRole.EXECUTIVE],
    '/reports': [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.EXECUTIVE],
    '/analytics': [UserRole.ADMIN, UserRole.MARKETING_USER, UserRole.EXECUTIVE],
    '/my-requests': [UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.SALES_REP, UserRole.SUPPORT_AGENT, UserRole.EXECUTIVE, UserRole.MARKETING_USER],
};

import { UserRole } from '@/types';

// Role-based permissions
export const PERMISSIONS_BY_ROLE: Record<UserRole, Record<string, string[]>> = {
  [UserRole.ADMIN]: {
    users: ['view', 'create', 'edit', 'delete'],
    leads: ['view', 'create', 'edit', 'delete'],
    contacts: ['view', 'create', 'edit', 'delete'],
    accounts: ['view', 'create', 'edit', 'delete'],
    deals: ['view', 'create', 'edit', 'delete'],
    activities: ['view', 'create', 'edit', 'delete'],
    campaigns: ['view', 'create', 'edit', 'delete'],
    cases: ['view', 'create', 'edit', 'delete'],
    products: ['view', 'create', 'edit', 'delete'],
    quotes: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'create', 'edit', 'delete'],
    invoices: ['view', 'create', 'edit', 'delete'],
    workflows: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
    analytics: ['view'],
  },
  [UserRole.SALES_MANAGER]: {
    leads: ['view', 'create', 'edit', 'delete'],
    contacts: ['view', 'create', 'edit', 'delete'],
    accounts: ['view', 'create', 'edit', 'delete'],
    deals: ['view', 'create', 'edit', 'delete'],
    activities: ['view', 'create', 'edit'],
    cases: ['view', 'create', 'edit'],
    quotes: ['view', 'create', 'edit'],
    orders: ['view', 'create', 'edit'],
    invoices: ['view', 'create', 'edit'],
    analytics: ['view'],
  },
  [UserRole.SALES_REP]: {
    leads: ['view', 'create', 'edit'],
    contacts: ['view', 'create', 'edit'],
    accounts: ['view', 'create', 'edit'],
    deals: ['view', 'create', 'edit'],
    activities: ['view', 'create', 'edit'],
    quotes: ['view', 'create', 'edit'],
    analytics: ['view'],
  },
  [UserRole.MARKETING_USER]: {
    leads: ['view', 'create', 'edit'],
    contacts: ['view'],
    accounts: ['view'],
    campaigns: ['view', 'create', 'edit', 'delete'],
    analytics: ['view'],
  },
  [UserRole.SUPPORT_AGENT]: {
    contacts: ['view', 'create', 'edit'],
    accounts: ['view'],
    activities: ['view', 'create', 'edit'],
    cases: ['view', 'create', 'edit', 'delete'],
    analytics: ['view'],
  },
  [UserRole.EXECUTIVE]: {
    leads: ['view'],
    contacts: ['view'],
    accounts: ['view'],
    deals: ['view'],
    campaigns: ['view'],
    cases: ['view'],
    orders: ['view'],
    invoices: ['view'],
    analytics: ['view'],
  },
};

// Lead sources
export const LEAD_SOURCES = [
  'advertisement',
  'coldCall',
  'employeeReferral',
  'externalReferral',
  'onlineStore',
  'partner',
  'publicRelations',
  'salesEmailAlias',
  'seminarPartner',
  'internalSeminar',
  'tradeShow',
  'webDownload',
  'webResearch',
  'chat',
  'website',
  'emailCampaign',
  'referral',
  'socialMedia',
  'webSearch',
  'other',
];

// Deal stages
export const DEAL_STAGES = [
  { id: 'prospecting', label: 'Prospecting', order: 1, probability: 10 },
  { id: 'qualification', label: 'Qualification', order: 2, probability: 20 },
  { id: 'needs_analysis', label: 'Needs Analysis', order: 3, probability: 40 },
  { id: 'proposal', label: 'Proposal', order: 4, probability: 60 },
  { id: 'negotiation', label: 'Negotiation', order: 5, probability: 80 },
  { id: 'closed_won', label: 'Closed Won', order: 6, probability: 100 },
  { id: 'closed_lost', label: 'Closed Lost', order: 7, probability: 0 },
];

// Case types
export const CASE_TYPES = [
  'Question',
  'Problem',
  'Feature Request',
  'Bug Report',
  'Product Information',
];

// Campaign types
export const CAMPAIGN_TYPES = [
  'Email',
  'Social Media',
  'Event',
  'Webinar',
  'Content',
  'Paid Search',
  'Display',
  'Direct Mail',
];

// Account industries
export const INDUSTRIES = [
  'technology',
  'healthcare',
  'finance',
  'retail',
  'manufacturing',
  'education',
  'energy',
  'realEstate',
  'transportation',
  'telecommunications',
  'other',
];

// Account types
export const ACCOUNT_TYPES = [
  'Customer',
  'Prospect',
  'Partner',
  'Competitor',
  'Supplier',
  'Vendor',
];

// Date format
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// API constants
export const API_TIMEOUT = 30000;
export const API_RETRY_ATTEMPTS = 3;

// Table columns
export const LEADS_TABLE_COLUMNS = [
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'email', label: 'Email' },
  { id: 'company', label: 'Company' },
  { id: 'status', label: 'Status' },
  { id: 'score', label: 'Lead Score' },
  { id: 'source', label: 'Source' },
  { id: 'createdAt', label: 'Created' },
];

export const CONTACTS_TABLE_COLUMNS = [
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'title', label: 'Title' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created' },
];

export const ACCOUNTS_TABLE_COLUMNS = [
  { id: 'name', label: 'Account Name' },
  { id: 'website', label: 'Website' },
  { id: 'industry', label: 'Industry' },
  { id: 'annualRevenue', label: 'Annual Revenue' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Created' },
];

export const DEALS_TABLE_COLUMNS = [
  { id: 'name', label: 'Deal Name' },
  { id: 'value', label: 'Value' },
  { id: 'stage', label: 'Stage' },
  { id: 'probability', label: 'Probability' },
  { id: 'expectedCloseDate', label: 'Close Date' },
  { id: 'owner_id', label: 'Owner' },
];

export const CASES_TABLE_COLUMNS = [
  { id: 'caseNumber', label: 'Case #' },
  { id: 'subject', label: 'Subject' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'createdAt', label: 'Created' },
];

// Mock users for demo
export const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@crm.local',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    timezone: 'UTC',
    language: 'en',
    isActive: true,
  },
  {
    id: '2',
    email: 'sales@crm.local',
    firstName: 'John',
    lastName: 'Sales',
    role: 'sales_manager' as const,
    timezone: 'UTC',
    language: 'en',
    isActive: true,
  },
  {
    id: '3',
    email: 'rep@crm.local',
    firstName: 'Jane',
    lastName: 'Rep',
    role: 'sales_rep' as const,
    timezone: 'UTC',
    language: 'en',
    isActive: true,
  },
  {
    id: '4',
    email: 'marketing@crm.local',
    firstName: 'Mark',
    lastName: 'Marketing',
    role: 'marketing_user' as const,
    timezone: 'UTC',
    language: 'en',
    isActive: true,
  },
  {
    id: '5',
    email: 'support@crm.local',
    firstName: 'Sarah',
    lastName: 'Support',
    role: 'support_agent' as const,
    timezone: 'UTC',
    language: 'en',
    isActive: true,
  },
];

// Role enums
export enum UserRole {
  ADMIN = 'admin',
  SALES_MANAGER = 'sales_manager',
  SALES_REP = 'sales_rep',
  MARKETING_USER = 'marketing_user',
  SUPPORT_AGENT = 'support_agent',
  EXECUTIVE = 'executive',
}

// Lead statuses
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

// Deal stages
export enum DealStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

// Activity types
export enum ActivityType {
  TASK = 'task',
  CALL = 'call',
  MEETING = 'meeting',
  EMAIL = 'email',
}

// Activity status
export enum ActivityStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
  WAITING_FOR_INPUT = 'waiting_for_input',
}

// Campaign status
export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Case status
export enum CaseStatus {
  NEW = 'new',
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// Case priority
export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Invoice status
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Order status
export enum OrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Quote status
export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Workflow trigger types
export enum WorkflowTriggerType {
  ON_CREATE = 'on_create',
  ON_UPDATE = 'on_update',
  ON_STAGE_CHANGE = 'on_stage_change',
  ON_DATE_CONDITION = 'on_date_condition',
  SCHEDULED = 'scheduled',
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Lead type
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  status: string;
  source?: string | null;
  score: number;
  ownerId: string;
  converted: boolean;
  convertedToContactId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Contact type
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  accountId?: string | null;
  ownerId: string;
  status: string;
  source?: string | null;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Account type
export interface Account {
  id: string;
  name: string;
  website?: string | null;
  type?: string | null;
  industry?: string | null;
  annualRevenue?: number | null;
  employees?: number | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Deal type
export interface Deal {
  id: string;
  name: string;
  value: number;
  probability: number;
  stage: string;
  accountId?: string | null;
  ownerId: string;
  expectedCloseDate?: string | Date | null;
  actualCloseDate?: string | Date | null;
  lostReason?: string | null;
  closedWon: boolean;
  account?: {
    id: string;
    name: string;
    logo?: string | null;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Activity type
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  subject?: string;
  dueDate?: Date;
  scheduledDate?: Date;
  ownerId: string;
  relatedToId?: string;
  relatedToType?: string;
  status: ActivityStatus;
  priority: string;
  remindAt?: Date;
  repeat?: any;
  location?: string;
  venue?: string;
  allDay: boolean;
  participants?: any;
  duration?: number;
  callType?: string;
  callPurpose?: string;
  callAgenda?: string;
  callResult?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Product type
export interface Product {
  id: string;
  name: string;
  sku: string;
  image?: string | null;
  productCode?: string | null;
  vendorName?: string | null;
  manufacturer?: string | null;
  productCategory?: string | null;
  salesStartDate?: string | Date | null;
  salesEndDate?: string | Date | null;
  supportStartDate?: string | Date | null;
  supportEndDate?: string | Date | null;
  unitPrice: number;
  commissionRate?: number | null;
  tax?: string | null;
  taxable: boolean;
  usageUnit?: string | null;
  qtyInStock?: number | null;
  reorderLevel?: number | null;
  handlerId?: string | null;
  qtyInDemand?: number | null;
  description?: string | null;
  status: string;
  ownerId: string;
  organizationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  handler?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// JWT Token payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Price Book types
export interface PriceBook {
  id: string;
  organizationId: string;
  name: string;
  active: boolean;
  pricingModel: 'flat' | 'differential';
  description?: string | null;
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  discountRules?: PriceBookDiscountRule[];
  products?: PriceBookProduct[];
}

export interface PriceBookDiscountRule {
  id: string;
  priceBookId: string;
  fromRange: number;
  toRange: number;
  discount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PriceBookProduct {
  id: string;
  priceBookId: string;
  productId: string;
  listPrice: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product?: Product;
}

// Quote types
export interface Quote {
  id: string;
  organizationId: string;
  ownerId: string;
  quoteNumber: string;
  subject: string;
  stage: string;
  carrier?: string | null;
  team?: string | null;
  validUntil?: string | Date | null;
  accountId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  subTotal: number;
  discount: number;
  tax: number;
  adjustment: number;
  grandTotal: number;
  termsAndConditions?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  account?: Account | null;
  contact?: Contact | null;
  deal?: Deal | null;
  lineItems?: QuoteLineItem[];
}

export interface QuoteLineItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  listPrice: number;
  discount: number;
  tax: number;
  amount: number;
  total: number;
  description?: string | null;
  sequence: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product?: Product;
}

// Sales Order types
export interface SalesOrder {
  id: string;
  organizationId: string;
  ownerId: string;
  orderNumber: string;
  customerNo?: string | null;
  subject: string;
  status: string;
  carrier?: string | null;
  exciseDuty?: string | null;
  pendingBilling?: string | null;
  trackingNumber?: string | null;
  purchaseOrder?: string | null;
  salesCommission?: number | null;
  validUntil?: string | Date | null;
  dueDate?: string | Date | null;
  accountId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  quoteId?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  subTotal: number;
  discount: number;
  tax: number;
  adjustment: number;
  grandTotal: number;
  termsAndConditions?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  account?: Account | null;
  contact?: Contact | null;
  deal?: Deal | null;
  lineItems?: SalesOrderLineItem[];
}

export interface SalesOrderLineItem {
  id: string;
  salesOrderId: string;
  productId: string;
  quantity: number;
  listPrice: number;
  discount: number;
  tax: number;
  amount: number;
  total: number;
  description?: string | null;
  sequence: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product?: Product;
}

// Invoice types
export interface Invoice {
  id: string;
  organizationId: string;
  ownerId: string;
  invoiceNumber: string;
  customerNo?: string | null;
  subject: string;
  status: string;
  salesOrderId?: string | null;
  purchaseOrder?: string | null;
  exciseDuty?: string | null;
  salesCommission?: number | null;
  invoiceDate?: string | Date | null;
  dueDate?: string | Date | null;
  accountId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  subTotal: number;
  discount: number;
  tax: number;
  adjustment: number;
  grandTotal: number;
  termsAndConditions?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  account?: Account | null;
  contact?: Contact | null;
  deal?: Deal | null;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  listPrice: number;
  discount: number;
  tax: number;
  amount: number;
  total: number;
  description?: string | null;
  sequence: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product?: Product;
}

// Vendor types
export interface Vendor {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  category?: string | null;
  status: string;
  description?: string | null;
  glAccount?: string | null;
  emailOptOut?: boolean | null;
  billingAddress?: any;
  shippingAddress?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Purchase Order types
export interface PurchaseOrder {
  id: string;
  organizationId: string;
  ownerId: string;
  orderNumber: string;
  subject: string;
  status: string;
  vendorId?: string | null;
  contactId?: string | null;
  poDate?: string | Date | null;
  dueDate?: string | Date | null;
  requisitionNumber?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  salesOrderId?: string | null;
  salesCommission?: number | null;
  exciseDuty?: string | null;
  billingAddress?: any;
  shippingAddress?: any;
  subTotal: number;
  discount: number;
  tax: number;
  adjustment: number;
  grandTotal: number;
  termsAndConditions?: string | null;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  vendor?: Vendor | null;
  contact?: Contact | null;
  lineItems?: PurchaseOrderLineItem[];
}

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  listPrice: number;
  discount: number;
  tax: number;
  amount: number;
  total: number;
  description?: string | null;
  sequence: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product?: Product;
}

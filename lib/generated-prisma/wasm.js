
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  folder: 'folder',
  config: 'config',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logo: 'logo',
  website: 'website',
  phone: 'phone',
  email: 'email',
  timezone: 'timezone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  senderEmail: 'senderEmail',
  senderName: 'senderName',
  senderReplyTo: 'senderReplyTo',
  whatsappPhoneId: 'whatsappPhoneId',
  whatsappToken: 'whatsappToken',
  whatsappProvider: 'whatsappProvider',
  whatsappWebhookVerifyToken: 'whatsappWebhookVerifyToken',
  billingPlan: 'billingPlan',
  billingStatus: 'billingStatus',
  domain: 'domain',
  enabledModules: 'enabledModules',
  rcNumber: 'rcNumber',
  nifNumber: 'nifNumber',
  aiNumber: 'aiNumber',
  nisNumber: 'nisNumber',
  currency: 'currency'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  isSystem: 'isSystem',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  resource: 'resource',
  action: 'action',
  name: 'name',
  group: 'group',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  roleId: 'roleId',
  permissionId: 'permissionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  avatar: 'avatar',
  timezone: 'timezone',
  language: 'language',
  isActive: 'isActive',
  roleId: 'roleId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  firstName: 'firstName',
  lastName: 'lastName',
  title: 'title',
  email: 'email',
  secondaryEmail: 'secondaryEmail',
  phone: 'phone',
  mobile: 'mobile',
  fax: 'fax',
  company: 'company',
  website: 'website',
  status: 'status',
  source: 'source',
  industry: 'industry',
  employees: 'employees',
  annualRevenue: 'annualRevenue',
  rating: 'rating',
  emailOptOut: 'emailOptOut',
  skypeId: 'skypeId',
  twitter: 'twitter',
  street: 'street',
  city: 'city',
  state: 'state',
  zip: 'zip',
  country: 'country',
  description: 'description',
  score: 'score',
  image: 'image',
  ownerId: 'ownerId',
  converted: 'converted',
  convertedToContactId: 'convertedToContactId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  customFields: 'customFields'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  mobile: 'mobile',
  homePhone: 'homePhone',
  otherPhone: 'otherPhone',
  assistant: 'assistant',
  asstPhone: 'asstPhone',
  title: 'title',
  department: 'department',
  dob: 'dob',
  fax: 'fax',
  skypeId: 'skypeId',
  twitter: 'twitter',
  secondaryEmail: 'secondaryEmail',
  emailOptOut: 'emailOptOut',
  source: 'source',
  reportingTo: 'reportingTo',
  accountId: 'accountId',
  vendorName: 'vendorName',
  mailingStreet: 'mailingStreet',
  mailingCity: 'mailingCity',
  mailingState: 'mailingState',
  mailingZip: 'mailingZip',
  mailingCountry: 'mailingCountry',
  otherStreet: 'otherStreet',
  otherCity: 'otherCity',
  otherState: 'otherState',
  otherZip: 'otherZip',
  otherCountry: 'otherCountry',
  description: 'description',
  status: 'status',
  tags: 'tags',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  customFields: 'customFields'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  website: 'website',
  tickerSymbol: 'tickerSymbol',
  parentAccountId: 'parentAccountId',
  accountNumber: 'accountNumber',
  type: 'type',
  industry: 'industry',
  employees: 'employees',
  annualRevenue: 'annualRevenue',
  rating: 'rating',
  phone: 'phone',
  fax: 'fax',
  ownership: 'ownership',
  sicCode: 'sicCode',
  site: 'site',
  billingStreet: 'billingStreet',
  billingCity: 'billingCity',
  billingState: 'billingState',
  billingZip: 'billingZip',
  billingCountry: 'billingCountry',
  shippingStreet: 'shippingStreet',
  shippingCity: 'shippingCity',
  shippingState: 'shippingState',
  shippingZip: 'shippingZip',
  shippingCountry: 'shippingCountry',
  description: 'description',
  status: 'status',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.DealScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  type: 'type',
  value: 'value',
  probability: 'probability',
  stage: 'stage',
  source: 'source',
  nextStep: 'nextStep',
  expectedCloseDate: 'expectedCloseDate',
  actualCloseDate: 'actualCloseDate',
  lostReason: 'lostReason',
  closedWon: 'closedWon',
  accountId: 'accountId',
  contactId: 'contactId',
  description: 'description',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ActivityScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  type: 'type',
  title: 'title',
  description: 'description',
  subject: 'subject',
  dueDate: 'dueDate',
  scheduledDate: 'scheduledDate',
  ownerId: 'ownerId',
  relatedToId: 'relatedToId',
  relatedToType: 'relatedToType',
  status: 'status',
  priority: 'priority',
  remindAt: 'remindAt',
  repeat: 'repeat',
  location: 'location',
  venue: 'venue',
  allDay: 'allDay',
  participants: 'participants',
  duration: 'duration',
  callType: 'callType',
  callPurpose: 'callPurpose',
  callAgenda: 'callAgenda',
  callResult: 'callResult',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CaseScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  caseNumber: 'caseNumber',
  subject: 'subject',
  description: 'description',
  status: 'status',
  priority: 'priority',
  type: 'type',
  caseOrigin: 'caseOrigin',
  relatedTo: 'relatedTo',
  phone: 'phone',
  caseReason: 'caseReason',
  reportedBy: 'reportedBy',
  email: 'email',
  internalComments: 'internalComments',
  solution: 'solution',
  accountId: 'accountId',
  contactId: 'contactId',
  ownerId: 'ownerId',
  productId: 'productId',
  dealId: 'dealId',
  resolvedAt: 'resolvedAt',
  dueAt: 'dueAt',
  escalatedAt: 'escalatedAt',
  escalationLevel: 'escalationLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SolutionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  solutionNumber: 'solutionNumber',
  title: 'title',
  status: 'status',
  question: 'question',
  answer: 'answer',
  comments: 'comments',
  ownerId: 'ownerId',
  productId: 'productId',
  dealId: 'dealId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  sku: 'sku',
  image: 'image',
  productCode: 'productCode',
  vendorName: 'vendorName',
  manufacturer: 'manufacturer',
  productCategory: 'productCategory',
  salesStartDate: 'salesStartDate',
  salesEndDate: 'salesEndDate',
  supportStartDate: 'supportStartDate',
  supportEndDate: 'supportEndDate',
  unitPrice: 'unitPrice',
  commissionRate: 'commissionRate',
  tax: 'tax',
  taxable: 'taxable',
  usageUnit: 'usageUnit',
  qtyInStock: 'qtyInStock',
  reorderLevel: 'reorderLevel',
  handlerId: 'handlerId',
  qtyInDemand: 'qtyInDemand',
  description: 'description',
  status: 'status',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SalesOrderScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  orderNumber: 'orderNumber',
  customerNo: 'customerNo',
  subject: 'subject',
  status: 'status',
  carrier: 'carrier',
  exciseDuty: 'exciseDuty',
  pendingBilling: 'pendingBilling',
  trackingNumber: 'trackingNumber',
  purchaseOrder: 'purchaseOrder',
  salesCommission: 'salesCommission',
  validUntil: 'validUntil',
  dueDate: 'dueDate',
  accountId: 'accountId',
  contactId: 'contactId',
  dealId: 'dealId',
  quoteId: 'quoteId',
  billingAddress: 'billingAddress',
  shippingAddress: 'shippingAddress',
  subTotal: 'subTotal',
  discount: 'discount',
  tax: 'tax',
  adjustment: 'adjustment',
  grandTotal: 'grandTotal',
  termsAndConditions: 'termsAndConditions',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SalesOrderLineItemScalarFieldEnum = {
  id: 'id',
  salesOrderId: 'salesOrderId',
  productId: 'productId',
  quantity: 'quantity',
  listPrice: 'listPrice',
  discount: 'discount',
  tax: 'tax',
  amount: 'amount',
  total: 'total',
  description: 'description',
  sequence: 'sequence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  invoiceNumber: 'invoiceNumber',
  customerNo: 'customerNo',
  subject: 'subject',
  status: 'status',
  salesOrderId: 'salesOrderId',
  purchaseOrder: 'purchaseOrder',
  exciseDuty: 'exciseDuty',
  salesCommission: 'salesCommission',
  invoiceDate: 'invoiceDate',
  dueDate: 'dueDate',
  accountId: 'accountId',
  contactId: 'contactId',
  dealId: 'dealId',
  billingAddress: 'billingAddress',
  shippingAddress: 'shippingAddress',
  subTotal: 'subTotal',
  discount: 'discount',
  tax: 'tax',
  adjustment: 'adjustment',
  grandTotal: 'grandTotal',
  termsAndConditions: 'termsAndConditions',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.InvoiceLineItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  productId: 'productId',
  quantity: 'quantity',
  listPrice: 'listPrice',
  discount: 'discount',
  tax: 'tax',
  amount: 'amount',
  total: 'total',
  description: 'description',
  sequence: 'sequence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  channel: 'channel',
  status: 'status',
  budget: 'budget',
  spent: 'spent',
  leadsGenerated: 'leadsGenerated',
  revenue: 'revenue',
  startDate: 'startDate',
  endDate: 'endDate',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
  cancelledAt: 'cancelledAt',
  clickCount: 'clickCount',
  completedAt: 'completedAt',
  emailsPerMinute: 'emailsPerMinute',
  failedCount: 'failedCount',
  lastProcessedAt: 'lastProcessedAt',
  openCount: 'openCount',
  pausedAt: 'pausedAt',
  processingLockUntil: 'processingLockUntil',
  resumedAt: 'resumedAt',
  scheduledAt: 'scheduledAt',
  segmentId: 'segmentId',
  sentCount: 'sentCount',
  startedAt: 'startedAt',
  templateId: 'templateId',
  timezone: 'timezone',
  totalRecipients: 'totalRecipients',
  unsubscribeCount: 'unsubscribeCount'
};

exports.Prisma.WorkflowScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  triggerType: 'triggerType',
  targetModule: 'targetModule',
  conditionJson: 'conditionJson',
  actionJson: 'actionJson',
  isActive: 'isActive',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.WorkflowExecutionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  workflowId: 'workflowId',
  targetId: 'targetId',
  status: 'status',
  message: 'message',
  executedById: 'executedById',
  createdAt: 'createdAt'
};

exports.Prisma.EmailTemplateScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  subject: 'subject',
  htmlContent: 'htmlContent',
  textContent: 'textContent',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  designJson: 'designJson',
  imageUrls: 'imageUrls',
  previewText: 'previewText'
};

exports.Prisma.EmailLogScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  campaignId: 'campaignId',
  templateId: 'templateId',
  recipientEmail: 'recipientEmail',
  recipientName: 'recipientName',
  subject: 'subject',
  status: 'status',
  messageId: 'messageId',
  error: 'error',
  sentAt: 'sentAt',
  openedAt: 'openedAt',
  clickedAt: 'clickedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  clickCount: 'clickCount',
  lastOpenedIp: 'lastOpenedIp',
  lastOpenedUserAgent: 'lastOpenedUserAgent',
  openCount: 'openCount',
  previewText: 'previewText',
  recipientId: 'recipientId',
  recipientType: 'recipientType',
  trackingToken: 'trackingToken',
  unsubscribeToken: 'unsubscribeToken',
  unsubscribedAt: 'unsubscribedAt'
};

exports.Prisma.CampaignRecipientScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  campaignId: 'campaignId',
  recipientType: 'recipientType',
  recipientId: 'recipientId',
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  company: 'company',
  customFields: 'customFields',
  status: 'status',
  error: 'error',
  processedAt: 'processedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastError: 'lastError',
  nextAttemptAt: 'nextAttemptAt',
  retryCount: 'retryCount',
  sentAt: 'sentAt'
};

exports.Prisma.CustomFieldDefinitionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  entityType: 'entityType',
  key: 'key',
  label: 'label',
  fieldType: 'fieldType',
  options: 'options',
  isRequired: 'isRequired',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SegmentScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  entityType: 'entityType',
  description: 'description',
  rulesJson: 'rulesJson',
  isActive: 'isActive',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailBlacklistScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  email: 'email',
  reason: 'reason',
  source: 'source',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ForecastConfigScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  model: 'model',
  hierarchyType: 'hierarchyType',
  metric: 'metric',
  fiscalStartMonth: 'fiscalStartMonth',
  fiscalYearType: 'fiscalYearType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ForecastScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  type: 'type',
  period: 'period',
  year: 'year',
  basedOn: 'basedOn',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ForecastTargetScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  forecastId: 'forecastId',
  targetValue: 'targetValue',
  isCompanyTarget: 'isCompanyTarget',
  userId: 'userId',
  roleId: 'roleId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentFolderScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  isTeamFolder: 'isTeamFolder',
  parentId: 'parentId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  type: 'type',
  url: 'url',
  sizeBytes: 'sizeBytes',
  extension: 'extension',
  folderId: 'folderId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  recordType: 'recordType',
  recordId: 'recordId'
};

exports.Prisma.UnsubscribeEventScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  email: 'email',
  emailLogId: 'emailLogId',
  reason: 'reason',
  source: 'source',
  token: 'token',
  createdAt: 'createdAt'
};

exports.Prisma.PriceBookScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  active: 'active',
  pricingModel: 'pricingModel',
  description: 'description',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.PriceBookDiscountRuleScalarFieldEnum = {
  id: 'id',
  priceBookId: 'priceBookId',
  fromRange: 'fromRange',
  toRange: 'toRange',
  discount: 'discount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PriceBookProductScalarFieldEnum = {
  id: 'id',
  priceBookId: 'priceBookId',
  productId: 'productId',
  listPrice: 'listPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QuoteScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  quoteNumber: 'quoteNumber',
  subject: 'subject',
  stage: 'stage',
  carrier: 'carrier',
  team: 'team',
  validUntil: 'validUntil',
  accountId: 'accountId',
  contactId: 'contactId',
  dealId: 'dealId',
  billingAddress: 'billingAddress',
  shippingAddress: 'shippingAddress',
  subTotal: 'subTotal',
  discount: 'discount',
  tax: 'tax',
  adjustment: 'adjustment',
  grandTotal: 'grandTotal',
  termsAndConditions: 'termsAndConditions',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.QuoteLineItemScalarFieldEnum = {
  id: 'id',
  quoteId: 'quoteId',
  productId: 'productId',
  quantity: 'quantity',
  listPrice: 'listPrice',
  discount: 'discount',
  tax: 'tax',
  amount: 'amount',
  total: 'total',
  description: 'description',
  sequence: 'sequence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  website: 'website',
  category: 'category',
  status: 'status',
  description: 'description',
  glAccount: 'glAccount',
  emailOptOut: 'emailOptOut',
  billingAddress: 'billingAddress',
  shippingAddress: 'shippingAddress',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  orderNumber: 'orderNumber',
  subject: 'subject',
  status: 'status',
  vendorId: 'vendorId',
  requisitionNumber: 'requisitionNumber',
  trackingNumber: 'trackingNumber',
  carrier: 'carrier',
  salesOrderId: 'salesOrderId',
  poDate: 'poDate',
  dueDate: 'dueDate',
  salesCommission: 'salesCommission',
  exciseDuty: 'exciseDuty',
  contactId: 'contactId',
  billingAddress: 'billingAddress',
  shippingAddress: 'shippingAddress',
  subTotal: 'subTotal',
  discount: 'discount',
  tax: 'tax',
  adjustment: 'adjustment',
  grandTotal: 'grandTotal',
  termsAndConditions: 'termsAndConditions',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.PurchaseOrderLineItemScalarFieldEnum = {
  id: 'id',
  purchaseOrderId: 'purchaseOrderId',
  productId: 'productId',
  quantity: 'quantity',
  listPrice: 'listPrice',
  discount: 'discount',
  tax: 'tax',
  amount: 'amount',
  total: 'total',
  description: 'description',
  sequence: 'sequence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RequestScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  title: 'title',
  type: 'type',
  status: 'status',
  priority: 'priority',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl',
  read: 'read',
  createdAt: 'createdAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  name: 'name',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  budget: 'budget',
  revenue: 'revenue',
  description: 'description',
  accountId: 'accountId',
  contactId: 'contactId',
  dealId: 'dealId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  price: 'price',
  duration: 'duration',
  location: 'location',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  contactId: 'contactId',
  customerName: 'customerName',
  rating: 'rating',
  comment: 'comment',
  source: 'source',
  sentiment: 'sentiment',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ForecastGoalScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  ownerId: 'ownerId',
  category: 'category',
  targetValue: 'targetValue',
  currentValue: 'currentValue',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Report: 'Report',
  Organization: 'Organization',
  Role: 'Role',
  Permission: 'Permission',
  RolePermission: 'RolePermission',
  User: 'User',
  Lead: 'Lead',
  Contact: 'Contact',
  Account: 'Account',
  Deal: 'Deal',
  Activity: 'Activity',
  Case: 'Case',
  Solution: 'Solution',
  Product: 'Product',
  SalesOrder: 'SalesOrder',
  SalesOrderLineItem: 'SalesOrderLineItem',
  Invoice: 'Invoice',
  InvoiceLineItem: 'InvoiceLineItem',
  Campaign: 'Campaign',
  Workflow: 'Workflow',
  WorkflowExecution: 'WorkflowExecution',
  EmailTemplate: 'EmailTemplate',
  EmailLog: 'EmailLog',
  CampaignRecipient: 'CampaignRecipient',
  CustomFieldDefinition: 'CustomFieldDefinition',
  Segment: 'Segment',
  EmailBlacklist: 'EmailBlacklist',
  ForecastConfig: 'ForecastConfig',
  Forecast: 'Forecast',
  ForecastTarget: 'ForecastTarget',
  DocumentFolder: 'DocumentFolder',
  Document: 'Document',
  UnsubscribeEvent: 'UnsubscribeEvent',
  PriceBook: 'PriceBook',
  PriceBookDiscountRule: 'PriceBookDiscountRule',
  PriceBookProduct: 'PriceBookProduct',
  Quote: 'Quote',
  QuoteLineItem: 'QuoteLineItem',
  Vendor: 'Vendor',
  PurchaseOrder: 'PurchaseOrder',
  PurchaseOrderLineItem: 'PurchaseOrderLineItem',
  Request: 'Request',
  Notification: 'Notification',
  Project: 'Project',
  Service: 'Service',
  Feedback: 'Feedback',
  ForecastGoal: 'ForecastGoal'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

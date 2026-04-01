import { PrismaClient } from '../lib/generated-prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const db = prisma as any;

const DAY_MS = 24 * 60 * 60 * 1000;

const addDays = (days: number) => new Date(Date.now() + days * DAY_MS);
const toBigInt = (value: number) => BigInt(value);

type RoleKey = 'admin' | 'sales-manager' | 'sales-rep' | 'marketing' | 'support' | 'executive';

async function ensureRecord(model: any, where: Record<string, unknown>, create: Record<string, unknown>, update = create) {
  const existing = await model.findFirst({ where });

  if (existing) {
    return model.update({
      where: { id: existing.id },
      data: update,
    });
  }

  return model.create({ data: create });
}

async function ensureLineItem(model: any, where: Record<string, unknown>, create: Record<string, unknown>) {
  return ensureRecord(model, where, create, create);
}

async function main() {
  console.log('Seeding database...');

  const enabledModules = {
    accounts: true,
    activities: true,
    analytics: true,
    campaigns: true,
    contacts: true,
    deals: true,
    documents: true,
    forecasts: true,
    inventory: true,
    leads: true,
    projects: true,
    reports: true,
    services: true,
    settings: true,
    support: true,
    voc: true,
    workflows: true,
    integrations: false,
  };

  const org = await prisma.organization.upsert({
    where: { slug: 'default-org' },
    update: {
      name: 'Default Organization',
      timezone: 'UTC',
      email: 'admin@org.local',
      phone: '+213 21 000 001',
      website: 'https://demo.dx-crm.local',
      domain: 'dx-crm.local',
      senderEmail: 'campaigns@dx.local',
      senderName: 'DX CRM',
      senderReplyTo: 'support@dx.local',
      currency: 'DZD',
      billingPlan: 'enterprise',
      billingStatus: 'active',
      enabledModules,
    },
    create: {
      name: 'Default Organization',
      slug: 'default-org',
      timezone: 'UTC',
      email: 'admin@org.local',
      phone: '+213 21 000 001',
      website: 'https://demo.dx-crm.local',
      domain: 'dx-crm.local',
      senderEmail: 'campaigns@dx.local',
      senderName: 'DX CRM',
      senderReplyTo: 'support@dx.local',
      currency: 'DZD',
      billingPlan: 'enterprise',
      billingStatus: 'active',
      enabledModules,
    },
  });

  console.log('Organization ready:', org.id);

  const roleDefinitions: Array<{ key: RoleKey; name: string; description: string }> = [
    { key: 'admin', name: 'Admin', description: 'Administrator role with full access' },
    { key: 'sales-manager', name: 'Sales Manager', description: 'Sales manager with team oversight' },
    { key: 'sales-rep', name: 'Sales Representative', description: 'Frontline sales representative' },
    { key: 'marketing', name: 'Marketing User', description: 'Marketing user with campaign access' },
    { key: 'support', name: 'Support Agent', description: 'Support agent for cases and solutions' },
    { key: 'executive', name: 'Executive', description: 'Executive viewer for reports and forecasts' },
  ];

  const roles = {} as Record<RoleKey, any>;

  for (const roleDefinition of roleDefinitions) {
    roles[roleDefinition.key] = await prisma.role.upsert({
      where: { id: `${org.id}-${roleDefinition.key}` },
      update: {
        name: roleDefinition.name,
        description: roleDefinition.description,
        isSystem: true,
      },
      create: {
        id: `${org.id}-${roleDefinition.key}`,
        organizationId: org.id,
        name: roleDefinition.name,
        description: roleDefinition.description,
        isSystem: true,
      },
    });
  }

  console.log('Roles ready');

  const permissionMap: Record<string, string[]> = {
    users: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    leads: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    contacts: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    accounts: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    deals: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    activities: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    campaigns: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    cases: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    solutions: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    products: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    quotes: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    orders: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    sales_orders: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    invoices: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    vendors: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    purchaseOrders: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    price_books: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    workflows: ['view', 'read', 'create', 'edit', 'update', 'delete', 'execute'],
    documents: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    settings: ['view', 'read', 'edit', 'update'],
    analytics: ['view', 'read'],
    reports: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    forecasts: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    projects: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    services: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    feedbacks: ['view', 'read', 'create', 'edit', 'update', 'delete'],
    notifications: ['view', 'read', 'create'],
    requests: ['view', 'read', 'create', 'edit', 'update'],
  };

  const permissionsByResourceAction = new Map<string, any>();

  for (const [resource, actions] of Object.entries(permissionMap)) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: {
          organizationId_resource_action: {
            organizationId: org.id,
            resource,
            action,
          },
        },
        update: {
          name: `${resource}.${action}`,
          group: resource,
          description: `${action} access for ${resource}`,
        },
        create: {
          organizationId: org.id,
          resource,
          action,
          name: `${resource}.${action}`,
          group: resource,
          description: `${action} access for ${resource}`,
        },
      });

      permissionsByResourceAction.set(`${resource}:${action}`, permission);
    }
  }

  const roleGrants: Record<RoleKey, Record<string, string[]>> = {
    admin: permissionMap,
    'sales-manager': {
      leads: permissionMap.leads,
      contacts: permissionMap.contacts,
      accounts: permissionMap.accounts,
      deals: permissionMap.deals,
      activities: permissionMap.activities,
      campaigns: permissionMap.campaigns,
      cases: permissionMap.cases,
      products: permissionMap.products,
      quotes: permissionMap.quotes,
      orders: permissionMap.orders,
      sales_orders: permissionMap.sales_orders,
      invoices: permissionMap.invoices,
      vendors: permissionMap.vendors,
      purchaseOrders: permissionMap.purchaseOrders,
      price_books: permissionMap.price_books,
      workflows: permissionMap.workflows,
      documents: permissionMap.documents,
      analytics: permissionMap.analytics,
      reports: permissionMap.reports,
      forecasts: permissionMap.forecasts,
      projects: permissionMap.projects,
      services: permissionMap.services,
      requests: permissionMap.requests,
      notifications: permissionMap.notifications,
    },
    'sales-rep': {
      leads: ['view', 'read', 'create', 'edit', 'update'],
      contacts: ['view', 'read', 'create', 'edit', 'update'],
      accounts: ['view', 'read', 'create', 'edit', 'update'],
      deals: ['view', 'read', 'create', 'edit', 'update'],
      activities: ['view', 'read', 'create', 'edit', 'update'],
      products: ['view', 'read'],
      quotes: ['view', 'read', 'create', 'edit', 'update'],
      orders: ['view', 'read', 'create', 'edit', 'update'],
      sales_orders: ['view', 'read', 'create', 'edit', 'update'],
      invoices: ['view', 'read', 'create', 'edit', 'update'],
      documents: ['view', 'read', 'create'],
      workflows: ['view', 'read', 'execute'],
      analytics: ['view', 'read'],
      projects: ['view', 'read', 'create', 'edit', 'update'],
      services: ['view', 'read'],
      requests: ['view', 'read', 'create'],
      notifications: ['view', 'read'],
    },
    marketing: {
      leads: ['view', 'read', 'create', 'edit', 'update'],
      contacts: ['view', 'read'],
      accounts: ['view', 'read'],
      campaigns: permissionMap.campaigns,
      workflows: ['view', 'read', 'execute'],
      documents: ['view', 'read'],
      analytics: permissionMap.analytics,
      reports: ['view', 'read'],
      requests: ['view', 'read', 'create'],
      notifications: ['view', 'read'],
    },
    support: {
      contacts: ['view', 'read', 'create', 'edit', 'update'],
      accounts: ['view', 'read'],
      activities: ['view', 'read', 'create', 'edit', 'update'],
      cases: permissionMap.cases,
      solutions: permissionMap.solutions,
      documents: ['view', 'read', 'create'],
      feedbacks: permissionMap.feedbacks,
      analytics: permissionMap.analytics,
      requests: ['view', 'read', 'create', 'edit', 'update'],
      notifications: ['view', 'read'],
    },
    executive: {
      leads: ['view', 'read'],
      contacts: ['view', 'read'],
      accounts: ['view', 'read'],
      deals: ['view', 'read'],
      activities: ['view', 'read'],
      campaigns: ['view', 'read'],
      cases: ['view', 'read'],
      solutions: ['view', 'read'],
      products: ['view', 'read'],
      quotes: ['view', 'read'],
      orders: ['view', 'read'],
      sales_orders: ['view', 'read'],
      invoices: ['view', 'read'],
      vendors: ['view', 'read'],
      purchaseOrders: ['view', 'read'],
      price_books: ['view', 'read'],
      documents: ['view', 'read'],
      workflows: ['view', 'read'],
      analytics: ['view', 'read'],
      reports: ['view', 'read'],
      forecasts: ['view', 'read'],
      projects: ['view', 'read'],
      services: ['view', 'read'],
      feedbacks: ['view', 'read'],
      requests: ['view', 'read'],
      notifications: ['view', 'read'],
    },
  };

  for (const roleKey of Object.keys(roles) as RoleKey[]) {
    const grants = roleGrants[roleKey];

    for (const [resource, actions] of Object.entries(grants)) {
      for (const action of actions) {
        const permission = permissionsByResourceAction.get(`${resource}:${action}`);

        if (!permission) {
          continue;
        }

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: roles[roleKey].id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: roles[roleKey].id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log('Permissions ready');

  const passwordByEmail = {
    'admin@dx.local': await bcrypt.hash('admin123', 10),
    'sales@dx.local': await bcrypt.hash('sales123', 10),
    'rep@dx.local': await bcrypt.hash('rep123', 10),
    'marketing@dx.local': await bcrypt.hash('marketing123', 10),
    'support@dx.local': await bcrypt.hash('support123', 10),
    'executive@dx.local': await bcrypt.hash('executive123', 10),
  };

  const users = {
    admin: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'admin@dx.local' } },
      update: {
        password: passwordByEmail['admin@dx.local'],
        firstName: 'Admin',
        lastName: 'User',
        roleId: roles.admin.id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'admin@dx.local',
        password: passwordByEmail['admin@dx.local'],
        firstName: 'Admin',
        lastName: 'User',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles.admin.id,
      },
    }),
    salesManager: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'sales@dx.local' } },
      update: {
        password: passwordByEmail['sales@dx.local'],
        firstName: 'John',
        lastName: 'Sales',
        roleId: roles['sales-manager'].id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'sales@dx.local',
        password: passwordByEmail['sales@dx.local'],
        firstName: 'John',
        lastName: 'Sales',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles['sales-manager'].id,
      },
    }),
    salesRep: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'rep@dx.local' } },
      update: {
        password: passwordByEmail['rep@dx.local'],
        firstName: 'Jane',
        lastName: 'Representative',
        roleId: roles['sales-rep'].id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'rep@dx.local',
        password: passwordByEmail['rep@dx.local'],
        firstName: 'Jane',
        lastName: 'Representative',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles['sales-rep'].id,
      },
    }),
    marketing: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'marketing@dx.local' } },
      update: {
        password: passwordByEmail['marketing@dx.local'],
        firstName: 'Mina',
        lastName: 'Marketing',
        roleId: roles.marketing.id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'marketing@dx.local',
        password: passwordByEmail['marketing@dx.local'],
        firstName: 'Mina',
        lastName: 'Marketing',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles.marketing.id,
      },
    }),
    support: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'support@dx.local' } },
      update: {
        password: passwordByEmail['support@dx.local'],
        firstName: 'Sam',
        lastName: 'Support',
        roleId: roles.support.id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'support@dx.local',
        password: passwordByEmail['support@dx.local'],
        firstName: 'Sam',
        lastName: 'Support',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles.support.id,
      },
    }),
    executive: await prisma.user.upsert({
      where: { organizationId_email: { organizationId: org.id, email: 'executive@dx.local' } },
      update: {
        password: passwordByEmail['executive@dx.local'],
        firstName: 'Evan',
        lastName: 'Executive',
        roleId: roles.executive.id,
        isActive: true,
      },
      create: {
        organizationId: org.id,
        email: 'executive@dx.local',
        password: passwordByEmail['executive@dx.local'],
        firstName: 'Evan',
        lastName: 'Executive',
        timezone: 'UTC',
        language: 'en',
        isActive: true,
        roleId: roles.executive.id,
      },
    }),
  };

  console.log('Users ready');

  const accountAcme = await ensureRecord(
    db.account,
    { organizationId: org.id, name: 'Acme Industries' },
    {
      organizationId: org.id,
      name: 'Acme Industries',
      website: 'https://acme.example.com',
      accountNumber: 'ACC-001',
      type: 'Customer',
      industry: 'technology',
      employees: 420,
      annualRevenue: toBigInt(120000000),
      phone: '+213 21 100 100',
      billingStreet: '12 Innovation Way',
      billingCity: 'Algiers',
      billingCountry: 'Algeria',
      shippingStreet: '12 Innovation Way',
      shippingCity: 'Algiers',
      shippingCountry: 'Algeria',
      description: 'Enterprise customer for multi-team rollout.',
      status: 'active',
      ownerId: users.salesManager.id,
    }
  );

  const accountNorthwind = await ensureRecord(
    db.account,
    { organizationId: org.id, name: 'Northwind Health' },
    {
      organizationId: org.id,
      name: 'Northwind Health',
      website: 'https://northwind.example.com',
      accountNumber: 'ACC-002',
      type: 'Prospect',
      industry: 'healthcare',
      employees: 180,
      annualRevenue: toBigInt(42000000),
      phone: '+213 21 100 200',
      billingStreet: '88 Care Street',
      billingCity: 'Oran',
      billingCountry: 'Algeria',
      shippingStreet: '88 Care Street',
      shippingCity: 'Oran',
      shippingCountry: 'Algeria',
      description: 'Regional healthcare provider evaluating CRM modernization.',
      status: 'active',
      ownerId: users.salesRep.id,
    }
  );

  const accountAtlas = await ensureRecord(
    db.account,
    { organizationId: org.id, name: 'Atlas Logistics' },
    {
      organizationId: org.id,
      name: 'Atlas Logistics',
      website: 'https://atlas.example.com',
      accountNumber: 'ACC-003',
      type: 'Partner',
      industry: 'transportation',
      employees: 85,
      annualRevenue: toBigInt(12000000),
      phone: '+213 21 100 300',
      billingStreet: '5 Port Avenue',
      billingCity: 'Annaba',
      billingCountry: 'Algeria',
      shippingStreet: '5 Port Avenue',
      shippingCity: 'Annaba',
      shippingCountry: 'Algeria',
      description: 'Logistics partner supporting field deployments.',
      status: 'active',
      ownerId: users.salesManager.id,
    }
  );

  const contactAlice = await ensureRecord(
    db.contact,
    { organizationId: org.id, email: 'alice@acme.example.com' },
    {
      organizationId: org.id,
      firstName: 'Alice',
      lastName: 'Anderson',
      email: 'alice@acme.example.com',
      phone: '+213 550 000 101',
      title: 'Operations Director',
      department: 'Operations',
      accountId: accountAcme.id,
      mailingCity: 'Algiers',
      mailingCountry: 'Algeria',
      description: 'Primary decision maker for rollout planning.',
      status: 'active',
      tags: ['enterprise', 'champion'],
      ownerId: users.salesManager.id,
    }
  );

  const contactNora = await ensureRecord(
    db.contact,
    { organizationId: org.id, email: 'nora@northwind.example.com' },
    {
      organizationId: org.id,
      firstName: 'Nora',
      lastName: 'Nadir',
      email: 'nora@northwind.example.com',
      phone: '+213 550 000 102',
      title: 'Head of Patient Experience',
      department: 'Customer Success',
      accountId: accountNorthwind.id,
      mailingCity: 'Oran',
      mailingCountry: 'Algeria',
      description: 'Sponsor for patient communication workflow.',
      status: 'active',
      tags: ['healthcare'],
      ownerId: users.salesRep.id,
    }
  );

  const contactKarim = await ensureRecord(
    db.contact,
    { organizationId: org.id, email: 'karim@atlas.example.com' },
    {
      organizationId: org.id,
      firstName: 'Karim',
      lastName: 'Khaled',
      email: 'karim@atlas.example.com',
      phone: '+213 550 000 103',
      title: 'Procurement Lead',
      department: 'Procurement',
      accountId: accountAtlas.id,
      mailingCity: 'Annaba',
      mailingCountry: 'Algeria',
      description: 'Coordinates vendor and hardware purchase approvals.',
      status: 'active',
      tags: ['partner'],
      ownerId: users.salesManager.id,
    }
  );

  const leadCarol = await ensureRecord(
    db.lead,
    { organizationId: org.id, email: 'carol@brightstart.example.com' },
    {
      organizationId: org.id,
      firstName: 'Carol',
      lastName: 'Clark',
      title: 'Growth Manager',
      email: 'carol@brightstart.example.com',
      phone: '+213 550 100 001',
      company: 'BrightStart',
      website: 'https://brightstart.example.com',
      status: 'new',
      source: 'webSearch',
      industry: 'education',
      employees: 40,
      annualRevenue: toBigInt(1200000),
      rating: 'warm',
      city: 'Constantine',
      country: 'Algeria',
      description: 'Inbound lead from pricing page comparison request.',
      score: 72,
      ownerId: users.salesManager.id,
    }
  );

  const leadDave = await ensureRecord(
    db.lead,
    { organizationId: org.id, email: 'dave@signal.example.com' },
    {
      organizationId: org.id,
      firstName: 'Dave',
      lastName: 'Davis',
      title: 'Regional Sales Director',
      email: 'dave@signal.example.com',
      phone: '+213 550 100 002',
      company: 'Signal Telecom',
      website: 'https://signal.example.com',
      status: 'contacted',
      source: 'emailCampaign',
      industry: 'telecommunications',
      employees: 220,
      annualRevenue: toBigInt(36000000),
      rating: 'hot',
      city: 'Algiers',
      country: 'Algeria',
      description: 'Requested demo after outbound campaign.',
      score: 86,
      ownerId: users.salesRep.id,
    }
  );

  const leadFatima = await ensureRecord(
    db.lead,
    { organizationId: org.id, email: 'fatima@greenfield.example.com' },
    {
      organizationId: org.id,
      firstName: 'Fatima',
      lastName: 'Benkacem',
      title: 'Chief of Staff',
      email: 'fatima@greenfield.example.com',
      phone: '+213 550 100 003',
      company: 'Greenfield Energy',
      website: 'https://greenfield.example.com',
      status: 'qualified',
      source: 'referral',
      industry: 'energy',
      employees: 600,
      annualRevenue: toBigInt(95000000),
      rating: 'hot',
      city: 'Ouargla',
      country: 'Algeria',
      description: 'Executive sponsor referred by channel partner.',
      score: 91,
      ownerId: users.salesManager.id,
    }
  );

  const dealExpansion = await ensureRecord(
    db.deal,
    { organizationId: org.id, name: 'Acme Expansion FY26' },
    {
      organizationId: org.id,
      name: 'Acme Expansion FY26',
      type: 'Existing Business',
      value: toBigInt(6500000),
      probability: 80,
      stage: 'negotiation',
      source: 'account_growth',
      nextStep: 'Finalize commercial terms',
      expectedCloseDate: addDays(14),
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      description: 'Expansion across support and inventory teams.',
      ownerId: users.salesManager.id,
    }
  );

  const dealNorthwind = await ensureRecord(
    db.deal,
    { organizationId: org.id, name: 'Northwind Patient Journey' },
    {
      organizationId: org.id,
      name: 'Northwind Patient Journey',
      type: 'New Business',
      value: toBigInt(3400000),
      probability: 60,
      stage: 'proposal',
      source: 'campaign',
      nextStep: 'Review pilot scope with stakeholders',
      expectedCloseDate: addDays(21),
      accountId: accountNorthwind.id,
      contactId: contactNora.id,
      description: 'Proposal for multi-site care coordination workflows.',
      ownerId: users.salesRep.id,
    }
  );

  const dealGreenfield = await ensureRecord(
    db.deal,
    { organizationId: org.id, name: 'Greenfield Executive Dashboard' },
    {
      organizationId: org.id,
      name: 'Greenfield Executive Dashboard',
      type: 'New Business',
      value: toBigInt(9200000),
      probability: 35,
      stage: 'qualification',
      source: 'referral',
      nextStep: 'Discovery workshop',
      expectedCloseDate: addDays(45),
      description: 'Executive reporting and forecast implementation.',
      ownerId: users.salesManager.id,
    }
  );

  await ensureRecord(
    db.activity,
    { organizationId: org.id, title: 'Prepare Acme renewal proposal' },
    {
      organizationId: org.id,
      type: 'task',
      title: 'Prepare Acme renewal proposal',
      description: 'Compile pricing options and migration scope.',
      subject: 'Renewal proposal',
      dueDate: addDays(3),
      ownerId: users.salesManager.id,
      relatedToId: dealExpansion.id,
      relatedToType: 'deal',
      status: 'open',
      priority: 'high',
    }
  );

  await ensureRecord(
    db.activity,
    { organizationId: org.id, title: 'Northwind discovery call' },
    {
      organizationId: org.id,
      type: 'call',
      title: 'Northwind discovery call',
      description: 'Review patient communication use cases.',
      subject: 'Discovery call',
      scheduledDate: addDays(2),
      ownerId: users.salesRep.id,
      relatedToId: dealNorthwind.id,
      relatedToType: 'deal',
      status: 'open',
      priority: 'normal',
      callType: 'outbound',
      callPurpose: 'discovery',
    }
  );

  await ensureRecord(
    db.activity,
    { organizationId: org.id, title: 'Support SLA review' },
    {
      organizationId: org.id,
      type: 'meeting',
      title: 'Support SLA review',
      description: 'Review open support workload and response targets.',
      subject: 'Weekly support review',
      scheduledDate: addDays(1),
      ownerId: users.support.id,
      relatedToId: accountAcme.id,
      relatedToType: 'account',
      status: 'open',
      priority: 'high',
      location: 'HQ Meeting Room',
      duration: 60,
    }
  );

  const productCore = await ensureRecord(
    db.product,
    { organizationId: org.id, sku: 'CRM-CORE' },
    {
      organizationId: org.id,
      name: 'CRM Core Platform',
      sku: 'CRM-CORE',
      productCategory: 'Software',
      manufacturer: 'DX CRM',
      unitPrice: toBigInt(250000),
      commissionRate: 8,
      taxable: true,
      usageUnit: 'license',
      qtyInStock: 500,
      reorderLevel: 50,
      qtyInDemand: 14,
      description: 'Core workspace license for sales, service, and operations teams.',
      status: 'active',
      ownerId: users.salesManager.id,
      handlerId: users.salesRep.id,
    }
  );

  const productSupport = await ensureRecord(
    db.product,
    { organizationId: org.id, sku: 'SUPPORT-PLUS' },
    {
      organizationId: org.id,
      name: 'Support Plus Add-on',
      sku: 'SUPPORT-PLUS',
      productCategory: 'Software',
      manufacturer: 'DX CRM',
      unitPrice: toBigInt(95000),
      commissionRate: 6,
      taxable: true,
      usageUnit: 'license',
      qtyInStock: 250,
      reorderLevel: 20,
      qtyInDemand: 7,
      description: 'Knowledge base, SLA, and customer support extension.',
      status: 'active',
      ownerId: users.salesManager.id,
      handlerId: users.support.id,
    }
  );

  const productImplementation = await ensureRecord(
    db.product,
    { organizationId: org.id, sku: 'SERV-IMPL' },
    {
      organizationId: org.id,
      name: 'Implementation Package',
      sku: 'SERV-IMPL',
      productCategory: 'Service',
      manufacturer: 'DX Consulting',
      unitPrice: toBigInt(450000),
      commissionRate: 4,
      taxable: true,
      usageUnit: 'project',
      qtyInStock: 40,
      reorderLevel: 5,
      qtyInDemand: 3,
      description: 'Professional services for onboarding and deployment.',
      status: 'active',
      ownerId: users.salesManager.id,
      handlerId: users.salesManager.id,
    }
  );

  const priceBookStandard = await ensureRecord(
    db.priceBook,
    { organizationId: org.id, name: 'Standard FY26 Pricing' },
    {
      organizationId: org.id,
      name: 'Standard FY26 Pricing',
      active: true,
      pricingModel: 'flat',
      description: 'Default pricing used by the commercial team.',
      ownerId: users.salesManager.id,
    }
  );

  await ensureRecord(
    db.priceBookDiscountRule,
    { priceBookId: priceBookStandard.id, fromRange: 10, toRange: 49 },
    {
      priceBookId: priceBookStandard.id,
      fromRange: 10,
      toRange: 49,
      discount: 7.5,
    }
  );

  await prisma.priceBookProduct.upsert({
    where: {
      priceBookId_productId: {
        priceBookId: priceBookStandard.id,
        productId: productCore.id,
      },
    },
    update: { listPrice: toBigInt(250000) },
    create: {
      priceBookId: priceBookStandard.id,
      productId: productCore.id,
      listPrice: toBigInt(250000),
    },
  });

  await prisma.priceBookProduct.upsert({
    where: {
      priceBookId_productId: {
        priceBookId: priceBookStandard.id,
        productId: productSupport.id,
      },
    },
    update: { listPrice: toBigInt(95000) },
    create: {
      priceBookId: priceBookStandard.id,
      productId: productSupport.id,
      listPrice: toBigInt(95000),
    },
  });

  await prisma.priceBookProduct.upsert({
    where: {
      priceBookId_productId: {
        priceBookId: priceBookStandard.id,
        productId: productImplementation.id,
      },
    },
    update: { listPrice: toBigInt(450000) },
    create: {
      priceBookId: priceBookStandard.id,
      productId: productImplementation.id,
      listPrice: toBigInt(450000),
    },
  });

  const quoteAlpha = await ensureRecord(
    db.quote,
    { organizationId: org.id, quoteNumber: 'Q-2026-001' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      quoteNumber: 'Q-2026-001',
      subject: 'Acme multi-team expansion',
      stage: 'Sent',
      validUntil: addDays(15),
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      dealId: dealExpansion.id,
      billingAddress: { city: 'Algiers', country: 'Algeria' },
      shippingAddress: { city: 'Algiers', country: 'Algeria' },
      subTotal: toBigInt(595000),
      discount: toBigInt(45000),
      tax: toBigInt(104500),
      adjustment: toBigInt(0),
      grandTotal: toBigInt(654500),
      termsAndConditions: 'Net 30. Implementation scheduled after signature.',
      description: 'Commercial proposal for licenses and implementation.',
    }
  );

  await ensureLineItem(
    db.quoteLineItem,
    { quoteId: quoteAlpha.id, productId: productCore.id },
    {
      quoteId: quoteAlpha.id,
      productId: productCore.id,
      quantity: 2,
      listPrice: toBigInt(250000),
      discount: toBigInt(25000),
      tax: toBigInt(95000),
      amount: toBigInt(475000),
      total: toBigInt(570000),
      description: 'Core platform license bundle',
      sequence: 1,
    }
  );

  await ensureLineItem(
    db.quoteLineItem,
    { quoteId: quoteAlpha.id, productId: productImplementation.id },
    {
      quoteId: quoteAlpha.id,
      productId: productImplementation.id,
      quantity: 1,
      listPrice: toBigInt(120000),
      discount: toBigInt(20000),
      tax: toBigInt(9500),
      amount: toBigInt(100000),
      total: toBigInt(109500),
      description: 'Implementation onboarding phase',
      sequence: 2,
    }
  );

  const salesOrderAlpha = await ensureRecord(
    db.salesOrder,
    { organizationId: org.id, orderNumber: 'SO-2026-001' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      orderNumber: 'SO-2026-001',
      subject: 'Acme approved rollout order',
      status: 'confirmed',
      dueDate: addDays(20),
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      dealId: dealExpansion.id,
      quoteId: quoteAlpha.id,
      billingAddress: { city: 'Algiers', country: 'Algeria' },
      shippingAddress: { city: 'Algiers', country: 'Algeria' },
      subTotal: toBigInt(595000),
      discount: toBigInt(45000),
      tax: toBigInt(104500),
      adjustment: toBigInt(0),
      grandTotal: toBigInt(654500),
      termsAndConditions: 'Delivery in two deployment waves.',
      description: 'Approved sales order generated from accepted quote.',
    }
  );

  await ensureLineItem(
    db.salesOrderLineItem,
    { salesOrderId: salesOrderAlpha.id, productId: productCore.id },
    {
      salesOrderId: salesOrderAlpha.id,
      productId: productCore.id,
      quantity: 2,
      listPrice: toBigInt(250000),
      discount: toBigInt(25000),
      tax: toBigInt(95000),
      amount: toBigInt(475000),
      total: toBigInt(570000),
      description: 'Core platform license bundle',
      sequence: 1,
    }
  );

  await ensureLineItem(
    db.salesOrderLineItem,
    { salesOrderId: salesOrderAlpha.id, productId: productImplementation.id },
    {
      salesOrderId: salesOrderAlpha.id,
      productId: productImplementation.id,
      quantity: 1,
      listPrice: toBigInt(120000),
      discount: toBigInt(20000),
      tax: toBigInt(9500),
      amount: toBigInt(100000),
      total: toBigInt(109500),
      description: 'Implementation onboarding phase',
      sequence: 2,
    }
  );

  const vendorHardware = await ensureRecord(
    db.vendor,
    { organizationId: org.id, name: 'Sahara Hardware Supply' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      name: 'Sahara Hardware Supply',
      email: 'procurement@sahara.example.com',
      phone: '+213 21 700 700',
      website: 'https://sahara.example.com',
      category: 'Hardware',
      status: 'active',
      description: 'Peripheral supplier for on-site rollout packages.',
      glAccount: '500-OPS-HW',
      billingAddress: { city: 'Algiers', country: 'Algeria' },
      shippingAddress: { city: 'Algiers', country: 'Algeria' },
    }
  );

  const purchaseOrderAlpha = await ensureRecord(
    db.purchaseOrder,
    { organizationId: org.id, orderNumber: 'PO-2026-001' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      orderNumber: 'PO-2026-001',
      subject: 'Acme rollout hardware package',
      status: 'submitted',
      vendorId: vendorHardware.id,
      contactId: contactKarim.id,
      poDate: addDays(-2),
      dueDate: addDays(10),
      billingAddress: { city: 'Algiers', country: 'Algeria' },
      shippingAddress: { city: 'Algiers', country: 'Algeria' },
      subTotal: toBigInt(180000),
      discount: toBigInt(5000),
      tax: toBigInt(33250),
      adjustment: toBigInt(0),
      grandTotal: toBigInt(208250),
      termsAndConditions: 'Deliver before customer onboarding week.',
      description: 'Procurement order supporting deployment hardware.',
    }
  );

  await ensureLineItem(
    db.purchaseOrderLineItem,
    { purchaseOrderId: purchaseOrderAlpha.id, productId: productImplementation.id },
    {
      purchaseOrderId: purchaseOrderAlpha.id,
      productId: productImplementation.id,
      quantity: 1,
      listPrice: toBigInt(180000),
      discount: toBigInt(5000),
      tax: toBigInt(33250),
      amount: toBigInt(175000),
      total: toBigInt(208250),
      description: 'Deployment toolkit services package',
      sequence: 1,
    }
  );

  const invoiceAlpha = await ensureRecord(
    db.invoice,
    { organizationId: org.id, invoiceNumber: 'INV-2026-001' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      invoiceNumber: 'INV-2026-001',
      subject: 'Acme implementation milestone 1',
      status: 'sent',
      salesOrderId: salesOrderAlpha.id,
      invoiceDate: addDays(-1),
      dueDate: addDays(29),
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      dealId: dealExpansion.id,
      billingAddress: { city: 'Algiers', country: 'Algeria' },
      shippingAddress: { city: 'Algiers', country: 'Algeria' },
      subTotal: toBigInt(350000),
      discount: toBigInt(0),
      tax: toBigInt(66500),
      adjustment: toBigInt(0),
      grandTotal: toBigInt(416500),
      termsAndConditions: 'Net 30.',
      description: 'Initial implementation milestone invoice.',
    }
  );

  await ensureLineItem(
    db.invoiceLineItem,
    { invoiceId: invoiceAlpha.id, productId: productImplementation.id },
    {
      invoiceId: invoiceAlpha.id,
      productId: productImplementation.id,
      quantity: 1,
      listPrice: toBigInt(350000),
      discount: toBigInt(0),
      tax: toBigInt(66500),
      amount: toBigInt(350000),
      total: toBigInt(416500),
      description: 'Milestone one delivery and onboarding',
      sequence: 1,
    }
  );

  const caseApi = await ensureRecord(
    db.case,
    { organizationId: org.id, caseNumber: 'CASE-001' },
    {
      organizationId: org.id,
      caseNumber: 'CASE-001',
      subject: 'API integration issue',
      description: 'Customer cannot sync external API data after token rotation.',
      status: 'open',
      priority: 'high',
      type: 'Bug Report',
      caseOrigin: 'Email',
      relatedTo: 'Deal delivery',
      reportedBy: 'Alice Anderson',
      email: contactAlice.email,
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      ownerId: users.support.id,
      productId: productCore.id,
      dealId: dealExpansion.id,
      dueAt: addDays(2),
      escalationLevel: 1,
    }
  );

  await ensureRecord(
    db.case,
    { organizationId: org.id, caseNumber: 'CASE-002' },
    {
      organizationId: org.id,
      caseNumber: 'CASE-002',
      subject: 'Billing clarification request',
      description: 'Customer requested more detail on tax lines and milestone schedule.',
      status: 'pending',
      priority: 'medium',
      type: 'Question',
      caseOrigin: 'Phone',
      relatedTo: 'Invoice review',
      reportedBy: 'Nora Nadir',
      email: contactNora.email,
      accountId: accountNorthwind.id,
      contactId: contactNora.id,
      ownerId: users.support.id,
      dealId: dealNorthwind.id,
      dueAt: addDays(5),
      escalationLevel: 0,
    }
  );

  await ensureRecord(
    db.solution,
    { organizationId: org.id, solutionNumber: 'SOL-001' },
    {
      organizationId: org.id,
      solutionNumber: 'SOL-001',
      title: 'Refresh expired integration credentials',
      status: 'Published',
      question: 'Why does the API sync stop after credential rotation?',
      answer: 'Update the connected application secret, then trigger a workflow re-auth and test sync from the account page.',
      comments: 'Validated by support on Acme rollout workspace.',
      ownerId: users.support.id,
      productId: productCore.id,
      dealId: dealExpansion.id,
    }
  );

  const segmentEnterprise = await ensureRecord(
    db.segment,
    { organizationId: org.id, name: 'Enterprise Prospects' },
    {
      organizationId: org.id,
      name: 'Enterprise Prospects',
      entityType: 'lead',
      description: 'High-value enterprise leads used for campaign targeting.',
      rulesJson: {
        combinator: 'and',
        rules: [
          { field: 'employees', operator: 'greater_than', value: 100 },
          { field: 'score', operator: 'greater_than', value: 70 },
        ],
      },
      isActive: true,
      ownerId: users.marketing.id,
    }
  );

  const templateLaunch = await ensureRecord(
    db.emailTemplate,
    { organizationId: org.id, name: 'Executive Launch Template' },
    {
      organizationId: org.id,
      name: 'Executive Launch Template',
      subject: 'See how DX CRM improves execution visibility',
      htmlContent: '<h1>DX CRM</h1><p>Unified revenue, service, and delivery visibility.</p>',
      textContent: 'Unified revenue, service, and delivery visibility.',
      previewText: 'Executive-ready pipeline and service reporting.',
      isActive: true,
      imageUrls: [],
      designJson: { hero: 'Visibility at every stage' },
    }
  );

  const campaignLaunch = await ensureRecord(
    db.campaign,
    { organizationId: org.id, name: 'Q1 Product Launch Drip' },
    {
      organizationId: org.id,
      name: 'Q1 Product Launch Drip',
      channel: 'email',
      status: 'active',
      budget: toBigInt(800000),
      spent: toBigInt(420000),
      leadsGenerated: 74,
      revenue: toBigInt(5600000),
      startDate: new Date('2026-01-10T00:00:00.000Z'),
      endDate: addDays(20),
      ownerId: users.marketing.id,
      segmentId: segmentEnterprise.id,
      templateId: templateLaunch.id,
      totalRecipients: 2,
      sentCount: 1,
      openCount: 1,
      clickCount: 1,
    }
  );

  await ensureRecord(
    db.campaign,
    { organizationId: org.id, name: 'LinkedIn ABM Outreach' },
    {
      organizationId: org.id,
      name: 'LinkedIn ABM Outreach',
      channel: 'social',
      status: 'active',
      budget: toBigInt(500000),
      spent: toBigInt(210000),
      leadsGenerated: 29,
      revenue: toBigInt(1900000),
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      endDate: addDays(30),
      ownerId: users.marketing.id,
      segmentId: segmentEnterprise.id,
      totalRecipients: 1,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
    }
  );

  await ensureRecord(
    db.campaignRecipient,
    { campaignId: campaignLaunch.id, recipientType: 'lead', recipientId: leadDave.id },
    {
      organizationId: org.id,
      campaignId: campaignLaunch.id,
      recipientType: 'lead',
      recipientId: leadDave.id,
      email: leadDave.email,
      firstName: leadDave.firstName,
      lastName: leadDave.lastName,
      company: leadDave.company,
      status: 'sent',
      sentAt: addDays(-1),
      processedAt: addDays(-1),
      retryCount: 0,
    }
  );

  await ensureRecord(
    db.campaignRecipient,
    { campaignId: campaignLaunch.id, recipientType: 'lead', recipientId: leadFatima.id },
    {
      organizationId: org.id,
      campaignId: campaignLaunch.id,
      recipientType: 'lead',
      recipientId: leadFatima.id,
      email: leadFatima.email,
      firstName: leadFatima.firstName,
      lastName: leadFatima.lastName,
      company: leadFatima.company,
      status: 'pending',
      retryCount: 0,
    }
  );

  const emailLog = await ensureRecord(
    db.emailLog,
    { organizationId: org.id, recipientEmail: leadDave.email, subject: templateLaunch.subject },
    {
      organizationId: org.id,
      campaignId: campaignLaunch.id,
      templateId: templateLaunch.id,
      recipientEmail: leadDave.email,
      recipientName: `${leadDave.firstName} ${leadDave.lastName}`,
      subject: templateLaunch.subject,
      status: 'sent',
      messageId: 'msg-demo-001',
      sentAt: addDays(-1),
      openedAt: addDays(-1),
      clickedAt: addDays(-1),
      clickCount: 1,
      openCount: 1,
      previewText: templateLaunch.previewText,
      recipientId: leadDave.id,
      recipientType: 'lead',
      trackingToken: 'trk-demo-001',
      unsubscribeToken: 'unsub-demo-001',
    }
  );

  await prisma.emailBlacklist.upsert({
    where: {
      organizationId_email: {
        organizationId: org.id,
        email: 'optout@example.com',
      },
    },
    update: {
      reason: 'Requested removal from marketing emails',
      source: 'manual',
      createdById: users.marketing.id,
    },
    create: {
      organizationId: org.id,
      email: 'optout@example.com',
      reason: 'Requested removal from marketing emails',
      source: 'manual',
      createdById: users.marketing.id,
    },
  });

  await ensureRecord(
    db.unsubscribeEvent,
    { organizationId: org.id, email: 'optout@example.com', source: 'unsubscribe_link' },
    {
      organizationId: org.id,
      email: 'optout@example.com',
      emailLogId: emailLog.id,
      reason: 'No longer relevant',
      source: 'unsubscribe_link',
      token: 'unsub-demo-001',
    }
  );

  await prisma.customFieldDefinition.upsert({
    where: {
      organizationId_entityType_key: {
        organizationId: org.id,
        entityType: 'lead',
        key: 'territory',
      },
    },
    update: {
      label: 'Territory',
      fieldType: 'text',
      isRequired: false,
      isActive: true,
    },
    create: {
      organizationId: org.id,
      entityType: 'lead',
      key: 'territory',
      label: 'Territory',
      fieldType: 'text',
      isRequired: false,
      isActive: true,
    },
  });

  await prisma.forecastConfig.upsert({
    where: { organizationId: org.id },
    update: {
      model: 'bottom_up',
      hierarchyType: 'roles',
      metric: 'revenue',
      fiscalStartMonth: 1,
      fiscalYearType: 'standard',
    },
    create: {
      organizationId: org.id,
      model: 'bottom_up',
      hierarchyType: 'roles',
      metric: 'revenue',
      fiscalStartMonth: 1,
      fiscalYearType: 'standard',
    },
  });

  const forecast = await ensureRecord(
    db.forecast,
    { organizationId: org.id, name: 'FY2026 Revenue Plan' },
    {
      organizationId: org.id,
      name: 'FY2026 Revenue Plan',
      type: 'revenue',
      period: 'quarterly',
      year: 2026,
      basedOn: 'all_deals',
      isActive: true,
    }
  );

  await ensureRecord(
    db.forecastTarget,
    { organizationId: org.id, forecastId: forecast.id, isCompanyTarget: true },
    {
      organizationId: org.id,
      forecastId: forecast.id,
      targetValue: toBigInt(25000000),
      isCompanyTarget: true,
    }
  );

  await ensureRecord(
    db.forecastTarget,
    { organizationId: org.id, forecastId: forecast.id, roleId: roles['sales-manager'].id },
    {
      organizationId: org.id,
      forecastId: forecast.id,
      targetValue: toBigInt(12000000),
      roleId: roles['sales-manager'].id,
      isCompanyTarget: false,
    }
  );

  await ensureRecord(
    db.forecastTarget,
    { organizationId: org.id, forecastId: forecast.id, userId: users.salesRep.id },
    {
      organizationId: org.id,
      forecastId: forecast.id,
      targetValue: toBigInt(4500000),
      userId: users.salesRep.id,
      isCompanyTarget: false,
    }
  );

  await ensureRecord(
    db.forecastGoal,
    { organizationId: org.id, ownerId: users.executive.id, category: 'revenue' },
    {
      organizationId: org.id,
      ownerId: users.executive.id,
      category: 'revenue',
      targetValue: toBigInt(25000000),
      currentValue: toBigInt(10400000),
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T00:00:00.000Z'),
      status: 'active',
    }
  );

  const sharedFolder = await ensureRecord(
    db.documentFolder,
    { organizationId: org.id, name: 'Shared Contracts' },
    {
      organizationId: org.id,
      name: 'Shared Contracts',
      description: 'Commercial and legal documents shared with the team.',
      isTeamFolder: true,
      ownerId: users.admin.id,
    }
  );

  await ensureRecord(
    db.document,
    { organizationId: org.id, name: 'Acme Master Services Agreement' },
    {
      organizationId: org.id,
      name: 'Acme Master Services Agreement',
      description: 'Signed MSA for the Acme expansion deal.',
      type: 'application/pdf',
      url: '/uploads/demo/acme-msa.pdf',
      sizeBytes: 248000,
      extension: 'pdf',
      folderId: sharedFolder.id,
      ownerId: users.salesManager.id,
      recordType: 'deal',
      recordId: dealExpansion.id,
    }
  );

  await ensureRecord(
    db.document,
    { organizationId: org.id, name: 'Northwind Implementation Scope' },
    {
      organizationId: org.id,
      name: 'Northwind Implementation Scope',
      description: 'Draft statement of work for pilot delivery.',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '/uploads/demo/northwind-sow.docx',
      sizeBytes: 128000,
      extension: 'docx',
      folderId: sharedFolder.id,
      ownerId: users.salesRep.id,
      recordType: 'project',
      recordId: dealNorthwind.id,
    }
  );

  await ensureRecord(
    db.report,
    { organizationId: org.id, name: 'Executive Pipeline Overview' },
    {
      organizationId: org.id,
      name: 'Executive Pipeline Overview',
      folder: 'Executive',
      config: {
        chart: 'funnel',
        source: 'deals',
        metrics: ['value', 'probability'],
      },
    }
  );

  await ensureRecord(
    db.report,
    { organizationId: org.id, name: 'Support SLA Snapshot' },
    {
      organizationId: org.id,
      name: 'Support SLA Snapshot',
      folder: 'Support',
      config: {
        chart: 'bar',
        source: 'cases',
        metrics: ['open', 'pending', 'resolved'],
      },
    }
  );

  await ensureRecord(
    db.project,
    { organizationId: org.id, name: 'Acme Rollout Phase 2' },
    {
      organizationId: org.id,
      ownerId: users.salesManager.id,
      name: 'Acme Rollout Phase 2',
      status: 'in_progress',
      startDate: addDays(-10),
      endDate: addDays(45),
      budget: toBigInt(1600000),
      revenue: toBigInt(2200000),
      description: 'Expanded rollout covering support and service operations.',
      accountId: accountAcme.id,
      contactId: contactAlice.id,
      dealId: dealExpansion.id,
    }
  );

  await ensureRecord(
    db.project,
    { organizationId: org.id, name: 'Northwind Pilot Launch' },
    {
      organizationId: org.id,
      ownerId: users.salesRep.id,
      name: 'Northwind Pilot Launch',
      status: 'planning',
      startDate: addDays(5),
      endDate: addDays(60),
      budget: toBigInt(900000),
      revenue: toBigInt(1300000),
      description: 'Pilot implementation for care coordination workflows.',
      accountId: accountNorthwind.id,
      contactId: contactNora.id,
      dealId: dealNorthwind.id,
    }
  );

  await ensureRecord(
    db.service,
    { organizationId: org.id, name: 'Onboarding Workshop' },
    {
      organizationId: org.id,
      name: 'Onboarding Workshop',
      price: toBigInt(120000),
      duration: '2 days',
      location: 'Customer site',
      description: 'Kickoff workshop for admins and team leads.',
      isActive: true,
    }
  );

  await ensureRecord(
    db.service,
    { organizationId: org.id, name: 'Data Migration Sprint' },
    {
      organizationId: org.id,
      name: 'Data Migration Sprint',
      price: toBigInt(250000),
      duration: '1 week',
      location: 'Remote',
      description: 'Structured data mapping and import execution.',
      isActive: true,
    }
  );

  await ensureRecord(
    db.feedback,
    { organizationId: org.id, customerName: 'Alice Anderson', source: 'email' },
    {
      organizationId: org.id,
      contactId: contactAlice.id,
      customerName: 'Alice Anderson',
      rating: 5,
      comment: 'Implementation team was responsive and the project dashboard is clear.',
      source: 'email',
      sentiment: 'positive',
    }
  );

  await ensureRecord(
    db.feedback,
    { organizationId: org.id, customerName: 'Nora Nadir', source: 'survey' },
    {
      organizationId: org.id,
      contactId: contactNora.id,
      customerName: 'Nora Nadir',
      rating: 4,
      comment: 'The campaign reporting is strong, but we need more billing clarity.',
      source: 'survey',
      sentiment: 'mixed',
    }
  );

  await ensureRecord(
    db.request,
    { organizationId: org.id, userId: users.salesRep.id, title: 'Need campaign landing page assets' },
    {
      organizationId: org.id,
      userId: users.salesRep.id,
      title: 'Need campaign landing page assets',
      type: 'marketing_support',
      status: 'pending',
      priority: 'medium',
      description: 'Requesting updated visuals for the Northwind proposal follow-up.',
    }
  );

  await ensureRecord(
    db.request,
    { organizationId: org.id, userId: users.support.id, title: 'Increase upload limit for support attachments' },
    {
      organizationId: org.id,
      userId: users.support.id,
      title: 'Increase upload limit for support attachments',
      type: 'system_change',
      status: 'in_review',
      priority: 'high',
      description: 'Need larger files for customer log bundles and screenshots.',
    }
  );

  const notificationSpecs = [
    { userId: users.admin.id, type: 'system', title: 'Seed completed', message: 'The demo workspace data set is ready for review.', actionUrl: '/home' },
    { userId: users.salesManager.id, type: 'deal_update', title: 'Acme deal is in negotiation', message: 'Commercial terms are ready for executive review.', actionUrl: '/deals' },
    { userId: users.salesRep.id, type: 'task_due', title: 'Northwind discovery call tomorrow', message: 'Prepare the discovery checklist before the call.', actionUrl: '/activities/calls' },
    { userId: users.marketing.id, type: 'campaign', title: 'Launch campaign is active', message: 'The Q1 campaign has active recipients and tracking.', actionUrl: '/campaigns' },
    { userId: users.support.id, type: 'case_escalated', title: 'API integration issue needs review', message: 'CASE-001 is still open and due in 2 days.', actionUrl: '/support/cases' },
    { userId: users.executive.id, type: 'forecast', title: 'FY2026 forecast updated', message: 'Revenue target progress is available in forecasts.', actionUrl: '/forecasts' },
  ];

  for (const notification of notificationSpecs) {
    await ensureRecord(
      db.notification,
      { organizationId: org.id, userId: notification.userId, title: notification.title },
      {
        organizationId: org.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        read: false,
      }
    );
  }

  const workflowFollowup = await ensureRecord(
    db.workflow,
    { organizationId: org.id, name: 'Lead Follow-up Escalation' },
    {
      organizationId: org.id,
      name: 'Lead Follow-up Escalation',
      description: 'Escalate stale leads by increasing score and creating a reminder activity.',
      triggerType: 'manual',
      targetModule: 'leads',
      conditionJson: { status: ['new', 'contacted'] },
      actionJson: {
        leadScoreIncrement: 10,
        createActivity: true,
      },
      isActive: true,
      ownerId: users.salesManager.id,
    }
  );

  const workflowRenewal = await ensureRecord(
    db.workflow,
    { organizationId: org.id, name: 'Renewal Reminder' },
    {
      organizationId: org.id,
      name: 'Renewal Reminder',
      description: 'Create reminder notifications for deals nearing close date.',
      triggerType: 'scheduled',
      targetModule: 'deals',
      conditionJson: { daysBeforeClose: 14 },
      actionJson: {
        notifyOwner: true,
        createActivity: true,
      },
      isActive: true,
      ownerId: users.admin.id,
    }
  );

  await ensureRecord(
    db.workflowExecution,
    { organizationId: org.id, workflowId: workflowFollowup.id, targetId: leadCarol.id },
    {
      organizationId: org.id,
      workflowId: workflowFollowup.id,
      targetId: leadCarol.id,
      status: 'success',
      message: 'Lead score increased and reminder activity scheduled.',
      executedById: users.admin.id,
    }
  );

  await ensureRecord(
    db.workflowExecution,
    { organizationId: org.id, workflowId: workflowRenewal.id, targetId: dealExpansion.id },
    {
      organizationId: org.id,
      workflowId: workflowRenewal.id,
      targetId: dealExpansion.id,
      status: 'success',
      message: 'Renewal reminder created for deal owner.',
      executedById: users.admin.id,
    }
  );

  console.log('Core CRM data ready');
  console.log('Database seed completed successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('Admin: admin@dx.local / admin123');
  console.log('Sales Manager: sales@dx.local / sales123');
  console.log('Sales Rep: rep@dx.local / rep123');
  console.log('Marketing: marketing@dx.local / marketing123');
  console.log('Support: support@dx.local / support123');
  console.log('Executive: executive@dx.local / executive123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const permissions = [
        // Leads
        { group: 'Sales', resource: 'leads', action: 'read', name: 'Read Leads', description: 'Can view leads' },
        { group: 'Sales', resource: 'leads', action: 'create', name: 'Create Leads', description: 'Can create new leads' },
        { group: 'Sales', resource: 'leads', action: 'update', name: 'Update Leads', description: 'Can edit existing leads' },
        { group: 'Sales', resource: 'leads', action: 'delete', name: 'Delete Leads', description: 'Can delete leads' },
        // Contacts
        { group: 'Sales', resource: 'contacts', action: 'read', name: 'Read Contacts', description: 'Can view contacts' },
        { group: 'Sales', resource: 'contacts', action: 'create', name: 'Create Contacts', description: 'Can create new contacts' },
        { group: 'Sales', resource: 'contacts', action: 'update', name: 'Update Contacts', description: 'Can edit existing contacts' },
        { group: 'Sales', resource: 'contacts', action: 'delete', name: 'Delete Contacts', description: 'Can delete contacts' },
        // Accounts
        { group: 'Sales', resource: 'accounts', action: 'read', name: 'Read Accounts', description: 'Can view accounts' },
        { group: 'Sales', resource: 'accounts', action: 'create', name: 'Create Accounts', description: 'Can create new accounts' },
        { group: 'Sales', resource: 'accounts', action: 'update', name: 'Update Accounts', description: 'Can edit existing accounts' },
        { group: 'Sales', resource: 'accounts', action: 'delete', name: 'Delete Accounts', description: 'Can delete accounts' },
        // Deals
        { group: 'Sales', resource: 'deals', action: 'read', name: 'Read Deals', description: 'Can view deals' },
        { group: 'Sales', resource: 'deals', action: 'create', name: 'Create Deals', description: 'Can create new deals' },
        { group: 'Sales', resource: 'deals', action: 'update', name: 'Update Deals', description: 'Can edit existing deals' },
        { group: 'Sales', resource: 'deals', action: 'delete', name: 'Delete Deals', description: 'Can delete deals' },
        // Forecasts
        { group: 'Management', resource: 'forecasts', action: 'read', name: 'Read Forecasts', description: 'Can view forecasts' },
        { group: 'Management', resource: 'forecasts', action: 'create', name: 'Manage Forecasts', description: 'Can configure forecasts' },
    ];

    console.log('Seeding permissions...');

    for (const perm of permissions) {
        // Note: Schema says @@unique([organizationId, resource, action])
        // But org permissions API currently fetches all permissions.
        // Let's check schema again.
        // Line 108: @@unique([organizationId, resource, action])
        // This means permissions are TENANT SPECIFIC in the schema.
        // But the API route searches for all.
    }
}

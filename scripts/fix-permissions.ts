import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding missing permissions...');

    // Get the default organization
    const org = await prisma.organization.findFirst({
        where: { slug: 'default-org' }
    });

    if (!org) {
        console.error('Default organization not found');
        return;
    }

    const resources = ['forecasts', 'documents'];
    const actions = ['read', 'create', 'edit', 'delete'];

    const adminRoleId = org.id + '-admin';
    const salesManagerRoleId = org.id + '-sales-manager';

    for (const resource of resources) {
        for (const action of actions) {
            // 1. Upsert Permission
            const permission = await prisma.permission.upsert({
                where: {
                    organizationId_resource_action: {
                        organizationId: org.id,
                        resource,
                        action,
                    },
                },
                update: {},
                create: {
                    organizationId: org.id,
                    resource,
                    action,
                },
            });

            console.log(`Permission ensured: ${resource}:${action}`);

            // 2. Assign to Admin
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRoleId,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRoleId,
                    permissionId: permission.id,
                },
            });

            // 3. Assign to Sales Manager
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: salesManagerRoleId,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: salesManagerRoleId,
                    permissionId: permission.id,
                },
            });
        }
    }

    console.log('Permissions assigned successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

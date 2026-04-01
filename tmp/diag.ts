import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const orgs = await prisma.organization.findMany();
        console.log('Organizations:', JSON.stringify(orgs, null, 2));

        const users = await prisma.user.findMany({ include: { role: true } });
        console.log('Users:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role?.name })), null, 2));

        const permissions = await prisma.permission.findMany();
        console.log('Permissions Count:', permissions.length);
        if (permissions.length > 0) {
            console.log('First 5 Permissions:', JSON.stringify(permissions.slice(0, 5), null, 2));
        }

        const roles = await prisma.role.findMany({ include: { _count: { select: { users: true } } } });
        console.log('Roles:', JSON.stringify(roles.map(r => ({ id: r.id, name: r.name, userCount: r._count.users })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

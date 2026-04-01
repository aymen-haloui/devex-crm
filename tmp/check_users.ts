import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            isActive: true,
            password: true,
        }
    });

    console.log('Total users:', users.length);
    for (const user of users) {
        const isMatch = await bcrypt.compare('admin123', user.password);
        console.log(`User: ${user.email}, Active: ${user.isActive}, Password 'admin123' match: ${isMatch}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

import { PrismaClient } from '../lib/generated-prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    const firstUser = await prisma.user.findFirst();
    console.log('First user email:', firstUser?.email || 'No users found');
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

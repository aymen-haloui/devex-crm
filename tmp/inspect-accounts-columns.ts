import { PrismaClient } from '../lib/generated-prisma';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts' ORDER BY ordinal_position"
  );

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
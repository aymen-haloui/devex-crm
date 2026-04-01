import { PrismaClient } from '../lib/generated-prisma';

const prisma = new PrismaClient();

const modelNames = [
  'account',
  'contact',
  'lead',
  'deal',
  'activity',
  'campaign',
  'case',
  'solution',
  'product',
  'priceBook',
  'vendor',
  'purchaseOrder',
  'quote',
  'salesOrder',
  'invoice',
  'workflow',
  'workflowExecution',
  'project',
  'service',
  'feedback',
  'notification',
  'report',
  'forecast',
  'request',
  'document',
] as const;

async function main() {
  for (const modelName of modelNames) {
    const count = await (prisma as any)[modelName].count();
    console.log(`${modelName}:${count}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.productImage.deleteMany();
  console.log("Deleted old images");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

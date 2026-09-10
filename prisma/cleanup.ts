import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  
  for (const p of products) {
    if (!['riz', 'huile', 'sucre'].includes(p.name.toLowerCase().trim()) && !p.name.toLowerCase().includes('riz en détail')) {
      console.log(`Deleting product: ${p.name}`);
      await prisma.priceObservation.deleteMany({ where: { productFormat: { productId: p.id } } });
      await prisma.productFormat.deleteMany({ where: { productId: p.id } });
      await prisma.product.delete({ where: { id: p.id } });
    }
  }
  console.log("Cleanup completed.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

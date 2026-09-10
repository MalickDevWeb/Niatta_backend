import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find categories with no icon
  const categoriesWithoutIcon = await prisma.category.findMany({
    where: {
      OR: [
        { icon: null },
        { icon: '' }
      ]
    },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log(`Found ${categoriesWithoutIcon.length} categories without an icon.`);
  
  let deletedCount = 0;
  for (const cat of categoriesWithoutIcon) {
    if (cat._count.products > 0) {
      console.log(`Cannot delete category '${cat.name}' because it has ${cat._count.products} products.`);
    } else {
      await prisma.category.delete({
        where: { id: cat.id }
      });
      console.log(`Deleted category '${cat.name}'`);
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

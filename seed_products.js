const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  
  // Create or get categories
  const categories = [
    { name: 'Céréales', slug: 'cereales', icon: 'fluent-emoji-flat:sheaf-of-rice' },
    { name: 'Épicerie', slug: 'epicerie', icon: 'fluent-emoji-flat:salt' },
    { name: 'Produits laitiers', slug: 'laitiers', icon: 'fluent-emoji-flat:glass-of-milk' },
    { name: 'Légumes', slug: 'legumes', icon: 'fluent-emoji-flat:onion' },
    { name: 'Viandes', slug: 'viandes', icon: 'fluent-emoji-flat:cut-of-meat' },
    { name: 'Boulangerie', slug: 'boulangerie', icon: 'fluent-emoji-flat:baguette-bread' }
  ];

  const catMap = {};
  for (const cat of categories) {
    let existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await prisma.category.create({ data: cat });
    }
    catMap[cat.slug] = existing;
  }

  // Create products
  const products = [
    { name: 'Riz brisé ordinaire', slug: 'riz-brise-ordinaire', unit: 'kg', icon: 'fluent-emoji-flat:bowl-with-spoon', categoryId: catMap['cereales'].id },
    { name: 'Sucre cristallisé', slug: 'sucre-cristallise', unit: 'kg', icon: 'fluent-emoji-flat:ice', categoryId: catMap['epicerie'].id },
    { name: 'Huile végétale', slug: 'huile-vegetale', unit: 'litre', icon: 'fluent-emoji-flat:drop-of-blood', categoryId: catMap['epicerie'].id },
    { name: 'Lait en poudre', slug: 'lait-poudre', unit: 'kg', icon: 'fluent-emoji-flat:glass-of-milk', categoryId: catMap['laitiers'].id },
    { name: 'Farine de blé', slug: 'farine-ble', unit: 'kg', icon: 'fluent-emoji-flat:ear-of-corn', categoryId: catMap['cereales'].id },
    { name: 'Oignon local', slug: 'oignon', unit: 'kg', icon: 'fluent-emoji-flat:onion', categoryId: catMap['legumes'].id },
    { name: 'Pomme de terre', slug: 'pomme-de-terre', unit: 'kg', icon: 'fluent-emoji-flat:potato', categoryId: catMap['legumes'].id },
    { name: 'Viande de boeuf', slug: 'viande-boeuf', unit: 'kg', icon: 'fluent-emoji-flat:cut-of-meat', categoryId: catMap['viandes'].id },
    { name: 'Baguette de pain', slug: 'baguette', unit: 'pièce', icon: 'fluent-emoji-flat:baguette-bread', categoryId: catMap['boulangerie'].id }
  ];

  for (const p of products) {
    let existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log('Seeding done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

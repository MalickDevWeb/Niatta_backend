const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  
  const categories = [
    { name: 'Ndeki', slug: 'ndeki', icon: 'fluent-emoji-flat:glass-of-milk' },
    { name: 'Agne', slug: 'agne', icon: 'fluent-emoji-flat:bowl-with-spoon' },
    { name: 'Marché', slug: 'marche', icon: 'fluent-emoji-flat:cut-of-meat' },
    { name: 'Saf-Safal', slug: 'saf-safal', icon: 'fluent-emoji-flat:salt' }
  ];

  const catMap = {};
  for (const cat of categories) {
    let existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      existing = await prisma.category.create({ data: cat });
    }
    catMap[cat.slug] = existing;
  }

  // Define products with tags and formats
  const products = [
    // NDEKI
    { name: 'Café', slug: 'cafe', icon: 'fluent-emoji-flat:hot-beverage', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Boissons'], formats: [
      { label: 'Sachet 25g', unit: 'sachet', weight: '25g', officialPriceCap: 50 },
      { label: 'Boîte 200g', unit: 'boîte', weight: '200g', officialPriceCap: null }
    ]},
    { name: 'Lait', slug: 'lait', icon: 'fluent-emoji-flat:glass-of-milk', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Boissons', 'Produits laitiers'], formats: [
      { label: 'Sachet 400g', unit: 'sachet', weight: '400g', officialPriceCap: 1500 },
      { label: 'Sachet 1kg', unit: 'sachet', weight: '1kg', officialPriceCap: 3500 },
      { label: 'Brique 1L', unit: 'litre', weight: '1L', officialPriceCap: null }
    ]},
    { name: 'Beurre', slug: 'beurre', icon: 'fluent-emoji-flat:butter', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Produit de base'], formats: [
      { label: 'Plaquette 200g', unit: 'pièce', weight: '200g', officialPriceCap: null }
    ]},
    { name: 'Sucre', slug: 'sucre', icon: 'fluent-emoji-flat:ice', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Produit de base'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: 650 },
      { label: 'Morceaux (Boîte)', unit: 'boîte', weight: '1kg', officialPriceCap: 800 }
    ]},
    { name: 'Pain', slug: 'pain', icon: 'fluent-emoji-flat:baguette-bread', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Boulangerie'], formats: [
      { label: 'Baguette standard', unit: 'pièce', weight: '190g', officialPriceCap: 175 }
    ]},
    { name: 'Biscuits', slug: 'biscuits', icon: 'fluent-emoji-flat:cookie', categoryId: catMap['ndeki'].id, tags: ['Petit-déjeuner', 'Goûter'], formats: [
      { label: 'Paquet', unit: 'paquet', weight: '100g', officialPriceCap: null }
    ]},

    // AGNE
    { name: 'Riz', slug: 'riz', icon: 'fluent-emoji-flat:bowl-with-spoon', categoryId: catMap['agne'].id, tags: ['Déjeuner', 'Produit de base', 'Céréales'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: 400 },
      { label: '5 kg', unit: 'sac', weight: '5kg', officialPriceCap: null },
      { label: '25 kg', unit: 'sac', weight: '25kg', officialPriceCap: null },
      { label: '50 kg', unit: 'sac', weight: '50kg', officialPriceCap: null }
    ]},
    { name: 'Huile', slug: 'huile', icon: 'fluent-emoji-flat:drop-of-blood', categoryId: catMap['agne'].id, tags: ['Déjeuner', 'Produit de base'], formats: [
      { label: '1 L', unit: 'litre', weight: '1L', officialPriceCap: 1000 },
      { label: '5 L', unit: 'bidon', weight: '5L', officialPriceCap: 4900 },
      { label: '10 L', unit: 'bidon', weight: '10L', officialPriceCap: null },
      { label: '20 L', unit: 'bidon', weight: '20L', officialPriceCap: null }
    ]},
    { name: 'Farine', slug: 'farine', icon: 'fluent-emoji-flat:ear-of-corn', categoryId: catMap['agne'].id, tags: ['Produit de base', 'Céréales'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Mil', slug: 'mil', icon: 'fluent-emoji-flat:sheaf-of-rice', categoryId: catMap['agne'].id, tags: ['Produit de base', 'Céréales'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Maïs', slug: 'mais', icon: 'fluent-emoji-flat:ear-of-corn', categoryId: catMap['agne'].id, tags: ['Produit de base', 'Céréales'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Pâtes', slug: 'pates', icon: 'fluent-emoji-flat:spaghetti', categoryId: catMap['agne'].id, tags: ['Déjeuner', 'Dîner'], formats: [
      { label: 'Sachet 500g', unit: 'sachet', weight: '500g', officialPriceCap: null }
    ]},

    // MARCHÉ
    { name: 'Viande', slug: 'viande', icon: 'fluent-emoji-flat:cut-of-meat', categoryId: catMap['marche'].id, tags: ['Frais', 'Protéines'], formats: [
      { label: 'Boeuf (1 kg)', unit: 'kg', weight: '1kg', officialPriceCap: 3500 },
      { label: 'Mouton (1 kg)', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Poisson', slug: 'poisson', icon: 'fluent-emoji-flat:fish', categoryId: catMap['marche'].id, tags: ['Frais', 'Protéines'], formats: [
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: null },
      { label: '5 kg', unit: 'carton', weight: '5kg', officialPriceCap: null },
      { label: 'Unité', unit: 'pièce', weight: null, officialPriceCap: null }
    ]},
    { name: 'Légumes', slug: 'legumes', icon: 'fluent-emoji-flat:onion', categoryId: catMap['marche'].id, tags: ['Frais', 'Végétal'], formats: [
      { label: 'Oignon (1 kg)', unit: 'kg', weight: '1kg', officialPriceCap: null },
      { label: 'Pomme de terre (1 kg)', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Fruits', slug: 'fruits', icon: 'fluent-emoji-flat:banana', categoryId: catMap['marche'].id, tags: ['Frais', 'Végétal'], formats: [
      { label: 'Banane (1 kg)', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},

    // SAF-SAFAL
    { name: 'Jumbo', slug: 'jumbo', icon: 'fluent-emoji-flat:salt', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Épices'], formats: [
      { label: '1 sachet', unit: 'sachet', weight: null, officialPriceCap: null },
      { label: 'Paquet', unit: 'paquet', weight: null, officialPriceCap: null },
      { label: 'Carton', unit: 'carton', weight: null, officialPriceCap: null }
    ]},
    { name: 'Maggi', slug: 'maggi', icon: 'fluent-emoji-flat:salt', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Épices'], formats: [
      { label: 'Tablette', unit: 'pièce', weight: null, officialPriceCap: null },
      { label: 'Paquet', unit: 'paquet', weight: null, officialPriceCap: null }
    ]},
    { name: 'Ail', slug: 'ail', icon: 'fluent-emoji-flat:garlic', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Frais'], formats: [
      { label: '100 g', unit: 'g', weight: '100g', officialPriceCap: null },
      { label: '250 g', unit: 'g', weight: '250g', officialPriceCap: null },
      { label: '500 g', unit: 'g', weight: '500g', officialPriceCap: null },
      { label: '1 kg', unit: 'kg', weight: '1kg', officialPriceCap: null }
    ]},
    { name: 'Poivre', slug: 'poivre', icon: 'fluent-emoji-flat:salt', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Épices'], formats: [
      { label: '100 g', unit: 'g', weight: '100g', officialPriceCap: null },
      { label: 'Sachet', unit: 'sachet', weight: null, officialPriceCap: null }
    ]},
    { name: 'Piment', slug: 'piment', icon: 'fluent-emoji-flat:hot-pepper', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Épices', 'Frais'], formats: [
      { label: 'Frais (100 g)', unit: 'g', weight: '100g', officialPriceCap: null },
      { label: 'En poudre (Sachet)', unit: 'sachet', weight: null, officialPriceCap: null }
    ]},
    { name: 'Épices', slug: 'epices', icon: 'fluent-emoji-flat:salt', categoryId: catMap['saf-safal'].id, tags: ['Condiments', 'Épices'], formats: [
      { label: 'Mélange (Sachet)', unit: 'sachet', weight: null, officialPriceCap: null }
    ]}
  ];

  for (const p of products) {
    let existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    
    const productData = {
      name: p.name,
      slug: p.slug,
      icon: p.icon,
      categoryId: p.categoryId,
      tags: p.tags || []
    };

    if (!existing) {
      existing = await prisma.product.create({ data: productData });
    } else {
      existing = await prisma.product.update({ where: { id: existing.id }, data: productData });
    }

    // Upsert formats
    if (p.formats) {
      for (const format of p.formats) {
        await prisma.productFormat.upsert({
          where: { productId_label: { productId: existing.id, label: format.label } },
          update: { ...format },
          create: { ...format, productId: existing.id }
        });
      }
    }
  }

  console.log('Seeding done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

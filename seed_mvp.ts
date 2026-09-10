import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(basePrice: number) {
  const noise = (Math.random() * 0.15) - 0.05;
  let price = basePrice * (1 + noise);
  return Math.round(price / 25) * 25;
}

const MVP_DATA = [
  {
    name: 'Ndeki',
    icon: 'fluent-emoji-flat:bread',
    products: [
      { name: 'Beurre', icon: 'fluent-emoji-flat:butter', tags: ['Petit-déjeuner'], formats: [{ label: '200g', unit: 'g', officialPriceCap: 1200 }] },
      { name: 'Café', icon: 'fluent-emoji-flat:hot-beverage', tags: ['Petit-déjeuner'], formats: [{ label: '50g', unit: 'g', officialPriceCap: 500 }, { label: '250g', unit: 'g', officialPriceCap: 1500 }] },
      { name: 'Lait', icon: 'fluent-emoji-flat:glass-of-milk', tags: ['Petit-déjeuner', 'Produit de base'], formats: [{ label: '400g (poudre)', unit: 'g', officialPriceCap: 1500 }, { label: '1 kg (poudre)', unit: 'kg', officialPriceCap: 3000 }] },
      { name: 'Sucre', icon: 'fluent-emoji-flat:ice', tags: ['Petit-déjeuner', 'Produit de base'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 600 }, { label: '5 kg', unit: 'kg', officialPriceCap: 3000 }] },
      { name: 'Pain', icon: 'fluent-emoji-flat:baguette-bread', tags: ['Petit-déjeuner'], formats: [{ label: 'Baguette', unit: 'pièce', officialPriceCap: 160 }] },
      { name: 'Biscuits', icon: 'fluent-emoji-flat:cookie', tags: ['Petit-déjeuner', 'Snack'], formats: [{ label: 'Paquet', unit: 'paquet', officialPriceCap: 100 }] },
    ]
  },
  {
    name: 'Agne',
    icon: 'fluent-emoji-flat:pot-of-food',
    products: [
      { name: 'Riz', icon: 'fluent-emoji-flat:bowl-with-spoon', tags: ['Déjeuner', 'Produit de base'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 410 }, { label: '5 kg', unit: 'kg', officialPriceCap: 2050 }, { label: '25 kg', unit: 'kg', officialPriceCap: 10250 }, { label: '50 kg', unit: 'kg', officialPriceCap: 20500 }] },
      { name: 'Huile', icon: 'fluent-emoji-flat:drop-of-blood', tags: ['Déjeuner', 'Produit de base'], formats: [{ label: '1 L', unit: 'L', officialPriceCap: 1000 }, { label: '5 L', unit: 'L', officialPriceCap: 5000 }, { label: '10 L', unit: 'L', officialPriceCap: 10000 }, { label: '20 L', unit: 'L', officialPriceCap: 20000 }] },
      { name: 'Farine', icon: 'fluent-emoji-flat:ear-of-corn', tags: ['Déjeuner', 'Produit de base'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 400 }, { label: '5 kg', unit: 'kg', officialPriceCap: 2000 }] },
      { name: 'Mil', icon: 'fluent-emoji-flat:ear-of-corn', tags: ['Déjeuner', 'Céréales'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 350 }] },
      { name: 'Maïs', icon: 'fluent-emoji-flat:ear-of-corn', tags: ['Déjeuner', 'Céréales'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 350 }] },
      { name: 'Pâtes', icon: 'fluent-emoji-flat:spaghetti', tags: ['Déjeuner'], formats: [{ label: '250 g', unit: 'g', officialPriceCap: 250 }, { label: '500 g', unit: 'g', officialPriceCap: 500 }] },
    ]
  },
  {
    name: 'Marché',
    icon: 'fluent-emoji-flat:cut-of-meat',
    products: [
      { name: 'Viande', icon: 'fluent-emoji-flat:cut-of-meat', tags: ['Frais', 'Protéines'], formats: [{ label: '1 kg (Bœuf)', unit: 'kg', officialPriceCap: 4000 }, { label: '1 kg (Mouton)', unit: 'kg', officialPriceCap: 4500 }] },
      { name: 'Poisson', icon: 'fluent-emoji-flat:fish', tags: ['Frais', 'Protéines'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 1500 }, { label: '5 kg', unit: 'kg', officialPriceCap: 7000 }, { label: 'Unité (Moyen)', unit: 'pièce', officialPriceCap: 500 }] },
      { name: 'Légumes', icon: 'fluent-emoji-flat:leafy-green', tags: ['Frais'], formats: [{ label: '1 kg (Mixte)', unit: 'kg', officialPriceCap: 800 }] },
      { name: 'Fruits', icon: 'fluent-emoji-flat:red-apple', tags: ['Frais'], formats: [{ label: '1 kg', unit: 'kg', officialPriceCap: 1000 }] },
    ]
  },
  {
    name: 'Saf-Safal',
    icon: 'fluent-emoji-flat:salt',
    products: [
      { name: 'Jumbo', icon: 'fluent-emoji-flat:salt', tags: ['Condiments', 'Épices'], formats: [{ label: '1 sachet', unit: 'sachet', officialPriceCap: 25 }, { label: 'Paquet', unit: 'paquet', officialPriceCap: 1500 }, { label: 'Carton', unit: 'carton', officialPriceCap: 15000 }] },
      { name: 'Maggi', icon: 'fluent-emoji-flat:salt', tags: ['Condiments', 'Épices'], formats: [{ label: '1 tablette', unit: 'pièce', officialPriceCap: 25 }, { label: 'Carton', unit: 'carton', officialPriceCap: 15000 }] },
      { name: 'Ail', icon: 'fluent-emoji-flat:garlic', tags: ['Condiments'], formats: [{ label: '100 g', unit: 'g', officialPriceCap: 150 }, { label: '250 g', unit: 'g', officialPriceCap: 350 }, { label: '500 g', unit: 'g', officialPriceCap: 700 }, { label: '1 kg', unit: 'kg', officialPriceCap: 1300 }] },
      { name: 'Poivre', icon: 'fluent-emoji-flat:salt', tags: ['Condiments', 'Épices'], formats: [{ label: '50 g', unit: 'g', officialPriceCap: 200 }, { label: '100 g', unit: 'g', officialPriceCap: 400 }] },
      { name: 'Piment', icon: 'fluent-emoji-flat:hot-pepper', tags: ['Condiments', 'Épices'], formats: [{ label: '100 g', unit: 'g', officialPriceCap: 300 }] },
      { name: 'Épices', icon: 'fluent-emoji-flat:herb', tags: ['Condiments', 'Épices'], formats: [{ label: 'Sachet', unit: 'sachet', officialPriceCap: 100 }] },
    ]
  }
];

async function main() {
  console.log('--- DEBUT DU SEED MVP (Structure Optimisée - BATCH MODE) ---');

  // Nettoyage COMPLET de la DB
  await prisma.priceObservation.deleteMany({});
  await prisma.productFormat.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { name: 'Citoyen Observateur', phone: '770000000', passwordHash: 'hash', status: 'active' }
    });
  }

  let store = await prisma.store.findFirst();
  if (!store) {
    store = await prisma.store.create({
      data: { name: 'Boutique Quartier', latitude: 14.6928, longitude: -17.4467, city: 'Dakar', status: 'active' }
    });
  }

  const now = new Date();
  let obsCount = 0;

  for (const catData of MVP_DATA) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: slugify(catData.name),
        icon: catData.icon,
      }
    });

    for (const prodData of catData.products) {
      const product = await prisma.product.create({
        data: {
          name: prodData.name,
          slug: slugify(prodData.name),
          categoryId: category.id,
          icon: prodData.icon,
          tags: prodData.tags,
        }
      });

      for (const formatData of prodData.formats) {
        const format = await prisma.productFormat.create({
          data: {
            productId: product.id,
            label: formatData.label,
            unit: formatData.unit,
            weight: formatData.label,
            officialPriceCap: formatData.officialPriceCap,
          }
        });

        // Préparer les observations pour ce format
        const observationsToInsert = [];
        for (let day = 30; day >= 0; day--) {
          const observedAt = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
          const numObs = getRandomInt(1, 2);
          
          for (let i = 0; i < numObs; i++) {
            const currentPrice = getRandomPrice(formatData.officialPriceCap);
            observationsToInsert.push({
              storeId: store.id,
              productFormatId: format.id,
              userId: user.id,
              price: currentPrice,
              latitude: store.latitude,
              longitude: store.longitude,
              status: 'confirmed' as const,
              observedAt: new Date(observedAt.getTime() + getRandomInt(0, 8 * 60 * 60 * 1000)),
            });
          }
        }
        
        // Insérer en batch pour la rapidité
        await prisma.priceObservation.createMany({
          data: observationsToInsert
        });
        obsCount += observationsToInsert.length;
      }
    }
    console.log(`Catégorie ${catData.name} créée avec ses produits.`);
  }

  console.log(`Terminé ! Architecture MVP propre installée. ${obsCount} observations enregistrées.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

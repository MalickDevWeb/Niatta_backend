import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(basePrice: number) {
  const noise = (Math.random() * 0.15) - 0.05;
  let price = basePrice * (1 + noise);
  return Math.round(price / 25) * 25;
}

async function main() {
  console.log('--- DEBUT DU SEED COMPLET (Nouveau Schema) ---');
  
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

  const results: any[] = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream('juste_prix_catalogue_1200.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  console.log(`CSV chargé : ${results.length} lignes.`);

  const categoriesSet = new Set(results.map(r => r.category).filter(Boolean));
  const catMap: Record<string, string> = {}; 

  for (const catName of categoriesSet as any) {
    const slug = slugify(catName);
    let cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: catName, slug }
      });
    }
    catMap[catName] = cat.id;
  }
  console.log(`Catégories créées/vérifiées (${categoriesSet.size}).`);

  // Nettoyer les anciennes données pour éviter les doublons
  await prisma.priceObservation.deleteMany({});
  await prisma.productFormat.deleteMany({});
  await prisma.product.deleteMany({});
  
  const now = new Date();
  let obsCount = 0;
  let prodCount = 0;

  console.log(`Création des produits et de l'historique des prix... Cela va prendre quelques instants.`);
  
  for (const row of results) {
    if (!row.name || !row.category) continue;
    
    let slug = slugify(row.name + '-' + row.code);
    
    let offPrice = parseFloat(row.official_price_fcfa);
    let mktPrice = parseFloat(row.market_price_fcfa);
    
    // Le prix de base est le prix officiel. S'il n'existe pas on prend le prix marché.
    let basePrice = offPrice || mktPrice || 500;
    
    const product = await prisma.product.create({
      data: {
        categoryId: catMap[row.category],
        name: row.name,
        slug: slug,
      }
    });

    const format = await prisma.productFormat.create({
      data: {
        productId: product.id,
        label: row.unit || 'Standard',
        unit: row.unit || 'kg',
        weight: row.unit || '1kg',
        officialPriceCap: basePrice,
      }
    });
    
    prodCount++;

    // Générer l'historique sur 30 jours
    for (let day = 30; day >= 0; day--) {
      const observedAt = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
      const numObs = getRandomInt(1, 2);
      
      for (let i = 0; i < numObs; i++) {
        const currentPrice = getRandomPrice(basePrice);
        
        await prisma.priceObservation.create({
          data: {
            storeId: store.id,
            productFormatId: format.id,
            userId: user.id,
            price: currentPrice,
            latitude: store.latitude,
            longitude: store.longitude,
            status: 'confirmed',
            observedAt: new Date(observedAt.getTime() + getRandomInt(0, 8 * 60 * 60 * 1000)),
          }
        });
        obsCount++;
      }
    }
    
    if (prodCount % 100 === 0) {
      console.log(`... ${prodCount} produits traités`);
    }
  }

  console.log(`Terminé ! ${prodCount} produits (et leurs formats) créés, avec leurs vrais prix, et ${obsCount} observations enregistrées.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

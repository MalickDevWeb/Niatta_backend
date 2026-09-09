import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

async function main() {
  console.log("🌱 Démarrage de l'importation CSV...");
  
  const results: any[] = [];
  const csvFilePath = path.join(__dirname, "../juste_prix_catalogue_1200.csv");

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err));
  });

  console.log(`📄 Fichier CSV lu : ${results.length} lignes trouvées.`);

  // 1. Extraire et créer les catégories
  const uniqueCategories = [...new Set(results.map(row => row.category).filter(c => c))];
  console.log(`📂 Création de ${uniqueCategories.length} catégories uniques...`);
  
  const categoryMap: Record<string, string> = {};

  for (const catName of uniqueCategories) {
    const slug = slugify(catName as string);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: catName as string,
        slug,
      },
    });
    categoryMap[catName as string] = category.id;
  }

  // 2. Créer les produits
  console.log(`📦 Insertion des produits...`);
  let inserted = 0;
  
  for (const row of results) {
    if (!row.name || !row.category || !row.unit) continue;

    const slug = slugify(`${row.name} ${row.code}`);
    const categoryId = categoryMap[row.category];

    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug },
      update: {
        brand: row.brand || null,
        unit: row.unit,
        officialPriceCap: row.official_price_fcfa ? parseFloat(row.official_price_fcfa) : null,
        categoryId,
      },
      create: {
        name: row.name,
        slug,
        brand: row.brand || null,
        unit: row.unit,
        officialPriceCap: row.official_price_fcfa ? parseFloat(row.official_price_fcfa) : null,
        categoryId,
        status: 'active',
      },
    });
    
    inserted++;
    if (inserted % 100 === 0) {
      console.log(`  -> ${inserted} produits insérés...`);
    }
  }

  console.log(`✅ Importation terminée : ${inserted} produits insérés ou mis à jour.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Suppression des observations...');
  const obsDeleted = await prisma.priceObservation.deleteMany({});
  console.log(`${obsDeleted.count} observations supprimées.`);

  console.log('Suppression des boutiques (stores)...');
  const storesDeleted = await prisma.store.deleteMany({});
  console.log(`${storesDeleted.count} boutiques supprimées.`);

  console.log('Suppression des citoyens (users)...');
  const usersDeleted = await prisma.user.deleteMany({});
  console.log(`${usersDeleted.count} citoyens supprimés.`);

  console.log('Base de données nettoyée avec succès !');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

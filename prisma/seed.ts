import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissionSlugs = [
  'reports.create', 'reports.view', 'reports.review', 'reports.confirm', 'reports.reject',
  'products.view', 'products.create', 'products.update', 'products.delete',
  'stores.view', 'stores.update', 'stores.merge',
  'users.view', 'users.suspend', 'analytics.view',
];

async function main() {
  console.log('🌱 Démarrage du seed...');
  
  const permissions = await Promise.all(
    permissionSlugs.map((slug) =>
      prisma.permission.upsert({
        where: { slug },
        update: {},
        create: { name: slug, slug },
      }),
    ),
  );
  console.log(`✅ ${permissions.length} permissions créées`);

  const citizen = await prisma.role.upsert({
    where: { slug: 'citizen' },
    update: {},
    create: { name: 'Citizen', slug: 'citizen', isSystem: true },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: { name: 'Administrator', slug: 'admin', isSystem: true },
  });

  await prisma.$transaction(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: permission.id },
      }),
    ),
  );
  console.log('✅ Rôles et permissions configurés');

  const adminPhone = '+221770000001';
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      passwordHash: adminPassword,
      name: 'Admin System',
      roles: {
        create: {
          roleId: adminRole.id
        }
      },
      status: 'active',
      phoneVerifiedAt: new Date()
    },
  });
  console.log(`✅ Utilisateurs créés (admin: ${adminPhone} / admin123)`);

  const categoriesData = [
    { name: 'Riz', slug: 'riz', icon: 'twemoji:sheaf-of-rice' },
    { name: 'Sucre', slug: 'sucre', icon: 'twemoji:sugar' },
    { name: 'Huile', slug: 'huile', icon: 'twemoji:bottle-with-popping-cork' },
    { name: 'Lait', slug: 'lait', icon: 'twemoji:glass-of-milk' },
    { name: 'Farine', slug: 'farine', icon: 'twemoji:bread' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categoriesData.length} catégories créées`);

  const rizCat = await prisma.category.findUnique({ where: { slug: 'riz' } });
  const sucreCat = await prisma.category.findUnique({ where: { slug: 'sucre' } });
  const huileCat = await prisma.category.findUnique({ where: { slug: 'huile' } });

  if (rizCat && sucreCat && huileCat) {
    const productsData = [
      { name: 'Riz brisé parfumé', slug: 'riz-brise-parfume', unit: 'kg', icon: 'twemoji:sheaf-of-rice', categoryId: rizCat.id, officialPriceCap: 450, brand: null, weight: null },
      { name: 'Riz brisé ordinaire', slug: 'riz-brise-ordinaire', unit: 'kg', icon: 'twemoji:sheaf-of-rice', categoryId: rizCat.id, officialPriceCap: 375, brand: null, weight: null },
      { name: 'Sucre en poudre', slug: 'sucre-poudre', unit: 'kg', icon: 'twemoji:sugar', categoryId: sucreCat.id, officialPriceCap: 650, brand: 'CSS', weight: null },
      { name: 'Huile végétale', slug: 'huile-vegetale', unit: 'L', icon: 'twemoji:bottle-with-popping-cork', categoryId: huileCat.id, officialPriceCap: 1100, brand: 'Niani', weight: null },
    ];

    for (const prod of productsData) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: prod,
      });
    }
    console.log(`✅ ${productsData.length} produits créés`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
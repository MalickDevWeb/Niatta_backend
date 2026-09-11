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

  await prisma.role.upsert({
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

  const adminPhone = '+221771719013';
  const adminPassword = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      passwordHash: adminPassword,
      name: 'Admin System',
      roles: { create: { roleId: adminRole.id } },
      status: 'active',
      phoneVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin: ${adminPhone} / 1234`);

  function slugify(text: string) {
    return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  }

  // ─── Catégories ─────────────────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Ndeki',     slug: 'ndeki',     icon: '/assets/images/image.png' },
    { name: 'Agne',      slug: 'agne',      icon: '/assets/images/agne.png' },
    { name: 'Saf safal', slug: 'saf-safal', icon: '/assets/images/saf-safal.png' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ ${categoriesData.length} catégories créées`);

  // ─── Produits ────────────────────────────────────────────────────────────────
  type ProdDef = { name: string; icon: string; unit: string; officialPriceCap?: number };
  const productsByCategorySlug: Record<string, ProdDef[]> = {
    'ndeki': [
      { name: 'Beurre', icon: '/assets/images/products/beurre.jpg', unit: 'kg' },
      { name: 'Café',   icon: '/assets/images/products/cafe.jpg', unit: 'kg' },
      { name: 'Lait',   icon: '/assets/images/products/lait.jpg', unit: 'kg' },
      { name: 'Sucre',  icon: '/assets/images/products/sucre.jpg', unit: 'kg', officialPriceCap: 600 },
      { name: 'Pain',   icon: '/assets/images/products/pain.jpg', unit: 'pièce', officialPriceCap: 150 },
    ],
    'agne': [
      { name: 'Riz',    icon: '/assets/images/products/riz.jpg', unit: 'kg', officialPriceCap: 300 },
      { name: 'Huile',  icon: 'fluent-emoji:olive', unit: 'litre', officialPriceCap: 1000 },
      { name: 'Farine', icon: 'fluent-emoji:wheat', unit: 'kg', officialPriceCap: 400 },
      { name: 'Mil',    icon: 'fluent-emoji:ear-of-corn', unit: 'kg', officialPriceCap: 388 },
      { name: 'Pâtes',  icon: 'fluent-emoji:spaghetti', unit: 'kg' },
    ],
    'saf-safal': [
      { name: 'Nokoss',  icon: 'fluent-emoji:herb', unit: 'pot' },
      { name: 'Netetou', icon: 'fluent-emoji:chestnut', unit: 'boule' },
      { name: 'Piment',  icon: 'fluent-emoji:hot-pepper', unit: 'sachet' },
      { name: 'Ail',     icon: 'fluent-emoji:garlic', unit: 'pièce' },
    ],
  };

  let total = 0;
  for (const [categorySlug, products] of Object.entries(productsByCategorySlug)) {
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) continue;
    for (const prod of products) {
      const slug = slugify(prod.name);
      
      const product = await prisma.product.upsert({
        where: { slug },
        update: { icon: prod.icon, categoryId },
        create: {
          name: prod.name,
          slug,
          icon: prod.icon,
          categoryId,
          status: 'active',
        },
      });

      const formatLabel = `1 ${prod.unit}`;
      await prisma.productFormat.upsert({
        where: { productId_label: { productId: product.id, label: formatLabel } },
        update: { unit: prod.unit, officialPriceCap: prod.officialPriceCap ?? null },
        create: {
          productId: product.id,
          label: formatLabel,
          unit: prod.unit,
          officialPriceCap: prod.officialPriceCap ?? null,
          status: 'active',
        },
      });

      total++;
    }
  }
  console.log(`✅ ${total} produits créés/mis à jour`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';

// Configure Cloudinary with user's credentials
cloudinary.config({
  cloud_name: 'djp423xyr',
  api_key: '577389579188942',
  api_secret: 'P8DmL-YVGYnBGJKQcaM2GSNDyMg',
});

const prisma = new PrismaClient();

const permissionSlugs = [
  'reports.create', 'reports.view', 'reports.review', 'reports.confirm', 'reports.reject',
  'products.view', 'products.create', 'products.update', 'products.delete',
  'stores.view', 'stores.update', 'stores.merge',
  'users.view', 'users.suspend', 'analytics.view',
];

async function uploadImageToCloudinary(localPath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(__dirname, '../../frontend-angular/public', localPath.replace(/^\//, ''));
    console.log(`📤 Uploading ${absolutePath} to Cloudinary...`);
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: 'justeprix/products',
      use_filename: true,
      unique_filename: false,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Failed to upload ${localPath}`, error);
    return localPath; // Fallback to local path if upload fails
  }
}

async function main() {
  console.log('🌱 Démarrage du seed avec Cloudinary...');

  // 1. Nettoyer les produits existants sans image
  console.log('🗑️ Suppression des anciens produits pour nettoyer la base...');
  await prisma.priceObservation.deleteMany({});
  await prisma.productFormat.deleteMany({});
  await prisma.product.deleteMany({});
  
  const permissions = await Promise.all(
    permissionSlugs.map((slug) =>
      prisma.permission.upsert({
        where: { slug },
        update: {},
        create: { name: slug, slug },
      }),
    ),
  );
  console.log(`✅ ${permissions.length} permissions configurées`);

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

  // ─── Produits (Only those with existing images) ──────────────────────────────
  type ProdDef = { name: string; localIcon: string; unit: string; officialPriceCap?: number };
  const productsByCategorySlug: Record<string, ProdDef[]> = {
    'ndeki': [
      { name: 'Beurre', localIcon: '/assets/images/products/beurre.jpg', unit: 'kg', officialPriceCap: 2500 },
      { name: 'Café',   localIcon: '/assets/images/products/cafe.jpg', unit: 'kg', officialPriceCap: 3500 },
      { name: 'Lait',   localIcon: '/assets/images/products/lait.jpg', unit: 'kg', officialPriceCap: 3000 },
      { name: 'Sucre',  localIcon: '/assets/images/products/sucre.jpg', unit: 'kg', officialPriceCap: 600 },
      { name: 'Pain',   localIcon: '/assets/images/products/pain.jpg', unit: 'pièce', officialPriceCap: 150 },
    ],
    'agne': [
      { name: 'Riz',    localIcon: '/assets/images/products/riz.jpg', unit: 'kg', officialPriceCap: 300 },
    ],
    'saf-safal': [],
  };

  let total = 0;
  for (const [categorySlug, products] of Object.entries(productsByCategorySlug)) {
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) continue;
    for (const prod of products) {
      const slug = slugify(prod.name);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(prod.localIcon);
      
      const product = await prisma.product.upsert({
        where: { slug },
        update: { icon: cloudinaryUrl, categoryId },
        create: {
          name: prod.name,
          slug,
          icon: cloudinaryUrl, // Using cloudinary URL for icon so frontend can use it directly
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
  console.log(`✅ ${total} produits créés/mis à jour avec leurs images sur Cloudinary`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

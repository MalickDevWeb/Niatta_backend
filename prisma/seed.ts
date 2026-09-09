import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissionSlugs = [
  'reports.create',
  'reports.view',
  'reports.review',
  'reports.confirm',
  'reports.reject',
  'products.view',
  'products.create',
  'products.update',
  'products.delete',
  'stores.view',
  'stores.update',
  'stores.merge',
  'users.view',
  'users.suspend',
  'analytics.view',
];

async function main() {
  const permissions = await Promise.all(
    permissionSlugs.map((slug) =>
      prisma.permission.upsert({
        where: { slug },
        update: {},
        create: { name: slug, slug },
      }),
    ),
  );

  const citizen = await prisma.role.upsert({
    where: { slug: 'citizen' },
    update: {},
    create: { name: 'Citizen', slug: 'citizen', isSystem: true },
  });

  await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: { name: 'Administrator', slug: 'admin', isSystem: true },
  });

  await prisma.$transaction(
    permissions.slice(0, 2).map((permission) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: citizen.id, permissionId: permission.id } },
        update: {},
        create: { roleId: citizen.id, permissionId: permission.id },
      }),
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
import ProductsClient from './products-client';

import { prisma } from '../../../../lib/prisma';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, formats: { orderBy: { officialPriceCap: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const serialized = products.map(p => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    description: p.description,
    status: p.status,
    category: { id: p.category.id, name: p.category.name },
    formats: p.formats.map(f => ({
      id: f.id,
      label: f.label,
      unit: f.unit,
      weight: f.weight,
      officialPriceCap: f.officialPriceCap ? Number(f.officialPriceCap) : null,
      imageUrl: f.imageUrl,
    })),
  }));

  return <ProductsClient products={serialized} categories={categories} />;
}

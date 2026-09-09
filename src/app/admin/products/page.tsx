import { PrismaClient } from '@prisma/client';
import ProductsClient from './products-client';

const prisma = new PrismaClient();

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const serialized = products.map(p => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    unit: p.unit,
    description: p.description,
    brand: (p as any).brand ?? null,
    weight: (p as any).weight ?? null,
    officialPriceCap: (p as any).officialPriceCap ? Number((p as any).officialPriceCap) : null,
    status: p.status,
    category: { id: p.category.id, name: p.category.name },
  }));

  return <ProductsClient products={serialized} categories={categories} />;
}

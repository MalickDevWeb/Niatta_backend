import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        category: true,
        _count: { select: { observations: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Récupérer le prix moyen de chaque produit depuis les observations
    const aggregations = await prisma.priceObservation.groupBy({
      by: ['productId'],
      _avg: { price: true },
    });
    const avgPriceMap = new Map(aggregations.map(a => [a.productId, a._avg.price ? Number(a._avg.price) : null]));

    const formattedProducts = products.map(p => {
      const officialPriceCap = p.officialPriceCap ? Number(p.officialPriceCap) : null;
      const averageObserved = avgPriceMap.get(p.id);
      
      return {
        id: p.id,
        name: p.name,
        icon: p.icon || 'fluent-emoji-flat:package',
        unit: p.unit,
        description: p.description || null,
        brand: p.brand || null,
        weight: p.weight || null,
        officialPriceCap,
        price: Math.round(averageObserved || officialPriceCap || 0),
        category: p.category.name,
        shopCount: p._count.observations,
      };
    });

    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

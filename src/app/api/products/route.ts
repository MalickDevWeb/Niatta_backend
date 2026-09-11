import { NextResponse } from 'next/server';

import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Récupérer tous les produits avec leurs formats
    const products = await prisma.product.findMany({
      include: {
        category: true,
        formats: {
          where: { status: 'active' },
          orderBy: { officialPriceCap: 'asc' }, // Trier par prix croissant (petit format en premier)
        },
      },
      orderBy: { name: 'asc' },
    });

    // Récupérer les prix moyens de chaque format depuis les observations
    const aggregations = await prisma.priceObservation.groupBy({
      by: ['productFormatId'],
      _avg: { price: true },
      _count: { price: true },
    });
    const avgPriceMap = new Map(aggregations.map(a => [a.productFormatId, { avg: a._avg.price ? Number(a._avg.price) : null, count: a._count.price }]));

    const formattedProducts = products
      .filter(p => p.formats.length > 0) // Exclure les produits sans format actif
      .map(p => {
        const formatsWithPrices = p.formats.map(f => {
          const officialPriceCap = f.officialPriceCap ? Number(f.officialPriceCap) : null;
          const obs = avgPriceMap.get(f.id);
          const averageObserved = obs?.avg ?? null;

          return {
            id: f.id,
            label: f.label,
            unit: f.unit,
            weight: f.weight || null,
            imageUrl: f.imageUrl || null,
            officialPriceCap,
            price: Math.round(averageObserved || officialPriceCap || 0),
            shopCount: obs?.count ?? 0,
          };
        });

        // Le format par défaut est le premier (le moins cher / le plus petit)
        const defaultFormat = formatsWithPrices[0];

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          icon: p.icon || 'fluent-emoji-flat:package',
          category: p.category.name,
          tags: p.tags,
          // Données du format par défaut (pour l'affichage de la carte)
          defaultFormatId: defaultFormat.id,
          price: defaultFormat.price,
          unit: defaultFormat.unit,
          officialPriceCap: defaultFormat.officialPriceCap,
          // Tous les formats disponibles (pour le sélecteur)
          formats: formatsWithPrices,
        };
      });

    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

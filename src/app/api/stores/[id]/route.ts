import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        observations: {
          where: { status: 'confirmed' },
          orderBy: { observedAt: 'desc' },
          include: {
            productFormat: { include: { product: true } },
          },
        },
        _count: { select: { observations: true } },
      },
    });

    if (!store) {
      return NextResponse.json({ success: false, error: 'Boutique introuvable.' }, { status: 404 });
    }

    const latestByFormat = new Map<string, (typeof store.observations)[number]>();
    for (const observation of store.observations) {
      if (!latestByFormat.has(observation.productFormatId)) {
        latestByFormat.set(observation.productFormatId, observation);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
        city: store.city,
        neighborhood: store.neighborhood,
        address: store.address || [store.neighborhood, store.city].filter(Boolean).join(', ') || null,
        rating: store.rating ? Number(store.rating) : null,
        imageUrl: store.imageUrl,
        photos: store.photos,
        observationCount: store._count.observations,
        prices: Array.from(latestByFormat.values()).map((observation) => ({
          id: observation.id,
          price: Number(observation.price),
          observedAt: observation.observedAt,
          photoUrl: observation.photoUrl,
          product: {
            id: observation.productFormat.product.id,
            name: observation.productFormat.product.name,
            icon: observation.productFormat.product.icon,
          },
          format: {
            id: observation.productFormat.id,
            label: observation.productFormat.label,
            officialPriceCap: observation.productFormat.officialPriceCap
              ? Number(observation.productFormat.officialPriceCap)
              : null,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching store detail:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors du chargement de la boutique.' }, { status: 500 });
  }
}

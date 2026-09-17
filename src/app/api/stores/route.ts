import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

/**
 * GET /api/stores
 * Retourne toutes les boutiques actives avec coordonnées (pour la carte du frontend)
 */
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { status: 'active' },
      include: {
        _count: { select: { observations: true } },
      },
      orderBy: { name: 'asc' },
    });

    const formattedStores = stores.map(s => ({
      id: s.id,
      name: s.name,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      city: s.city || null,
      neighborhood: s.neighborhood || null,
      address: (s as any).address || [s.neighborhood, s.city].filter(Boolean).join(', ') || null,
      rating: (s as any).rating ? Number((s as any).rating) : null,
      imageUrl: (s as any).imageUrl || null,
      photos: (s as any).photos || [],
      observationCount: s._count.observations,
      source: s.source,
    }));

    return NextResponse.json({ success: true, data: formattedStores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stores' }, { status: 500 });
  }
}

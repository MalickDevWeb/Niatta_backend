import { NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';

/**
 * GET /api/gatherings
 * Retourne le point de rassemblement actif (public, pas besoin de token)
 */
export async function GET() {
  try {
    const point = await prisma.gatheringPoint.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: point });
  } catch (error) {
    console.error('GET /api/gatherings error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/gatherings
 * Crée ou met à jour le point de rassemblement actif (admin uniquement)
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix');
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { label, description, latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ success: false, error: 'latitude et longitude requis' }, { status: 400 });
    }

    // Désactiver tous les anciens points actifs
    await prisma.gatheringPoint.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Créer le nouveau point actif
    const point = await prisma.gatheringPoint.create({
      data: {
        label: label || 'Lieu du Rassemblement',
        description: description || null,
        latitude,
        longitude,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: point }, { status: 201 });
  } catch (error) {
    console.error('POST /api/gatherings error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/gatherings
 * Désactive le point de rassemblement actif (admin uniquement)
 */
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix');
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    await prisma.gatheringPoint.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Point de rassemblement désactivé' });
  } catch (error) {
    console.error('DELETE /api/gatherings error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

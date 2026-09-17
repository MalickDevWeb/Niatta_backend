import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-justeprix';

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { roles: { include: { role: true } } }
    });
    
    if (!user || user.status !== 'active') return null;
    
    const isFieldAgent = user.roles.some(ur => ur.role.slug === 'homme_terrain');
    if (!isFieldAgent) return null;

    return user.id;
  } catch (e) {
    console.error('verifyAuth failed:', e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const agentId = await verifyAuth(request);
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const tasks = await prisma.priceObservation.findMany({
      where: {
        status: 'pending'
      },
      include: {
        store: true,
        productFormat: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        user: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const agentId = await verifyAuth(request);
    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { observationId, isConfirmed, actualPrice, comment, photoUrl } = body;

    if (!observationId || typeof isConfirmed !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const observation = await prisma.priceObservation.findUnique({
      where: { id: observationId }
    });

    if (!observation) {
      return NextResponse.json({ success: false, error: 'Observation introuvable' }, { status: 404 });
    }

    if (observation.status !== 'pending' && observation.status !== 'under_review') {
      return NextResponse.json({ success: false, error: 'Cette observation a déjà été traitée' }, { status: 400 });
    }

    let finalPhotoUrl = photoUrl;
    if (photoUrl && photoUrl.startsWith('data:image')) {
      try {
        const base64Data = photoUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        finalPhotoUrl = await uploadToCloudinary(buffer, 'verifications');
      } catch (e) {
        console.error("Failed to upload image to Cloudinary", e);
        finalPhotoUrl = null;
      }
    }

    const verification = await prisma.$transaction(async (tx) => {
      const v = await tx.fieldVerification.create({
        data: {
          observationId,
          agentId,
          isConfirmed,
          actualPrice: actualPrice !== undefined && actualPrice !== null ? parseFloat(actualPrice) : null,
          comment: comment || null,
          photoUrl: finalPhotoUrl || null
        }
      });

      await tx.priceObservation.update({
        where: { id: observationId },
        data: {
          status: isConfirmed ? 'confirmed' : 'rejected'
        }
      });

      return v;
    });

    return NextResponse.json({ success: true, data: verification }, { status: 201 });
  } catch (error) {
    console.error('Error submitting verification:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

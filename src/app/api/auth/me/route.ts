import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-justeprix';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    let decoded: { id: string, phone: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string, phone: string };
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        observations: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: user.id, 
          name: user.name, 
          phone: user.phone,
          createdAt: user.createdAt,
          observationsCount: user.observations.length
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

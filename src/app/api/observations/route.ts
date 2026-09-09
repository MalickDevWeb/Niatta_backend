import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, price, city, neighborhood, storeName } = body;
    
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return NextResponse.json({ success: false, error: 'Veuillez sélectionner un produit valide.' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Le prix doit être un nombre strictement positif.' }, { status: 400 });
    }
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Vous devez être connecté pour envoyer une alerte.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix');
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const userId = decoded.id;

    // Try to find a store, or create one from the user's input
    let store = await prisma.store.findFirst({
      where: { name: storeName || 'Boutique' }
    });
    
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: storeName || 'Boutique (Signalement)',
          city: city || 'Inconnue',
          neighborhood: neighborhood || 'Inconnu',
          latitude: 0,
          longitude: 0,
          source: 'citizen_report'
        }
      });
    }
    
    const observation = await prisma.priceObservation.create({
      data: {
        price: parsedPrice,
        userId: userId,
        productId,
        storeId: store.id,
        city: city,
        neighborhood: neighborhood,
        latitude: 0,
        longitude: 0,
        status: 'pending'
      }
    });
    
    return NextResponse.json({ success: true, data: observation }, { status: 201 });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json({ success: false, error: 'Failed to create observation' }, { status: 500 });
  }
}

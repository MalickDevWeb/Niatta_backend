import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, formatId, price, city, neighborhood, storeName, latitude, longitude, storeId } = body;
    
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
    
    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix') as { id: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const userId = decoded.id;

    // Resolve formatId
    let finalFormatId = formatId;
    if (!finalFormatId) {
      const firstFormat = await prisma.productFormat.findFirst({
        where: { productId }
      });
      if (!firstFormat) {
        return NextResponse.json({ success: false, error: 'Ce produit n\'a aucun format valide.' }, { status: 400 });
      }
      finalFormatId = firstFormat.id;
    }

    // Use provided coordinates or fallback
    const lat = latitude !== undefined ? parseFloat(latitude) : 0;
    const lng = longitude !== undefined ? parseFloat(longitude) : 0;

    let finalStoreId = storeId;
    let observationStatus = 'pending';

    if (finalStoreId) {
      // Vérifier que la boutique existe
      const existingStore = await prisma.store.findUnique({ where: { id: finalStoreId } });
      if (!existingStore) {
        return NextResponse.json({ success: false, error: 'Boutique spécifiée introuvable.' }, { status: 400 });
      }
    } else {
      // Nouvelle boutique : Algorithme garde-fou anti-doublon
      const recentStores: any[] = await prisma.$queryRaw`
        SELECT id FROM "Store"
        WHERE ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, 3)
        AND "createdAt" >= NOW() - INTERVAL '5 minutes'
        LIMIT 1;
      `;
      
      if (recentStores.length > 0) {
        // Flag for joint review silently
        observationStatus = 'under_review';
      }

      // Création de la boutique
      const store = await prisma.store.create({
        data: {
          name: storeName || 'Boutique (Nouveau Signalement)',
          city: city || 'Inconnue',
          neighborhood: neighborhood || 'Inconnu',
          latitude: lat,
          longitude: lng,
          source: 'citizen_report'
        }
      });
      finalStoreId = store.id;

      // Mise à jour de la colonne géographique PostGIS
      await prisma.$executeRaw`
        UPDATE "Store" 
        SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) 
        WHERE id = ${finalStoreId}::uuid
      `;
    }
    
    // Création de l'observation
    const observation = await prisma.priceObservation.create({
      data: {
        price: parsedPrice,
        userId: userId,
        productFormatId: finalFormatId,
        storeId: finalStoreId,
        city: city,
        neighborhood: neighborhood,
        latitude: lat,
        longitude: lng,
        status: observationStatus as any,
        observedAt: new Date()
      }
    });

    // Mise à jour de la géométrie de l'observation
    await prisma.$executeRaw`
      UPDATE "PriceObservation" 
      SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) 
      WHERE id = ${observation.id}::uuid
    `;
    
    return NextResponse.json({ success: true, data: observation }, { status: 201 });
  } catch (error) {
    console.error('Error creating observation:', error);
    return NextResponse.json({ success: false, error: 'Failed to create observation' }, { status: 500 });
  }
}

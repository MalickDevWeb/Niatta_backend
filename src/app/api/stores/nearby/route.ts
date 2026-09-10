import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius') || '10'; // Default 10 meters

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { success: false, error: 'Les paramètres lat et lng sont obligatoires.' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radius = parseFloat(radiusParam);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return NextResponse.json(
        { success: false, error: 'Coordonnées invalides.' },
        { status: 400 }
      );
    }

    // Requête PostGIS pour trouver les boutiques dans un rayon donné (en mètres)
    // Note: ST_DWithin fonctionne en mètres sur les types geography
    const nearbyStores = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        "imageUrl", 
        status, 
        ST_Distance(location, ST_MakePoint(${lng}, ${lat})::geography) AS distance_meters
      FROM "Store"
      WHERE ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, ${radius})
      ORDER BY distance_meters ASC;
    `;

    // Prisma returns Raw Query Decimal results or numbers. We'll ensure safe serialization.
    // Convert BigInts or complex types if any.
    const serializedStores = JSON.parse(JSON.stringify(nearbyStores, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({ success: true, data: serializedStores });
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche des boutiques.' },
      { status: 500 }
    );
  }
}

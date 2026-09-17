import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

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

import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // Vérification de l'authentification (basique)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Non autorisé.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-justeprix');
    } catch {
      return NextResponse.json({ success: false, error: 'Session invalide ou expirée.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, categoryId, icon, description, tags } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Le nom du produit est obligatoire.' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ success: false, error: 'La catégorie est obligatoire.' }, { status: 400 });
    }

    // Gestion de l'upload d'image (Cloudinary) si l'icône est en base64
    let finalIconUrl = icon || null;
    if (icon && typeof icon === 'string' && icon.startsWith('data:image')) {
      try {
        const { uploadToCloudinary } = await import('../../../lib/cloudinary');
        const base64Data = icon.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        finalIconUrl = await uploadToCloudinary(buffer, 'products');
      } catch (e) {
        console.error("Failed to upload product icon to Cloudinary", e);
        return NextResponse.json({ success: false, error: 'Erreur lors de l\'upload de l\'image.' }, { status: 500 });
      }
    }

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .replace(/[\s_]+/g, '-') // Remplace les espaces et tirets bas par un tiret
      .replace(/[^\w-]+/g, ''); // Retire les caractères spéciaux

    // Vérifier si le slug existe déjà
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return NextResponse.json({ success: false, error: 'Un produit avec un nom similaire existe déjà.' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
        icon: finalIconUrl,
        description: description || null,
        tags: Array.isArray(tags) ? tags : [],
        status: 'active'
      }
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

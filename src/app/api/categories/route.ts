import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

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
    const { name, icon, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Le nom de la catégorie est obligatoire.' }, { status: 400 });
    }

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .replace(/[\s_]+/g, '-') // Remplace les espaces et tirets bas par un tiret
      .replace(/[^\w-]+/g, ''); // Retire les caractères spéciaux

    // Vérifier si le slug existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({ success: false, error: 'Une catégorie avec un nom similaire existe déjà.' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || null,
        description: description || null,
        status: 'active'
      }
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}

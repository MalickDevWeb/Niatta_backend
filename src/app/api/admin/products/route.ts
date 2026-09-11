import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '../../../../lib/prisma';

function slugify(text: string) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

// POST /api/admin/products — Créer un produit
export async function POST(request: Request) {
  const body = await request.json();
  const { name, categoryId, icon, description, imageUrl } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name, slug: slugify(name),
      icon: icon || null,
      description: description || null, categoryId, status: 'active',
      imageUrl: imageUrl || null
    },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

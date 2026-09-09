import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

// POST /api/admin/products — Créer un produit
export async function POST(request: Request) {
  const body = await request.json();
  const { name, categoryId, unit, icon, brand, weight, officialPriceCap, description } = body;

  if (!name || !categoryId || !unit) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name, slug: slugify(name), unit,
      icon: icon || null, brand: brand || null, weight: weight || null,
      officialPriceCap: officialPriceCap != null ? parseFloat(officialPriceCap) : null,
      description: description || null, categoryId, status: 'active',
    },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

// PUT /api/admin/products/[id] — Modifier un produit
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, categoryId, unit, icon, brand, weight, officialPriceCap, description } = body;

  if (!name || !categoryId || !unit) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name, slug: slugify(name), unit,
      icon: icon || null, brand: brand || null, weight: weight || null,
      officialPriceCap: officialPriceCap != null ? parseFloat(officialPriceCap) : null,
      description: description || null, categoryId,
    },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/admin/products/[id] — Supprimer un produit
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.priceObservation.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
  return NextResponse.json({ success: true });
}

// PATCH /api/admin/products/[id] — Activer/désactiver
export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id },
    data: { status: product.status === 'active' ? 'inactive' : 'active' },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: updated });
}

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '../../../../../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../../../../../lib/cloudinary';

function slugify(text: string) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

// PUT /api/admin/products/[id] — Modifier un produit
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { name, categoryId, icon, description, imageUrl } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  }

  let finalImageUrl = imageUrl;
  
  // If the user provided a new base64 image
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      finalImageUrl = await uploadToCloudinary(buffer, 'products');

      // Delete old image if it existed
      if (existingProduct.imageUrl && existingProduct.imageUrl.includes('res.cloudinary.com')) {
        const publicId = extractPublicId(existingProduct.imageUrl);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    } catch (e) {
      console.error("Failed to upload product image to Cloudinary", e);
      finalImageUrl = existingProduct.imageUrl; // keep old on fail
    }
  } else if (imageUrl === null || imageUrl === '') {
    // If image was removed completely
    if (existingProduct.imageUrl && existingProduct.imageUrl.includes('res.cloudinary.com')) {
      const publicId = extractPublicId(existingProduct.imageUrl);
      if (publicId) await deleteFromCloudinary(publicId);
    }
    finalImageUrl = null;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name, slug: slugify(name),
      icon: icon || null,
      description: description || null, categoryId,
      imageUrl: finalImageUrl,
    },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/admin/products/[id] — Supprimer un produit
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({ where: { id } });
  if (product && product.imageUrl && product.imageUrl.includes('res.cloudinary.com')) {
    const publicId = extractPublicId(product.imageUrl);
    if (publicId) await deleteFromCloudinary(publicId);
  }

  await prisma.priceObservation.deleteMany({ where: { productFormat: { productId: id } } });
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

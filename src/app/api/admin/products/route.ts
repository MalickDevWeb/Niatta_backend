import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '../../../../lib/cloudinary';

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

  let finalImageUrl = imageUrl;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      finalImageUrl = await uploadToCloudinary(buffer, 'products');
    } catch (e) {
      console.error("Failed to upload product image to Cloudinary", e);
      finalImageUrl = null;
    }
  }

  const product = await prisma.product.create({
    data: {
      name, slug: slugify(name),
      icon: icon || null,
      description: description || null, categoryId, status: 'active',
      imageUrl: finalImageUrl || null
    },
  });

  revalidatePath('/admin/products');
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

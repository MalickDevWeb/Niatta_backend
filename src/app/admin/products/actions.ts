'use server'

import { PrismaClient, EntityStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { saveFile } from '@/lib/upload';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function addProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;

  if (!name || !categoryId) return;

  const slug = slugify(name);
  
  let iconUrl = null;
  if (imageFile && imageFile.size > 0) {
    iconUrl = await saveFile(imageFile);
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      icon: iconUrl,
      description: description || null,
      categoryId,
      status: 'active',
    },
  });

  revalidatePath('/admin/products');
}

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;

  if (!id || !name || !categoryId) return;

  const dataToUpdate: any = {
    name,
    slug: slugify(name),
    description: description || null,
    categoryId,
  };

  if (imageFile && imageFile.size > 0) {
    dataToUpdate.icon = await saveFile(imageFile);
  }

  await prisma.product.update({
    where: { id },
    data: dataToUpdate,
  });

  revalidatePath('/admin/products');
}

export async function toggleProductStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') as EntityStatus;

  if (!id) return;

  const newStatus: EntityStatus = currentStatus === 'active' ? 'inactive' : 'active';

  await prisma.product.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath('/admin/products');
}

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  // Formats and observations will be cascade deleted if setup, otherwise delete them
  await prisma.priceObservation.deleteMany({ where: { productFormat: { productId: id } } });
  await prisma.productFormat.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  revalidatePath('/admin/products');
}

// --- PRODUCT FORMATS ACTIONS ---

export async function addProductFormat(formData: FormData) {
  const productId = formData.get('productId') as string;
  const label = formData.get('label') as string;
  const unit = formData.get('unit') as string;
  const weight = formData.get('weight') as string;
  const officialPriceCap = formData.get('officialPriceCap') as string;
  const imageFile = formData.get('imageFile') as File | null;

  if (!productId || !label || !unit) return;

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveFile(imageFile);
  }

  await prisma.productFormat.create({
    data: {
      productId,
      label,
      unit,
      weight: weight || null,
      officialPriceCap: officialPriceCap ? parseFloat(officialPriceCap) : null,
      imageUrl,
    },
  });

  revalidatePath('/admin/products');
}

export async function deleteProductFormat(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.priceObservation.deleteMany({ where: { productFormatId: id } });
  await prisma.productFormat.delete({ where: { id } });

  revalidatePath('/admin/products');
}

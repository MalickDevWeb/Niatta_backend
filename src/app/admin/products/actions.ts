'use server'

import { PrismaClient, EntityStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

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
  const unit = formData.get('unit') as string;
  const icon = formData.get('icon') as string;
  const brand = formData.get('brand') as string;
  const weight = formData.get('weight') as string;
  const officialPriceCap = formData.get('officialPriceCap') as string;
  const description = formData.get('description') as string;

  if (!name || !categoryId || !unit) return;

  const slug = slugify(name);

  await prisma.product.create({
    data: {
      name,
      slug,
      unit,
      icon: icon || null,
      brand: brand || null,
      weight: weight || null,
      officialPriceCap: officialPriceCap ? parseFloat(officialPriceCap) : null,
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
  const unit = formData.get('unit') as string;
  const icon = formData.get('icon') as string;
  const brand = formData.get('brand') as string;
  const weight = formData.get('weight') as string;
  const officialPriceCap = formData.get('officialPriceCap') as string;
  const description = formData.get('description') as string;

  if (!id || !name || !categoryId || !unit) return;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      unit,
      icon: icon || null,
      brand: brand || null,
      weight: weight || null,
      officialPriceCap: officialPriceCap ? parseFloat(officialPriceCap) : null,
      description: description || null,
      categoryId,
    },
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

  // Supprimer les observations liées d'abord
  await prisma.priceObservation.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  revalidatePath('/admin/products');
}

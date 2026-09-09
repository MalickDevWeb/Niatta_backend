'use server'

import { PrismaClient } from '@prisma/client';
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
  
  if (!name || !categoryId || !unit) return;
  
  const slug = slugify(name);
  
  // Create product
  await prisma.product.create({
    data: {
      name,
      slug,
      unit,
      icon: icon || null,
      categoryId,
      status: 'active'
    },
  });
  
  revalidatePath('/admin/products');
}

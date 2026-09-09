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

export async function addCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const icon = formData.get('icon') as string;
  
  if (!name) return;
  
  const slug = slugify(name);
  
  await prisma.category.create({
    data: {
      name,
      slug,
      icon: icon || null,
      description: description || null,
      status: 'active'
    },
  });
  
  revalidatePath('/admin/categories');
}

export async function toggleCategoryStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') as EntityStatus;
  
  if (!id) return;
  
  const newStatus: EntityStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  await prisma.category.update({
    where: { id },
    data: { status: newStatus },
  });
  
  revalidatePath('/admin/categories');
}

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

export async function addCategory(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;
  
  if (!name) return;
  
  const slug = slugify(name);
  
  let iconUrl = null;
  if (imageFile && imageFile.size > 0) {
    iconUrl = await saveFile(imageFile);
  }
  
  await prisma.category.create({
    data: {
      name,
      slug,
      icon: iconUrl,
      description: description || null,
      status: 'active'
    },
  });
  
  revalidatePath('/admin/categories');
}

export async function updateCategory(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('imageFile') as File | null;

  if (!id || !name) return;

  const dataToUpdate: any = {
    name,
    slug: slugify(name),
    description: description || null,
  };

  if (imageFile && imageFile.size > 0) {
    dataToUpdate.icon = await saveFile(imageFile);
  }

  await prisma.category.update({
    where: { id },
    data: dataToUpdate,
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

export async function deleteCategory(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  // Verify if it has products
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return; // Silent return, UI should prevent this

  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
}

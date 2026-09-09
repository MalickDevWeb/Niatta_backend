'use server'

import { PrismaClient, EntityStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function addStore(formData: FormData) {
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const neighborhood = formData.get('neighborhood') as string;
  
  if (!city || !neighborhood) return;
  
  await prisma.store.create({
    data: {
      name: name || "Boutique (Admin)",
      city,
      neighborhood,
      latitude: 0,
      longitude: 0,
      source: 'admin',
      status: 'active'
    },
  });
  
  revalidatePath('/admin/stores');
}

export async function toggleStoreStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') as EntityStatus;
  
  if (!id) return;
  
  const newStatus: EntityStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  await prisma.store.update({
    where: { id },
    data: { status: newStatus },
  });
  
  revalidatePath('/admin/stores');
}

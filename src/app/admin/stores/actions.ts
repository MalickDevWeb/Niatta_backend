'use server'

import { PrismaClient, EntityStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function addStore(formData: FormData) {
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const neighborhood = formData.get('neighborhood') as string;
  const address = formData.get('address') as string;
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  const rating = formData.get('rating') as string;

  if (!city || !neighborhood || !latitude || !longitude) return;

  await prisma.store.create({
    data: {
      name: name || 'Point de vente',
      city,
      neighborhood,
      address: address || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      rating: rating ? parseFloat(rating) : null,
      source: 'admin',
      status: 'active',
    } as any,
  });

  revalidatePath('/admin/stores');
}

export async function updateStore(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const city = formData.get('city') as string;
  const neighborhood = formData.get('neighborhood') as string;
  const address = formData.get('address') as string;
  const latitude = formData.get('latitude') as string;
  const longitude = formData.get('longitude') as string;
  const rating = formData.get('rating') as string;

  if (!id) return;

  await prisma.store.update({
    where: { id },
    data: {
      name: name || 'Point de vente',
      city: city || null,
      neighborhood: neighborhood || null,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      rating: rating ? parseFloat(rating) : null,
    } as any,
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

export async function deleteStore(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  // Supprimer les observations liées d'abord
  await prisma.priceObservation.deleteMany({ where: { storeId: id } });
  await prisma.store.delete({ where: { id } });

  revalidatePath('/admin/stores');
}

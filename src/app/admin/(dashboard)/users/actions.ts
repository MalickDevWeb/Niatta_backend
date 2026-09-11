'use server'

import { PrismaClient, UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function toggleUserStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const currentStatus = formData.get('currentStatus') as UserStatus;
  
  if (!id) return;
  
  const newStatus: UserStatus = currentStatus === 'active' ? 'suspended' : 'active';
  
  await prisma.user.update({
    where: { id },
    data: { status: newStatus },
  });
  
  revalidatePath('/admin/users');
}

export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  // Supprimer les rôles de l'utilisateur d'abord
  await prisma.userRole.deleteMany({ where: { userId: id } });
  
  // Supprimer les observations de l'utilisateur
  await prisma.priceObservation.deleteMany({ where: { userId: id } });

  // Supprimer l'utilisateur
  await prisma.user.delete({ where: { id } });

  revalidatePath('/admin/users');
}

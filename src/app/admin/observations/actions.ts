'use server'

import { PrismaClient, ReportStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateObservationStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const status = formData.get('status') as ReportStatus;
  
  if (!id || !status) return;
  
  await prisma.priceObservation.update({
    where: { id },
    data: { status },
  });
  
  revalidatePath('/admin/observations');
}

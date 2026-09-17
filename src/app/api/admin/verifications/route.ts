import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const verifications = await prisma.fieldVerification.findMany({
      include: {
        agent: {
          select: { id: true, name: true, phone: true }
        },
        observation: {
          include: {
            store: true,
            productFormat: {
              include: {
                product: true
              }
            },
            user: {
              select: { id: true, name: true, phone: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: verifications });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

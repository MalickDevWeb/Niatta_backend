import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        category: true
      },
      orderBy: { name: 'asc' },
    });
    
    // Map data to match PWA interface exactly
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon || 'fluent-emoji-flat:package',
      unit: p.unit,
      price: 0, // In reality, we'd calculate average from observations
      category: p.category.name,
    }));
    
    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

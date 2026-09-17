import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const agents = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              slug: 'homme_terrain'
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error('Error fetching field agents:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, prenom, password }: { nom: string; prenom: string; password?: string } = body;
    let { phone }: { phone: string } = body;

    if (!nom || !prenom || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Nom, prénom, téléphone et mot de passe sont requis' }, { status: 400 });
    }

    const name = `${prenom} ${nom}`.trim();

    if (phone) {
      phone = phone.replace(/\s+/g, '');
      if (phone.startsWith('00221')) phone = '+' + phone.substring(2);
      else if (!phone.startsWith('+221') && phone.length === 9) phone = '+221' + phone;
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let role = await prisma.role.findUnique({ where: { slug: 'homme_terrain' } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: 'Homme Terrain',
          slug: 'homme_terrain',
          description: 'Agent vérificateur sur le terrain'
        }
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        roles: {
          create: {
            roleId: role.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        status: true,
      }
    });

    return NextResponse.json({ success: true, data: { user, password } }, { status: 201 });
  } catch (error) {
    console.error('Error creating field agent:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, nom, prenom, phone, password, photoUrl } = data;

    if (!id || !nom || !prenom || !phone) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const name = `${prenom} ${nom}`.trim();
    const updateData: Record<string, string> = { name, phone, photoUrl };

    if (password && password.trim() !== '') {
      updateData['passwordHash'] = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Erreur MAJ agent:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !['active', 'suspended'].includes(status)) {
      return NextResponse.json({ success: false, error: 'ID et statut valide sont requis' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, status: true }
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating field agent:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-justeprix';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { phone, password } = body;

    if (phone) {
      phone = phone.replace(/\s+/g, '');
      if (phone.startsWith('00221')) phone = '+' + phone.substring(2);
      else if (!phone.startsWith('+221') && phone.length === 9) phone = '+221' + phone;
    }

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Téléphone et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          user: { id: user.id, name: user.name, phone: user.phone, roles: user.roles },
          token 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

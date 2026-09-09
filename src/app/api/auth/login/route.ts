import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-justeprix';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Téléphone et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Ce numéro de téléphone n\'est pas enregistré' },
        { status: 404 }
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
          user: { id: user.id, name: user.name, phone: user.phone },
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

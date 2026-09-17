import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-justeprix';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, phone, password } = body;

    if (phone) {
      phone = phone.replace(/\s+/g, '');
      if (phone.startsWith('00221')) phone = '+' + phone.substring(2);
      else if (!phone.startsWith('+221') && phone.length === 9) phone = '+221' + phone;
    }

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Nom, téléphone et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Password must be exactly 4 digits
    if (!/^\d{4}$/.test(password)) {
      return NextResponse.json({ success: false, error: 'Le mot de passe doit être composé de 4 chiffres exactement' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash
      }
    });

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
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

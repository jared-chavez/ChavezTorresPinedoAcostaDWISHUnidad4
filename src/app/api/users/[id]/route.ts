// API Route para gestión de usuarios por ID (PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { userDB } from '@/lib/db';
import { updateUserSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// GET - Obtener un usuario por ID (solo admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    
    // Obtener usuario completo con status desde Prisma
    const { prisma } = await import('@/lib/prisma');
    const fullUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      } as any,
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(fullUser);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar con Zod
    const validated = updateUserSchema.parse(body);

    // Verificar que el usuario existe
    const existingUser = await userDB.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se actualiza el email, verificar que no esté en uso por otro usuario
    if (validated.email && validated.email !== existingUser.email) {
      const emailUser = await userDB.findByEmail(validated.email);
      if (emailUser && emailUser.id !== id) {
        return NextResponse.json(
          { error: 'El email ya está en uso por otro usuario' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<{
      name?: string;
      email?: string;
      password?: string;
      role?: 'admin' | 'emprendedores' | 'usuarios_regulares';
      status?: string;
    }> = {};
    if (validated.name) updateData.name = validated.name;
    if (validated.email) updateData.email = validated.email;
    if (validated.role) updateData.role = validated.role;
    if (validated.status) updateData.status = validated.status;
    
    // Si se actualiza la contraseña, hashearla
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 10);
    }

    // Actualizar usuario
    const updatedUser = await userDB.update(id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // No retornar contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un usuario (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    // Verificar que el usuario existe
    const user = await userDB.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el propio usuario
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Eliminar usuario
    const deleted = await userDB.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}


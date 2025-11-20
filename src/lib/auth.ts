// Configuración de NextAuth

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { userDB } from './db';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { loginSchema } from './validations';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Confiar en el host (necesario para Docker)
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validar con Zod
          const validated = loginSchema.parse(credentials);
          
          // Buscar usuario
          const user = await userDB.findByEmail(validated.email);
          if (!user) {
            return null;
          }
          
          // Verificar contraseña
          const isValid = await bcrypt.compare(validated.password, user.password);
          if (!isValid) {
            return null;
          }
          
          // Verificar que el usuario tenga la cuenta activa y verificada
          const fullUser = await prisma.user.findUnique({
            where: { email: validated.email },
          });
          
          if (!fullUser) {
            return null;
          }
          
          if (fullUser.status !== 'active' || !fullUser.emailVerified) {
            throw new Error('Tu cuenta no está verificada. Por favor verifica tu email antes de iniciar sesión.');
          }
          
          // Retornar usuario (sin la contraseña)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || 'tu-secret-key-super-segura-cambiar-en-produccion',
});


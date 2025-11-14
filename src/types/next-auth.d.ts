// Extensión de tipos para NextAuth

import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id?: string;
  }
}


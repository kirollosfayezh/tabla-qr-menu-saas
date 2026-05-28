import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: 'OWNER' | 'ADMIN';
    };
  }
  interface User {
    role?: 'OWNER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    role?: 'OWNER' | 'ADMIN';
    /** Epoch ms when role was last re-read from the DB. */
    roleRefreshedAt?: number;
  }
}

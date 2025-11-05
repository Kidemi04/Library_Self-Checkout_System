import type { DefaultSession } from 'next-auth';

type AppRole = 'user' | 'staff' | 'admin';

declare module 'next-auth' {
  interface Session {
    user: (DefaultSession['user'] & {
      id?: string;
      role?: AppRole;
    }) | null;
  }

  interface User {
    id?: string;
    role?: AppRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AppRole;
  }
}

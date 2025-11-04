import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string;
      role?: string;
    };
  }

  interface JWT {
    email?: string;
    role?: string;
  }
}

import NextAuth from "next-auth";
import NeonAdapter from "@auth/pg-adapter";
import { Pool } from "@neondatabase/serverless";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  return {
    adapter: NeonAdapter(pool),
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async session({ session, token }) {
        if (token?.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
    ...authConfig,
  };
});

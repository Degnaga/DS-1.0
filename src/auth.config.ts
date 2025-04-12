import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInSchema } from "./lib/validation";
import { checkUserCredentials } from "./lib/actions";

export default {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const parsed = signInSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("Validation failed:", parsed.error);
            return null;
          }

          const { email, password } = parsed.data;
          const user = await checkUserCredentials(email, password);
          if (!user) {
            console.error("User not found or invalid credentials");
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("Please verify your email before signing in");
          }

          return { id: user.id, email: user.email };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

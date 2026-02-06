import NextAuth, { type NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/db/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  logger: {
    error(code, metadata) {
      console.error("next-auth error", code, metadata);
    },
    warn(code) {
      console.warn("next-auth warn", code);
    },
    debug(code, metadata) {
      console.debug("next-auth debug", code, metadata);
    }
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    }
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
    })
  ]
};

export async function auth() {
  return getServerSession(authOptions);
}

export const handler = NextAuth(authOptions);

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { prisma } from "./lib/db";
import { getUserByEmail } from "./modules/auth/actions";

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account}) {
      if (!user || !account) return false;


      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,

            accounts: {
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refreshToken: account.refresh_token,
                accessToken: account.access_token,
                expiresAt: account.expires_at,
                tokenType: account.token_type,
                scope: account.scope,
                idToken: account.id_token,
                sessionState: account.session_state?.toString(),
              },
            },
          },
        });

        if (!newUser) return false;
        }
        else {
            // Update existing user with fresh OAuth data
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name,
                image: user.image,
              },
            });

            const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                },
            },
            });
            if (!existingAccount) {
                await prisma.account.create({
                    data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    refreshToken: account.refresh_token,
                    accessToken: account.access_token,
                    expiresAt: account.expires_at,
                    tokenType: account.token_type,
                    scope: account.scope,
                    idToken: account.id_token,
                    sessionState: account.session_state?.toString(),
                    },
                });
            }
        }
      return true;
    },

    async jwt({ token, user, trigger }) {
        if (user) {
            token.name = user.name;
            token.email = user.email;
            token.image = user.image;

            if (user.email) {
                const dbUser = await getUserByEmail(user.email);
                if (dbUser) {
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                    token.image = dbUser.image;
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                }
            }
            return token;
        }

        // On subsequent requests, refresh from DB
        if (token.email) {
            const dbUser = await getUserByEmail(token.email as string);

            if (dbUser) {
                token.name = dbUser.name;
                token.email = dbUser.email;
                token.image = dbUser.image;
                token.role = dbUser.role;
                token.id = dbUser.id;
            }
        }

        return token;
    },

    async session({ session, token }) {
      if(session.user){
        session.user.id = (token.id as string) || token.sub || "";
        session.user.role = token.role;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})
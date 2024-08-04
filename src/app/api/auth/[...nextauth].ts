import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';

import { UserInfoProps } from '@/app/next-auth';
import { signInUser } from '@/app/auth/hooks';
import { getUserProfile } from '@/app/dashboard/profile/hooks';

const nextAuthConfig: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 0.5 * 24 * 60 * 60, // 12 hours
  },
  jwt: {
    maxAge: 0.5 * 24 * 60 * 60, // 12 hours
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password, signInToken } = credentials as Record<
          string,
          string
        >;

        try {
          // Handle sign-in with token (e.g., from passwordless sign-in or external source)
          if (signInToken) {
            const res = await getUserProfile(signInToken);
            if (!res.success) {
              throw new Error(res.message || 'Failed to fetch user profile.');
            }
            return { ...res.data, access_token: signInToken };
          }

          // Handle sign-in with email and password
          const res = await signInUser({ email, password });
          if (!res.success) {
            throw new Error(res.message || 'Failed to sign in.');
          }

          const token = res.data.token;
          const user = jwtDecode<UserInfoProps>(token);
          return { ...user, access_token: token };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Invalid login credentials.');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Update token during session update
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      // Initial sign-in: save user information in token
      if (user) {
        token = { ...token, ...user };
      }

      //   // Handle token expiration
      //   const tokenExpiry = dayjs(token.exp * 1000); // Assuming JWT has `exp` field
      //   if (dayjs().isAfter(tokenExpiry.subtract(30, 'minutes'))) {
      //     // Refresh the token if it's about to expire in less than 30 minutes
      //     // Implement your token refresh logic here (if supported by your API)
      //   }

      return token;
    },
    async session({ session, token }) {
      session.user = token as any; // Cast to any to include custom properties
      session.access_token = token.access_token;
      session.expires = dayjs().add(12, 'hours').toISOString();

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(nextAuthConfig);

export { handler as GET, handler as POST };

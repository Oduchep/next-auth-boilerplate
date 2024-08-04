import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { UserInfoProps } from '@/app/next-auth';
import { signInUser } from '@/app/auth/hooks';
import { getUserProfile } from '@/app/dashboard/profile/hooks';

const nextAuthConfig: NextAuthOptions = {
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
          if (signInToken) {
            const res = await getUserProfile(signInToken);
            if (!res.data.success) {
              throw new Error(
                res.data.message || 'Failed to fetch user profile.',
              );
            }
            return { ...res.data.data, access_token: signInToken };
          }

          const res = await signInUser({ email, password });
          if (!res.data.success) {
            throw new Error(res.data.message || 'Failed to sign in.');
          }

          const token = res.data.data.tokenEncryption;
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
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      if (user) {
        token = { ...token, ...user };
      }

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

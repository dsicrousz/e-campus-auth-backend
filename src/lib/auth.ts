import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { admin } from 'better-auth/plugins/admin';
import { ac, roles } from '../auth/access-control';
import 'dotenv/config';

const mongoUrl =
  process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/auth-service';
const client = new MongoClient(mongoUrl);
const db = client.db();

// const resend = new Resend(process.env.RESEND_API);

export const auth: any = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },
  socialProviders: {
    google: {
      disableSignUp: true,
      disableImplicitSignUp: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  experimental: {
    joins: true,
  },
  secret:
    process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  baseURL: process.env.APP_URL,
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [], // Specific origin instead of wildcard
    credentials: true, // Allow credentials
  },
  trustedOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'https://ecampus.crousz.com',
    'https://ecampusauth.crousz.com',
  ],
  advanced: {
    cookiePrefix: 'better-auth',
    crossSubDomainCookies: {
      enabled: true,
      domain: '.crousz.com',
    },
  },
  plugins: [
    admin({
      adminRoles: ['admin', 'superadmin'],
      ac,
      roles,
    }),
  ],
});

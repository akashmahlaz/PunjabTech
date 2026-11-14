import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; //  drizzle instance
import * as schema from "@/drizzle/schema"
import { admin } from "better-auth/plugins"



export const auth = betterAuth({
    plugins: [
        admin()
    ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
});


import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"

// We'll lazy load prisma only where needed or pass it from auth.ts
// But for config in middleware, we stick to providers that don't need DB or partials.

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout')
            const isOnLogin = nextUrl.pathname.startsWith('/login')
            const isOnRegister = nextUrl.pathname.startsWith('/register')

            if (isOnAdmin) {
                if (isLoggedIn && auth.user.role === 'ADMIN') return true
                return false // Redirect to login
            }

            if (isOnCheckout) {
                if (isLoggedIn) return true
                return false // Redirect to login
            }

            // Allow access to login/register pages only if not logged in (optional preference)
            // if ((isOnLogin || isOnRegister) && isLoggedIn) {
            //   return Response.redirect(new URL('/', nextUrl))
            // }

            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                session.user.role = token.role as string
            }
            // Style Preferences
            if (session.user) {
                const user = session.user as any
                user.favoriteStyle = token.favoriteStyle || null
                user.headSize = token.headSize || null
                user.favoriteMaterial = token.favoriteMaterial || null
            }
            return session
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id
                token.role = (user as any).role
                token.favoriteStyle = (user as any).favoriteStyle
                token.headSize = (user as any).headSize
                token.favoriteMaterial = (user as any).favoriteMaterial
            }
            return token
        }
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            async authorize(credentials) {
                // Logic to verify credentials
                // We need to access the database here.
                // In NextAuth v5, this runs in Node environment usually so we can import prisma.
                // But we need to handle the cyclic dependency if we put this in a separate file from prisma.
                return null; // Implemented in auth.ts to avoid edge issues if needed, or we implement here assuming node 
            }
        })
    ],
} satisfies NextAuthConfig

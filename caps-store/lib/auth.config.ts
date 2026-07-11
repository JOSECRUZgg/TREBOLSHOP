
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout')

            if (isOnAdmin) {
                if (isLoggedIn && (auth.user as any)?.role === 'ADMIN') return true
                return false
            }

            if (isOnCheckout) {
                if (isLoggedIn) return true
                return false
            }

            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                (session.user as any).role = token.role as string
            }
            if (session.user) {
                const user = session.user as any
                user.favoriteStyle = token.favoriteStyle || null
                user.headSize = token.headSize || null
                user.favoriteMaterial = token.favoriteMaterial || null
            }
            return session
        },
        async jwt({ token, user }) {
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
    ],
} satisfies NextAuthConfig

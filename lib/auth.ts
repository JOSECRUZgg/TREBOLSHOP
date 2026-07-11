
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours fallback for the token itself
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                // By OMITTING maxAge here, it becomes a session cookie
            },
        },
    },
    ...authConfig,
    providers: [
        ...authConfig.providers.filter((p: any) => p.id !== 'credentials'),
        Credentials({
            async authorize(credentials) {
                try {
                    const email = credentials.email as string
                    const password = credentials.password as string

                    if (!email || !password) return null

                    const user = await prisma.user.findUnique({ where: { email } })
                    console.log('--- LOGIN DEBUG ---')
                    console.log('Email:', email)
                    console.log('User found:', !!user)

                    if (!user || !user.password) {
                        console.log('No user or no password in DB')
                        return null
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    console.log('Passwords match:', passwordsMatch)

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            favoriteStyle: (user as any).favoriteStyle,
                            headSize: (user as any).headSize,
                            favoriteMaterial: (user as any).favoriteMaterial,
                        } as any
                    }

                    return null
                } catch (error) {
                    console.error('CRITICAL ERROR IN AUTHORIZE:', error)
                    return null
                }
            }
        })
    ],
})

// Compatibility helper
export const getSession = async () => {
    return await auth();
}

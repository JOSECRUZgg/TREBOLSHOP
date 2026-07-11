import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET (length: " + process.env.AUTH_SECRET.length + ")" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET (length: " + process.env.NEXTAUTH_SECRET.length + ")" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
  })
}

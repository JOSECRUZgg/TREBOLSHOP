# Trebol Shop

Tienda en linea de gorras - E-Commerce con Next.js 16, Prisma, Supabase y NextAuth.

Para documentacion completa, ver [`caps-store/README.md`](caps-store/README.md)

## Quick Start

```bash
cd caps-store
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001)

## Deploy en Vercel

1. Conectar repo en [vercel.com](https://vercel.com)
2. Root directory: `caps-store`
3. Configurar variables de entorno (ver `caps-store/README.md`)
4. Deploy

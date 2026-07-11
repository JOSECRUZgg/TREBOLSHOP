import { getProducts, ProductFilters } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { getQualities, getStyles, getCategories } from "@/lib/attribute-actions"
import { ProductCard } from "@/components/product-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, TrendingUp } from "lucide-react"

export default async function Home({ searchParams }: { searchParams: Promise<ProductFilters> }) {
  const params = await searchParams
  const { products } = await getProducts(params)
  const session = await auth()

  const [qualities, styles, categories] = await Promise.all([
    getQualities(),
    getStyles(),
    getCategories()
  ])

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-orange-100 selection:text-orange-900">
      <Header session={session} />

      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Hero Section - Premium Overhaul */}
        {!params.quality && !params.subcategory && !params.style && !params.query && (
          <div className="mb-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-[2.5rem] bg-black px-8 py-16 md:px-16 md:py-32 text-center overflow-hidden shadow-2xl">
              {/* Dynamic Background Elements */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-red-600/10 rounded-full blur-[120px]"></div>

              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <div className="flex items-center gap-2 mb-8 animate-in slide-in-from-top duration-700">
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1.5 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest flex gap-2">
                    <Sparkles className="h-3 w-3" />
                    Nuevos ingresos 2026
                  </Badge>
                  <Badge className="bg-white/5 text-white/50 border-white/10 px-4 py-1.5 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest hidden sm:flex gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Edición Limitada
                  </Badge>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.95] animate-in zoom-in duration-1000">
                  ELEVA TU <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-500 drop-shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                    ESTILO
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
                  Descubre nuestra colección exclusiva de gorras premium. Diseñadas para quienes exigen excelencia en cada detalle.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in slide-in-from-bottom duration-1000 delay-500">
                  <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-orange-50 transition-all px-10 text-lg h-14 font-black shadow-xl hover:shadow-orange-500/10">
                    <Link href="/?quality=Premium">EXPLORAR PREMIUM</Link>
                  </Button>
                  <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-slate-200 transition-all px-10 text-lg h-14 font-black shadow-xl">
                    <Link href="/?subcategory=SNAPBACK">VER SNAPBACK</Link>
                  </Button>
                </div>
              </div>

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Filters - Sticky and refined */}
          <aside className="w-full md:w-56 shrink-0 space-y-10 md:sticky md:top-24 md:h-[calc(100vh-8rem)] overflow-y-auto pt-2 hidden md:block">
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-900 tracking-tight">Categorías</h3>
              <div className="space-y-3 flex flex-col text-slate-600">
                <Link href="/" className={`hover:text-amber-600 transition-colors ${!params.quality ? "font-bold text-black" : ""}`}>Todas las Categorías</Link>
                {qualities.length > 0 ? (
                  qualities.map((q: any) => (
                    <Link key={q.id} href={`/?quality=${q.name}`} className={`hover:text-amber-600 transition-colors ${params.quality === q.name ? "font-bold text-black" : ""}`}>
                      {q.name}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/?quality=Básica" className={`hover:text-amber-600 transition-colors ${params.quality === 'Básica' ? "font-bold text-black" : ""}`}>Básica</Link>
                    <Link href="/?quality=Estándar" className={`hover:text-amber-600 transition-colors ${params.quality === 'Estándar' ? "font-bold text-black" : ""}`}>Estándar</Link>
                    <Link href="/?quality=Premium" className={`hover:text-amber-600 transition-colors ${params.quality === 'Premium' ? "font-bold text-black" : ""}`}>Premium</Link>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-900 tracking-tight">Estilos</h3>
              <div className="space-y-3 flex flex-col text-slate-600">
                {styles.length > 0 ? (
                  styles.map((s: any) => (
                    <Link key={s.id} href={`/?subcategory=${s.name}`} className={`hover:text-amber-600 transition-colors ${params.subcategory === s.name ? "font-bold text-black" : ""}`}>
                      {s.name}
                    </Link>
                  ))
                ) : (
                  ['Snapback', 'Trucker', 'Dad Hat', 'Fitted', 'Strapback', 'Beanie', 'Diseñador'].map(sub => (
                    <Link key={sub} href={`/?subcategory=${sub}`} className={`hover:text-amber-600 transition-colors ${params.subcategory === sub ? "font-bold text-black" : ""}`}>
                      {sub}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-900 tracking-tight">Colección</h3>
              <div className="space-y-3 flex flex-col text-slate-600">
                {categories.length > 0 ? (
                  categories.map((c: any) => (
                    <Link key={c.id} href={`/?style=${c.name}`} className={`hover:text-amber-600 transition-colors ${params.style === c.name ? "font-bold text-black" : ""}`}>
                      {c.name}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/?style=Urbana" className={`hover:text-amber-600 transition-colors ${params.style === 'Urbana' ? "font-bold text-black" : ""}`}>Urbana</Link>
                    <Link href="/?style=Deportiva" className={`hover:text-amber-600 transition-colors ${params.style === 'Deportiva' ? "font-bold text-black" : ""}`}>Deportiva</Link>
                    <Link href="/?style=Edición Limitada" className={`hover:text-amber-600 transition-colors ${params.style === 'Edición Limitada' ? "font-bold text-black" : ""}`}>Edición Limitada</Link>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid - Centered */}
          <div className="flex-1">
            <div className="mb-8 flex items-end justify-between border-b pb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight capitalize">
                  {params.query ? `Buscando: "${params.query}"` : (params.subcategory || params.quality || 'Todos los Productos')}
                </h2>
                <p className="text-slate-500 mt-2">
                  Mostrando {products.length} resultados
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-32">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No se encontraron productos</h3>
                <p className="text-slate-500 mt-1">Prueba cambiando los filtros o el término de búsqueda.</p>
                <Button variant="link" className="mt-4 text-amber-600" asChild>
                  <Link href="/">Limpiar filtros</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 justify-items-center sm:justify-items-stretch">
                {products.map((product) => (
                  <div key={product.id} className="w-full h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

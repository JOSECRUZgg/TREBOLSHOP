import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Target, Eye, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { auth } from "@/lib/auth"

export default async function AboutPage() {
    const session = await auth()

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-orange-100 selection:text-orange-900 flex flex-col">
            <Header session={session} />

            <main className="flex-grow">
                <div className="relative bg-black py-20 overflow-hidden">
                    {/* Abstract Background Design */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-red-600/10 rounded-full blur-[120px]"></div>
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1.5 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest gap-2 inline-flex items-center">
                            <Sparkles className="h-3 w-3" />
                            Nuestra Historia
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 animate-in slide-in-from-bottom duration-700">
                            SOBRE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-500">NOSOTROS</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed animate-in slide-in-from-bottom duration-700 delay-150">
                            Conoce la visión y misión que impulsan a Trebol Shop a ser tu mejor opción en estilo y calidad.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-10 relative z-20 pb-20">
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
                        {/* Vision Card */}
                        <Card className="border-none shadow-2xl shadow-orange-900/5 bg-white overflow-hidden group animate-in slide-in-from-bottom duration-700 delay-300">
                            <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                            <CardContent className="p-8 md:p-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Eye className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">VISIÓN</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    Ser referente en el comercio de gorras en mayoreo y menudeo a nivel estatal y del bajío del país.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Mission Card */}
                        <Card className="border-none shadow-2xl shadow-orange-900/5 bg-white overflow-hidden group animate-in slide-in-from-bottom duration-700 delay-500">
                            <div className="h-1.5 bg-gradient-to-r from-slate-800 to-black"></div>
                            <CardContent className="p-8 md:p-10">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 text-slate-800 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Target className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">MISIÓN</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    Ser la mejor opción para ti que buscas un accesorio para tu día a día o ser tus compañeros ideales para que inicies tu negocio.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Section */}
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-700 delay-700">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-4">CONTÁCTANOS</h2>
                            <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Location */}
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Ubicación</h3>
                                <p className="text-slate-500 text-sm">
                                    Moroléon, Guanajuato<br />
                                    México
                                </p>
                            </div>

                            {/* Phone/WhatsApp */}
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Teléfono</h3>
                                <p className="text-slate-500 text-sm">
                                    +52 445 123 4567<br />
                                    Lunes a Viernes 9am - 6pm
                                </p>
                            </div>

                            {/* Social Media */}
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Redes Sociales</h3>
                                <div className="flex gap-4 mt-2">
                                    <a href="#" className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="p-2 bg-slate-50 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

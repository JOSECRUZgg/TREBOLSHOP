import Link from "next/link"
import { Instagram, MapPin, Mail, MessageCircle } from "lucide-react"

// Simple TikTok Icon component since Lucide doesn't have it
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height="1em"
        width="1em"
        className={className}
    >
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
)

export function Footer() {
    return (
        <footer className="bg-black text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            TREBOL SHOP
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Tu destino premium para gorras exclusivas y estilo urbano. Calidad y diseño en cada detalle.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-white/90">Contacto</h3>
                        <div className="space-y-3 text-sm text-slate-400">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>
                                    Calle 21 de Marzo #23<br />
                                    Centro Amealco de Bonfil, Qro.
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                                <a href="mailto:shoptrebol1111@gmail.com" className="hover:text-emerald-400 transition-colors">
                                    shoptrebol1111@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <a href="https://api.whatsapp.com/message/QDRGDET2YVQZE1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-white/90">Síguenos</h3>
                        <div className="flex flex-col gap-4 text-sm text-slate-400">
                            <a
                                href="https://instagram.com/trebol.shop_1111"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 group hover:text-white transition-colors"
                            >
                                <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                                    <Instagram className="w-5 h-5 text-emerald-500" />
                                </div>
                                <span className="font-medium">trebol.shop_1111</span>
                            </a>

                            <a
                                href="https://tiktok.com/@trebolshop_1111"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 group hover:text-white transition-colors"
                            >
                                <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                                    <TikTokIcon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <span className="font-medium">trebolshop_1111</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 text-center text-xs text-slate-600">
                    <p>&copy; {new Date().getFullYear()} Trebol Shop. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}

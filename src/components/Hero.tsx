import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface HeroProps {
  settings: StoreSettings;
  onExploreCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreCatalog }) => {
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  return (
    <section
      id="hero"
      className="relative w-full min-h-[calc(100dvh-80px)] sm:min-h-[calc(100vh-90px)] flex flex-col items-center justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-[#EBE6DD] dark:border-[#3D322B] bg-[#FAF8F5] dark:bg-[#1A1614]"
    >
      {/* Top spacer for vertical centering balance */}
      <div className="w-full h-2 sm:h-6" />

      {/* Main Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto space-y-6 sm:space-y-8 flex flex-col items-center justify-center relative z-10 my-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] text-xs sm:text-sm font-semibold uppercase tracking-wider border border-[#4B5A36]/20 dark:border-[#809761]/30"
        >
          <span>Tradición & Calidad Artesanal</span>
        </motion.div>

        <h1 className="font-serif-title text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2C221E] dark:text-[#F4EFEA] leading-[1.12]">
          Disfrutá <span className="italic font-normal text-[#4B5A36] dark:text-[#809761]">lo natural</span>
        </h1>

        <p className="text-base sm:text-xl text-[#62534C] dark:text-[#C5B9B0] max-w-xl leading-relaxed font-normal">
          Mates artesanales y yerbas seleccionadas para acompañar el ritual de cada cebada.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full sm:w-auto">
          <button
            onClick={onExploreCatalog}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#96AD76] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-95 text-base"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-semibold px-7 py-4 rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer active:scale-95 text-base"
          >
            <MessageCircle className="w-5 h-5 text-[#4B5A36] dark:text-[#809761]" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={onExploreCatalog}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-6 flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#62534C] dark:text-[#C5B9B0] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer group py-2"
        aria-label="Desplazarse al catálogo"
      >
        <span>Descubrí la tienda</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#4B5A36] dark:text-[#809761]" />
        </motion.div>
      </motion.button>
    </section>
  );
};



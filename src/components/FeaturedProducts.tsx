import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Sparkles, MessageCircle, Eye, Tag, Check } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { buildWhatsAppUrl, trackEvent } from '../services/api';
import { OptimizedImage } from './OptimizedImage';

interface FeaturedProductsProps {
  products: Product[];
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, settings, onSelectProduct }) => {
  const featured = products.filter(p => p.featured && p.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Auto-advance loop every 4 seconds when not hovered
  useEffect(() => {
    if (isHovered || featured.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, featured.length, nextSlide]);

  if (featured.length === 0) return null;

  // Infinite cyclic index wrap
  const safeIndex = ((currentIndex % featured.length) + featured.length) % featured.length;
  const currentProduct = featured[safeIndex];

  const goToSlide = (index: number) => {
    setDirection(index > safeIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    currentProduct.name,
    currentProduct.price,
    undefined,
    currentProduct.category,
    settings.categoryWhatsAppMessages
  );

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('whatsapp_click', {
      productId: currentProduct.id,
      productName: currentProduct.name,
      category: currentProduct.category,
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProduct(currentProduct);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.97,
    }),
  };

  const getStockBadgeClass = (status: string) => {
    switch (status) {
      case 'Últimas unidades':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200';
      case 'Agotado':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-200';
      case 'Próximamente':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-200 border-sky-200';
      default:
        return 'bg-[#4B5A36]/10 text-[#4B5A36] dark:bg-[#809761]/20 dark:text-[#809761] border-[#4B5A36]/20';
    }
  };

  return (
    <section className="py-6 sm:py-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-1.5">
              <span>Destacados de la semana</span>
              <Star className="w-4 h-4 fill-[#4B5A36] text-[#4B5A36] dark:fill-[#809761] dark:text-[#809761]" />
            </h2>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            className="p-2 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B] bg-white dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#4B5A36] hover:text-white dark:hover:bg-[#809761] dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
            aria-label="Anterior destacado"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="p-2 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B] bg-white dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#4B5A36] hover:text-white dark:hover:bg-[#809761] dark:hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
            aria-label="Siguiente destacado"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleek Compact Card Box */}
      <div
        className="relative bg-white dark:bg-[#241E1B] rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-sm overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentProduct.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = offset.x * velocity.x;
              if (offset.x < -40 || swipe < -600) nextSlide();
              else if (offset.x > 40 || swipe > 600) prevSlide();
            }}
            className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center select-none"
          >
            {/* Product Image */}
            <div
              onClick={handleViewProduct}
              className="sm:col-span-5 relative w-full rounded-xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] group cursor-pointer"
            >
              <OptimizedImage
                src={currentProduct.image}
                alt={currentProduct.name}
                aspectRatio="16/10"
                priority={true}
                imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, 40vw"
              />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                <span className="bg-[#4B5A36] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Destacado</span>
                </span>
                {currentProduct.stockStatus && currentProduct.stockStatus !== 'Disponible' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStockBadgeClass(currentProduct.stockStatus)}`}>
                    {currentProduct.stockStatus}
                  </span>
                )}
              </div>

              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 dark:bg-[#241E1B]/90 text-[#2C221E] dark:text-[#F4EFEA] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761]" />
                  <span>Ver Producto</span>
                </span>
              </div>
            </div>

            {/* Product Details - Fixed uniform height column */}
            <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-2.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 h-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5A36] dark:text-[#809761] bg-[#4B5A36]/10 dark:bg-[#809761]/20 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {currentProduct.category}
                  </span>
                </div>

                <h3
                  onClick={handleViewProduct}
                  className="font-serif-title text-base sm:text-lg font-bold text-[#2C221E] dark:text-[#F4EFEA] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer line-clamp-1 h-7 flex items-center"
                >
                  {currentProduct.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#BAACA2] line-clamp-2 h-9">
                  {currentProduct.subtitle || 'Artesanía de primera calidad seleccionada especialmente.'}
                </p>
              </div>

              {/* Feature pills - Fixed height container */}
              <div className="h-7 flex items-center">
                <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-7">
                  {currentProduct.features && currentProduct.features.length > 0 ? (
                    currentProduct.features.slice(0, 3).map((feat, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-[#5C4F48] dark:text-[#D1C7BD] whitespace-nowrap"
                      >
                        <Check className="w-3 h-3 text-[#4B5A36] dark:text-[#809761] shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-[#5C4F48] dark:text-[#D1C7BD] whitespace-nowrap">
                      <Check className="w-3 h-3 text-[#4B5A36] dark:text-[#809761] shrink-0" />
                      <span>Calidad Garantizada</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Price Row */}
              <div className="pt-2 border-t border-[#F2EFE9] dark:border-[#3D322B] flex items-baseline gap-2.5 h-8">
                <span className="font-serif-title font-bold text-lg sm:text-xl text-[#2C221E] dark:text-[#F4EFEA]">
                  ${currentProduct.price.toLocaleString('es-AR')}
                </span>
                {currentProduct.originalPrice && (
                  <span className="text-xs sm:text-sm text-[#9C8F87] dark:text-[#8C7D73] line-through">
                    ${currentProduct.originalPrice.toLocaleString('es-AR')}
                  </span>
                )}
                {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    -${(currentProduct.originalPrice - currentProduct.price).toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#4B5A36] hover:bg-[#3A4729] dark:bg-[#809761] dark:hover:bg-[#6D8350] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Consultar</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewProduct}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2A231F] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Eye className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761]" />
                  <span>Ver Detalle</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Infinite Dots */}
      {featured.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3.5">
          {featured.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                safeIndex === idx
                  ? 'w-7 bg-[#4B5A36] dark:bg-[#809761]'
                  : 'w-2 bg-[#EBE6DD] dark:bg-[#3D322B] hover:bg-[#4B5A36]/40 dark:hover:bg-[#809761]/40'
              }`}
              aria-label={`Ir al producto destacado ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

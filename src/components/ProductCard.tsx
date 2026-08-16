import React, { memo } from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { buildWhatsAppUrl, trackEvent } from '../services/api';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = memo(({ product, settings, onSelectProduct, index = 0 }) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    product.name,
    product.price,
    undefined,
    product.category,
    settings.categoryWhatsAppMessages
  );

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('whatsapp_click', {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const getStockBadgeClass = (status: string) => {
    switch (status) {
      case 'Últimas unidades':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/50';
      case 'Agotado':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800/50';
      case 'Próximamente':
        return 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProduct(product);
  };

  const showStockBadge = product.stockStatus && product.stockStatus !== 'Disponible';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.55,
        delay: (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#241E1B] rounded-2xl p-3 sm:p-4 border border-[#EBE6DD] dark:border-[#3D322B] hover:border-[#4B5A36]/50 dark:hover:border-[#809761]/60 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Product Image Box */}
        <div className="relative rounded-xl overflow-hidden mb-3 sm:mb-4 z-0">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            aspectRatio="square"
            priority={index < 4}
            imgClassName="group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges - Only show special status if not 'Disponible' */}
          {showStockBadge && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStockBadgeClass(product.stockStatus)}`}>
                {product.stockStatus}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#7C6E65] dark:text-[#BAACA2] uppercase tracking-wider block">
            {product.category}
          </span>
          <h3 className="font-semibold text-sm sm:text-base text-[#2C221E] dark:text-[#F4EFEA] group-hover:text-[#4B5A36] dark:group-hover:text-[#809761] transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="text-xs text-[#7C6E65] dark:text-[#A89B91] line-clamp-1">{product.subtitle}</p>
          )}
        </div>
      </div>

      {/* Price & WhatsApp Action */}
      <div className="pt-3 mt-2 border-t border-[#F2EFE9] dark:border-[#3D322B] flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base sm:text-lg text-[#2C221E] dark:text-[#F4EFEA]">
              ${product.price.toLocaleString('es-AR')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#9C8F87] dark:text-[#8C7D73] line-through">
                ${product.originalPrice.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleWhatsAppClick}
          className="w-9 h-9 rounded-full bg-[#4B5A36]/10 dark:bg-[#809761]/20 hover:bg-[#4B5A36] dark:hover:bg-[#809761] text-[#4B5A36] dark:text-[#809761] hover:text-white dark:hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
          title="Consultar por WhatsApp"
          aria-label={`Consultar por WhatsApp sobre ${product.name}`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
        </button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

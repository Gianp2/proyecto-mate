import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Share2, Check, ShieldCheck } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { buildWhatsAppUrl, trackEvent } from '../services/api';
import { OptimizedImage } from './OptimizedImage';

interface ProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, settings, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      setSelectedImage(product.image);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0].name);
      } else {
        setSelectedVariant('');
      }
      trackEvent('view_product', {
        productId: product.id,
        productName: product.name,
        category: product.category,
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [product, onClose]);

  if (!product) return null;

  const currentPrice = (() => {
    if (!selectedVariant || !product.variants) return product.price;
    const v = product.variants.find((v) => v.name === selectedVariant);
    return product.price + (v?.priceBonus || 0);
  })();

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    product.name,
    currentPrice,
    selectedVariant,
    product.category,
    settings.categoryWhatsAppMessages
  );

  const handleConsultWhatsApp = () => {
    trackEvent('whatsapp_click', {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    trackEvent('share', { productId: product.id, productName: product.name });
    const shareUrl = `${window.location.origin}${window.location.pathname}?producto=${product.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | ${settings.brandName}`,
          text: `Mirá este ${product.name} en ${settings.brandName}:`,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert(`Enlace copiado: ${shareUrl}`);
    }
  };

  const allImages = [product.image, ...(product.secondaryImages || [])];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs"
    >
      {/* Modal Window Container */}
      <motion.div
        key="product-modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 30 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#FAF8F5] dark:bg-[#1A1614] rounded-3xl shadow-2xl border border-[#EBE6DD] dark:border-[#3D322B] w-full max-w-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto"
      >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#EBE6DD] dark:border-[#3D322B] bg-white dark:bg-[#241E1B] sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4B5A36] dark:text-[#809761] uppercase tracking-wider bg-[#4B5A36]/10 dark:bg-[#809761]/20 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-xs font-medium text-[#7C6E65] dark:text-[#BAACA2]">
                {product.stockStatus}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#EFECE6] dark:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#E2DDD3] dark:hover:bg-[#3D322B] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Product Gallery */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
                  <OptimizedImage
                    src={selectedImage || product.image}
                    alt={product.name}
                    aspectRatio="square"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Thumbnails if multiple images exist */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          selectedImage === img ? 'border-[#4B5A36] dark:border-[#809761] shadow-xs' : 'border-[#EBE6DD] dark:border-[#3D322B] opacity-70'
                        }`}
                      >
                        <OptimizedImage src={img} alt="" aspectRatio="square" sizes="56px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                    {product.name}
                  </h2>
                  {product.subtitle && (
                    <p className="text-sm font-medium text-[#7C6E65] dark:text-[#BAACA2] mt-1">{product.subtitle}</p>
                  )}
                </div>

                {/* Price Box */}
                <div className="flex items-baseline gap-3 p-3 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B]">
                  <span className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                    ${currentPrice.toLocaleString('es-AR')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#9C8F87] dark:text-[#8C7D73] line-through">
                      ${product.originalPrice.toLocaleString('es-AR')}
                    </span>
                  )}
                  <span className="ml-auto text-xs font-semibold text-[#4B5A36] dark:text-[#809761] bg-[#4B5A36]/10 dark:bg-[#809761]/20 px-2.5 py-1 rounded-full">
                    Consultar stock
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#5C4F48] dark:text-[#C5B9B0] leading-relaxed">
                  {product.fullDescription || product.description}
                </p>

                {/* Features List */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#EBE6DD] dark:border-[#3D322B]">
                    <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider block">
                      Características destacadas:
                    </span>
                    <ul className="space-y-1.5">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#5C4F48] dark:text-[#C5B9B0]">
                          <Check className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Variants Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#EBE6DD] dark:border-[#3D322B]">
                    <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider block">
                      Opción / Variante:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedVariant === variant.name
                              ? 'bg-[#4B5A36] dark:bg-[#809761] text-white shadow-xs'
                              : 'bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#5C4F48] dark:text-[#C5B9B0] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622]'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[#EBE6DD] dark:border-[#3D322B] flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConsultWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#96AD76] text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>Consultar por WhatsApp</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-semibold py-3.5 px-5 rounded-2xl transition-all active:scale-98 cursor-pointer text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />}
                <span>{copied ? '¡Enlace copiado!' : 'Compartir producto'}</span>
              </button>
            </div>
          </div>
        </motion.div>
    </div>
  );
};

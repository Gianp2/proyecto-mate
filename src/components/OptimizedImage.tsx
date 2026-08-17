import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  aspectRatio?: 'square' | 'video' | '4/3' | '16/10' | '16/9' | string | number;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Transforms image URL to WebP format if supported (e.g., Unsplash URLs).
 */
export function getWebpSource(url: string, width?: number, quality: number = 80): string {
  if (!url) return '';
  
  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('q', quality.toString());
      if (width) {
        urlObj.searchParams.set('w', width.toString());
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Generates responsive webp srcset for Unsplash or supported image services.
 */
export function generateWebpSrcSet(url: string): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) {
    return undefined;
  }

  const widths = [320, 640, 960, 1200, 1600];
  return widths
    .map((w) => `${getWebpSource(url, w, 80)} ${w}w`)
    .join(', ');
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  aspectRatio = 'square',
  priority = false,
  className = '',
  imgClassName = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fallbackSrc,
  objectFit = 'cover',
  onLoad,
  onError,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Determine aspect ratio class or inline style
  const getAspectRatioStyle = (): React.CSSProperties => {
    if (typeof aspectRatio === 'number') {
      return { aspectRatio: `${aspectRatio}` };
    }
    if (typeof aspectRatio === 'string') {
      switch (aspectRatio) {
        case 'square':
          return { aspectRatio: '1 / 1' };
        case 'video':
        case '16/9':
          return { aspectRatio: '16 / 9' };
        case '4/3':
          return { aspectRatio: '4 / 3' };
        case '16/10':
          return { aspectRatio: '16 / 10' };
        default:
          return aspectRatio.includes('/') ? { aspectRatio } : {};
      }
    }
    return { aspectRatio: '1 / 1' };
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    if (onError) onError(e);
  };

  // WebP URL processing
  const computedWebpSrc = webpSrc || (src ? getWebpSource(src, undefined, 80) : undefined);
  const computedWebpSrcSet = generateWebpSrcSet(src);
  const isWebpAvailable = computedWebpSrc && computedWebpSrc !== src;

  return (
    <div
      className={`relative overflow-hidden bg-[#FAF8F5] dark:bg-[#1E1A17] ${className}`}
      style={getAspectRatioStyle()}
    >
      {/* Skeleton / Low Quality Blur Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFECE6] via-[#F5F2EC] to-[#EFECE6] dark:from-[#2A231F] dark:via-[#332B26] dark:to-[#2A231F] animate-pulse z-0" />
      )}

      {/* Fallback View when image fails to load */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F2EFE9] dark:bg-[#28211D] text-[#8C7D73] dark:text-[#A39489] p-2 text-center">
          <ImageOff className="w-6 h-6 mb-1 opacity-70" />
          <span className="text-[10px] font-medium leading-tight">Sin imagen</span>
        </div>
      ) : (
        <picture className="w-full h-full block">
          {/* WebP Source for modern browser optimization */}
          {isWebpAvailable && (
            <source
              type="image/webp"
              srcSet={computedWebpSrcSet || computedWebpSrc}
              sizes={sizes}
            />
          )}

          {/* Standard Fallback img */}
          <img
            src={currentSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full transition-all duration-500 ease-out ${
              isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-102'
            } ${imgClassName}`}
            style={{ objectFit }}
            referrerPolicy="no-referrer"
            {...restProps}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;

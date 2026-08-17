import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

export interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  aspectRatio?:
    | 'square'
    | 'video'
    | '4/3'
    | '16/10'
    | '16/9'
    | string
    | number;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Imagen genérica de respaldo alojada en Unsplash.
 *
 * IMPORTANTE:
 * Si esta imagen también falla, NO se vuelve a intentar.
 * Se muestra el placeholder local para evitar loops infinitos.
 */
const UNSPLASH_FALLBACK =
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80';

/**
 * Transforma una URL de Unsplash para utilizar WebP.
 */
export function getWebpSource(
  url: string,
  width?: number,
  quality: number = 80
): string {
  if (!url) return '';

  try {
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);

      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('q', quality.toString());

      if (width) {
        urlObj.searchParams.set('w', width.toString());
      }

      return urlObj.toString();
    }
  } catch {
    return url;
  }

  return url;
}

/**
 * Genera un srcSet optimizado para Unsplash.
 */
export function generateWebpSrcSet(
  url: string
): string | undefined {
  if (!url || !url.includes('images.unsplash.com')) {
    return undefined;
  }

  const widths = [320, 640, 960, 1200, 1600];

  return widths
    .map((width) => {
      return `${getWebpSource(url, width, 80)} ${width}w`;
    })
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

  /**
   * Guarda qué URLs ya intentamos.
   *
   * Esto evita:
   *
   * imagen → error → fallback → error → fallback → error...
   *
   * y también evita loops de renderizado.
   */
  const attemptedSources = useRef<Set<string>>(new Set());

  /**
   * Indica si ya informamos el error final al componente padre.
   */
  const reportedFinalError = useRef(false);

  /**
   * Reiniciamos solamente cuando cambia realmente la imagen
   * del producto.
   */
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);

    attemptedSources.current = new Set();

    if (src) {
      attemptedSources.current.add(src);
    }

    reportedFinalError.current = false;
  }, [src]);

  /**
   * Aspect ratio.
   */
  const aspectRatioStyle = useMemo((): React.CSSProperties => {
    if (typeof aspectRatio === 'number') {
      return {
        aspectRatio: String(aspectRatio),
      };
    }

    switch (aspectRatio) {
      case 'square':
        return {
          aspectRatio: '1 / 1',
        };

      case 'video':
      case '16/9':
        return {
          aspectRatio: '16 / 9',
        };

      case '4/3':
        return {
          aspectRatio: '4 / 3',
        };

      case '16/10':
        return {
          aspectRatio: '16 / 10',
        };

      default:
        if (typeof aspectRatio === 'string' && aspectRatio.includes('/')) {
          return {
            aspectRatio,
          };
        }

        return {
          aspectRatio: '1 / 1',
        };
    }
  }, [aspectRatio]);

  /**
   * Imagen cargada correctamente.
   */
  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setIsLoaded(true);
    setHasError(false);

    onLoad?.(event);
  };

  /**
   * Error de imagen.
   *
   * Orden:
   *
   * 1. Imagen original
   * 2. fallbackSrc si existe
   * 3. Unsplash genérico
   * 4. Placeholder local
   *
   * Nunca vuelve atrás.
   */
  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const failedUrl = event.currentTarget.currentSrc || currentSrc;

    /**
     * 1. Fallback proporcionado por el componente.
     */
    if (
      fallbackSrc &&
      !attemptedSources.current.has(fallbackSrc)
    ) {
      attemptedSources.current.add(fallbackSrc);

      setIsLoaded(false);
      setCurrentSrc(fallbackSrc);

      return;
    }

    /**
     * 2. Unsplash genérico.
     */
    if (
      !attemptedSources.current.has(UNSPLASH_FALLBACK)
    ) {
      attemptedSources.current.add(UNSPLASH_FALLBACK);

      setIsLoaded(false);
      setCurrentSrc(UNSPLASH_FALLBACK);

      return;
    }

    /**
     * 3. Si también falla Unsplash:
     * mostramos placeholder.
     *
     * No intentamos cargar ninguna otra URL.
     */
    setIsLoaded(false);
    setHasError(true);

    /**
     * Informamos al padre solamente una vez.
     */
    if (!reportedFinalError.current) {
      reportedFinalError.current = true;
      onError?.(event);
    }

    /**
     * Evita que el navegador conserve el src roto.
     */
    if (event.currentTarget.src !== '') {
      event.currentTarget.removeAttribute('src');
    }

    console.warn(
      '[OptimizedImage] No se pudo cargar la imagen:',
      failedUrl
    );
  };

  /**
   * WebP solamente para la imagen actualmente utilizada.
   *
   * No usamos <picture> porque si un <source> falla,
   * el navegador puede seguir intentando el mismo recurso
   * independientemente de currentSrc.
   */
  const computedWebpSrc = useMemo(() => {
    if (webpSrc) {
      return webpSrc;
    }

    return currentSrc
      ? getWebpSource(currentSrc, undefined, 80)
      : '';
  }, [currentSrc, webpSrc]);

  const computedWebpSrcSet = useMemo(() => {
    return generateWebpSrcSet(currentSrc);
  }, [currentSrc]);

  const isUnsplash =
    currentSrc.includes('images.unsplash.com');

  return (
    <div
      className={`relative overflow-hidden bg-[#FAF8F5] dark:bg-[#1E1A17] ${className}`}
      style={aspectRatioStyle}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#EFECE6]
            via-[#F7F4EF]
            to-[#EFECE6]
            dark:from-[#2A231F]
            dark:via-[#332B26]
            dark:to-[#2A231F]
            animate-pulse
          "
          aria-hidden="true"
        />
      )}

      {/* Error definitivo */}
      {hasError ? (
        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            bg-[#F2EFE9]
            dark:bg-[#28211D]
            text-[#8C7D73]
            dark:text-[#A39489]
            p-3
            text-center
          "
        >
          <ImageOff className="w-6 h-6 mb-1.5 opacity-70" />

          <span className="text-[10px] font-medium leading-tight">
            Sin imagen disponible
          </span>
        </div>
      ) : (
        <img
          key={currentSrc}
          src={
            isUnsplash
              ? computedWebpSrc || currentSrc
              : currentSrc
          }
          srcSet={
            isUnsplash
              ? computedWebpSrcSet
              : undefined
          }
          sizes={
            isUnsplash
              ? sizes
              : undefined
          }
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`
            w-full
            h-full
            transition-all
            duration-500
            ease-out
            ${
              isLoaded
                ? 'opacity-100 blur-0 scale-100'
                : 'opacity-0 blur-sm scale-[1.02]'
            }
            ${imgClassName}
          `}
          style={{
            objectFit,
          }}
          referrerPolicy="no-referrer"
          {...restProps}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
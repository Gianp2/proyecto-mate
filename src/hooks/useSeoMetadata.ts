import { useEffect } from 'react';
import { Product, StoreSettings } from '../types';

interface SeoParams {
  currentRoute: 'store' | 'admin-login' | 'admin-dashboard';
  selectedProduct: Product | null;
  activeSection: string;
  settings: StoreSettings;
}

/**
 * Custom hook to dynamically update HTML head document title and SEO meta tags
 * (description, OpenGraph, canonical URL) based on store state, selected product, or active section.
 */
export function useSeoMetadata({
  currentRoute,
  selectedProduct,
  activeSection,
  settings,
}: SeoParams) {
  useEffect(() => {
    const brand = settings.brandName || 'PAMPA';
    const tagline = settings.tagline || 'Mates Artesanales, Yerbas y Accesorios';
    
    let title = `${brand} | ${tagline}`;
    let description =
      'Catálogo exclusivo de mates artesanales de calabaza e imperial, yerbas de estacionamiento natural, bombillas de alpaca y termos. Consultá directo por WhatsApp.';
    let ogImage =
      'https://images.unsplash.com/photo-1598007221295-8e89f2a08c0f?auto=format&fit=crop&w=1200&q=80';

    const currentUrl = window.location.href;

    if (currentRoute === 'admin-login') {
      title = `Iniciar Sesión - Panel Admin | ${brand}`;
      description = `Acceso administrativo para la gestión del catálogo de productos y configuración de ${brand}.`;
    } else if (currentRoute === 'admin-dashboard') {
      title = `Panel de Control Administrador | ${brand}`;
      description = `Gestión de inventario, productos destacados, precios y ajustes generales de la tienda.`;
    } else if (selectedProduct) {
      // Individual product page/modal
      const formattedPrice = selectedProduct.price
        ? new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
          }).format(selectedProduct.price)
        : '';

      const priceSuffix = formattedPrice ? ` (${formattedPrice})` : '';
      title = `${selectedProduct.name}${priceSuffix} | ${brand}`;

      if (selectedProduct.description) {
        // Clean markdown or html tags for standard snippet
        const rawDesc = selectedProduct.description
          .replace(/[#*`_]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;
      } else {
        description = `Comprá ${selectedProduct.name} (${selectedProduct.category}) en ${brand}. Pieza artesanal de alta calidad. Envíos a todo el país y consultas por WhatsApp.`;
      }

      if (selectedProduct.image) {
        ogImage = selectedProduct.image;
      }
    } else {
      // Main store page sections
      switch (activeSection) {
        case 'catalogo':
          title = `Catálogo Completo de Mates, Yerbas y Bombillas | ${brand}`;
          description =
            `Explorá nuestro catálogo con mates de calabaza e imperial, yerbas artesanales, bombillas de alpaca y accesorios. Pedidos fáciles por WhatsApp.`;
          break;

        case 'nosotros':
          title = `Mates Artesanales y Tradición | ${brand}`;
          description =
            `Conocé la calidad de nuestros productos seleccionados. Piezas únicas hechas a mano con dedicación y la mejor tradición matera.`;
          break;

        case 'envios-pagos':
        case 'envios':
          title = `Envíos a todo el país y Formas de Pago | ${brand}`;
          description =
            `Pagá en efectivo, transferencia o tarjeta. Realizamos envíos seguros a todo el país. Atención directa y personalizada por WhatsApp.`;
          break;

        case 'contacto':
          title = `Contacto y Redes Sociales | ${brand}`;
          description =
            `Escribinos directamente por WhatsApp para realizar consultas o pedidos personalizados. Sumate a la comunidad ${brand} en Instagram.`;
          break;

        default:
          title = `${brand} | ${tagline}`;
          description =
            `Catálogo exclusivo de mates artesanales de calabaza e imperial, yerbas de estacionamiento natural, bombillas de alpaca y termos. Consultá directo por WhatsApp.`;
          break;
      }
    }

    // 1. Update Document Title
    document.title = title;

    // Helper to safely set or insert meta tags in <head>
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or insert link canonical tag
    const setCanonicalLink = (url: string) => {
      let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // 2. Update meta tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', brand);

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // Canonical link
    setCanonicalLink(currentUrl);

  }, [currentRoute, selectedProduct, activeSection, settings]);
}

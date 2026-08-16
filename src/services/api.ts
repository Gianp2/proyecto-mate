import { Product, StoreSettings, AnalyticsSummary } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

const ADMIN_TOKEN_KEY = 'pampa_admin_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (e) {
    console.warn('Could not save token to localStorage:', e);
  }
}

export function removeAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (e) {
    console.warn('Could not remove token from localStorage:', e);
  }
}

// Fetch all products with reliable fallback
export async function fetchProducts(options?: { category?: string; search?: string; sort?: string; all?: boolean }): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (options?.all) params.append('all', 'true');
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.sort) params.append('sort', options.sort);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Error al cargar los productos');
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('Fetch products API offline or unreachable, using local fallback:', err);
    return INITIAL_PRODUCTS;
  }
}

// Fetch single product by slug or ID
export async function fetchProductBySlug(slugOrId: string): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback search in initial dataset
  }
  const match = INITIAL_PRODUCTS.find(p => p.slug === slugOrId || p.id === slugOrId);
  if (match) return match;
  throw new Error('Producto no encontrado');
}

// Admin: Create product
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const token = getAdminToken();
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear el producto');
  }
  return res.json();
}

// Admin: Update product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const token = getAdminToken();
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar el producto');
  }
  return res.json();
}

// Admin: Delete product
export async function deleteProduct(id: string): Promise<void> {
  const token = getAdminToken();
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar el producto');
  }
}

// Fetch store settings with reliable fallback
export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) {
      throw new Error('Error al cargar la configuración de la tienda');
    }
    const data = await res.json();
    return { ...INITIAL_SETTINGS, ...data };
  } catch (err) {
    console.warn('Fetch settings API unreachable, using local default settings:', err);
    return INITIAL_SETTINGS;
  }
}

// Admin: Update store settings
export async function updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const token = getAdminToken();
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar la configuración');
  }
  return res.json();
}

// Analytics track
export async function trackEvent(
  type: 'view_product' | 'whatsapp_click' | 'search' | 'share',
  details?: { productId?: string; productName?: string; category?: string; source?: string }
): Promise<void> {
  try {
    const isMobile = window.innerWidth < 768;
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        ...details,
        device: isMobile ? 'mobile' : 'desktop',
      }),
    });
  } catch (e) {
    // Silent catch for analytics
  }
}

// Admin: Fetch analytics
export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const token = getAdminToken();
  const res = await fetch('/api/analytics', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Error al obtener analíticas');
  }
  return res.json();
}

// Auth Login
export async function loginAdmin(username: string, password: string): Promise<{ token: string; user: { username: string; role: string } }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Credenciales incorrectas');
  }

  const data = await res.json();
  setAdminToken(data.token);
  return data;
}

// Verify Admin Auth
export async function verifyAdminAuth(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Generate WhatsApp consultation URL
export function buildWhatsAppUrl(
  phone: string,
  productName?: string,
  price?: number,
  variant?: string,
  category?: string,
  categoryMessages?: Record<string, string>
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  let message = '¡Hola! ';

  if (productName) {
    const customTemplate = category && categoryMessages?.[category];
    if (customTemplate && customTemplate.trim()) {
      let templated = customTemplate.trim();

      const formattedPrice = price ? `$${price.toLocaleString('es-AR')}` : '';
      const formattedVariant = variant ? `(Opción: ${variant})` : '';

      if (templated.includes('{producto}')) {
        templated = templated.replace(/\{producto\}/g, `*${productName}*`);
      } else {
        templated = `${templated} *${productName}*`;
      }

      if (templated.includes('{categoria}')) {
        templated = templated.replace(/\{categoria\}/g, category || '');
      }

      if (templated.includes('{variante}')) {
        templated = templated.replace(/\{variante\}/g, formattedVariant);
      } else if (variant) {
        templated = `${templated} ${formattedVariant}`;
      }

      if (templated.includes('{precio}')) {
        templated = templated.replace(/\{precio\}/g, formattedPrice);
      } else if (price) {
        templated = `${templated} - ${formattedPrice}`;
      }

      message = templated.trim();
      if (!message.endsWith('.')) {
        message += '.';
      }
    } else {
      message += `Quería consultar por el *${productName}*`;
      if (variant) {
        message += ` (Opción: ${variant})`;
      }
      if (price) {
        message += ` - $${price.toLocaleString('es-AR')}`;
      }
      message += '.';
    }
  } else {
    message += 'Quería consultar por los productos de su catálogo de mates y yerbas.';
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

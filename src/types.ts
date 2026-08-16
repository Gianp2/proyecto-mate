export type StockStatus = 'Disponible' | 'Últimas unidades' | 'Agotado' | 'Próximamente';

export type Category = 'Mates' | 'Yerbas' | 'Bombillas' | 'Termos' | 'Accesorios';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Alpaca - Grabado", "Cuero Negro", "1 Litro - Verde"
  priceBonus?: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string; // e.g., "Alpaca · Grabado"
  category: Category;
  description: string;
  fullDescription?: string;
  features: string[]; // Bullet points e.g. ["Calabaza seleccionada", "Forrado en cuero"]
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImages?: string[];
  stockStatus: StockStatus;
  stockQuantity?: number;
  featured: boolean;
  active: boolean;
  order: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  whatsappNumber: string; // e.g., "5491112345678"
  whatsappDisplay: string; // e.g., "+54 11 1234 5678"
  instagramHandle: string; // e.g., "pampa.mates"
  instagramUrl: string;
  announcementText: string;
  shippingNotice: string;
  paymentNotice: string;
  address: string;
  categoryWhatsAppMessages?: Record<string, string>;
}

export interface AnalyticsEvent {
  id: string;
  type: 'view_product' | 'whatsapp_click' | 'search' | 'share';
  productId?: string;
  productName?: string;
  category?: Category;
  timestamp: string;
  device: 'mobile' | 'desktop' | 'tablet';
}

export interface AnalyticsSummary {
  totalConsultations: number;
  totalViews: number;
  topProducts: { name: string; category: Category; count: number }[];
  dailyConsultations: { date: string; count: number }[];
  categoryBreakdown: { category: Category; count: number }[];
}

export interface UserSession {
  token: string;
  user: {
    username: string;
    role: string;
  };
}

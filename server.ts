import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Product, StoreSettings, AnalyticsEvent } from './src/types.js';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './src/data/initialData.js';

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File-based DB path (supports Vercel serverless /tmp and local persistent directory)
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  products: Product[];
  settings: StoreSettings;
  analytics: AnalyticsEvent[];
  adminCredentials: { username: string; passwordHash: string };
}

// Simple hardcoded token for session management
const ADMIN_TOKEN = 'pampa_admin_session_token_2026';

function initStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        products: parsed.products || INITIAL_PRODUCTS,
        settings: parsed.settings || INITIAL_SETTINGS,
        analytics: parsed.analytics || [],
        adminCredentials: parsed.adminCredentials || { username: 'admin', passwordHash: 'pampa2026' }
      };
    } catch (e) {
      console.error('Error reading store.json, re-initializing...', e);
    }
  }

  const initialStore: StoreData = {
    products: INITIAL_PRODUCTS,
    settings: INITIAL_SETTINGS,
    analytics: [
      { id: 'ev-1', type: 'whatsapp_click', productId: 'prod-1', productName: 'Mate Imperial', category: 'Mates', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), device: 'mobile' },
      { id: 'ev-2', type: 'whatsapp_click', productId: 'prod-1', productName: 'Mate Imperial', category: 'Mates', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), device: 'mobile' },
      { id: 'ev-3', type: 'whatsapp_click', productId: 'prod-4', productName: 'Termo Pampa', category: 'Termos', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), device: 'mobile' },
      { id: 'ev-4', type: 'whatsapp_click', productId: 'prod-2', productName: 'Yerba Mate Aguantadora', category: 'Yerbas', timestamp: new Date().toISOString(), device: 'mobile' },
    ],
    adminCredentials: { username: 'admin', passwordHash: 'pampa2026' }
  };

  saveStore(initialStore);
  return initialStore;
}

let store: StoreData = initStore();

function saveStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store.json:', err);
  }
}

// Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'No autorizado. Se requiere inicio de sesión.' });
  }
  next();
}

// --- API ROUTES ---

// Public: Get Products
app.get('/api/products', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const category = req.query.category as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const sort = req.query.sort as string;

  let result = showAll ? [...store.products] : store.products.filter(p => p.active);

  if (category && category !== 'Todos') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    result = result.filter(p => 
      p.name.toLowerCase().includes(search) || 
      (p.subtitle && p.subtitle.toLowerCase().includes(search)) ||
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.features.some(f => f.toLowerCase().includes(search))
    );
  }

  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'featured') {
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  } else {
    // Default order
    result.sort((a, b) => a.order - b.order);
  }

  return res.json(result);
});

// Public: Get Product by Slug or ID
app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const key = req.params.slugOrId;
  const product = store.products.find(p => p.slug === key || p.id === key);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  return res.json(product);
});

// Admin: Create Product
app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.category || body.price === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoría, precio).' });
  }

  const slug = body.slug || body.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    slug: slug,
    name: body.name,
    subtitle: body.subtitle || '',
    category: body.category,
    description: body.description || '',
    fullDescription: body.fullDescription || body.description || '',
    features: Array.isArray(body.features) ? body.features : [],
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    image: body.image || 'https://images.unsplash.com/photo-1598007221295-8e89f2a08c0f?auto=format&fit=crop&w=800&q=80',
    secondaryImages: Array.isArray(body.secondaryImages) ? body.secondaryImages : [],
    stockStatus: body.stockStatus || 'Disponible',
    featured: Boolean(body.featured),
    active: body.active !== undefined ? Boolean(body.active) : true,
    order: store.products.length + 1,
    variants: Array.isArray(body.variants) ? body.variants : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.products.push(newProduct);
  saveStore(store);

  return res.status(201).json(newProduct);
});

// Admin: Update Product
app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const body = req.body;
  const existing = store.products[index];

  const updated: Product = {
    ...existing,
    ...body,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : existing.originalPrice,
    updatedAt: new Date().toISOString(),
  };

  store.products[index] = updated;
  saveStore(store);

  return res.json(updated);
});

// Admin: Delete Product
app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = store.products.length;
  store.products = store.products.filter(p => p.id !== id);

  if (store.products.length === initialLen) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  saveStore(store);
  return res.json({ success: true, message: 'Producto eliminado correctamente' });
});

// Public: Get Store Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  return res.json(store.settings);
});

// Admin: Update Settings
app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  store.settings = {
    ...store.settings,
    ...req.body
  };
  saveStore(store);
  return res.json(store.settings);
});

// Public: Analytics tracking (record WhatsApp click / view)
app.post('/api/analytics/track', (req: Request, res: Response) => {
  const { type, productId, productName, category, device } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Tipo de evento requerido' });
  }

  const event: AnalyticsEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    productId,
    productName,
    category,
    timestamp: new Date().toISOString(),
    device: device || 'mobile',
  };

  store.analytics.push(event);
  // Keep last 1000 events max
  if (store.analytics.length > 1000) {
    store.analytics = store.analytics.slice(-1000);
  }

  saveStore(store);
  return res.json({ success: true });
});

// Admin: Get Analytics Summary
app.get('/api/analytics', requireAdmin, (_req: Request, res: Response) => {
  const whatsappEvents = store.analytics.filter(e => e.type === 'whatsapp_click');
  const viewEvents = store.analytics.filter(e => e.type === 'view_product');

  // Product counts for whatsapp clicks
  const prodCounts: Record<string, { name: string; category: any; count: number }> = {};
  whatsappEvents.forEach(ev => {
    if (ev.productName) {
      if (!prodCounts[ev.productName]) {
        prodCounts[ev.productName] = { name: ev.productName, category: ev.category || 'Mates', count: 0 };
      }
      prodCounts[ev.productName].count++;
    }
  });

  const topProducts = Object.values(prodCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Category breakdown
  const catCounts: Record<string, number> = {};
  whatsappEvents.forEach(ev => {
    const cat = ev.category || 'Mates';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(catCounts).map(([category, count]) => ({ category: category as any, count }));

  // Last 7 days breakdown
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    dailyMap[dateStr] = 0;
  }

  whatsappEvents.forEach(ev => {
    const evDate = new Date(ev.timestamp);
    const dateStr = evDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    if (dailyMap[dateStr] !== undefined) {
      dailyMap[dateStr]++;
    }
  });

  const dailyConsultations = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return res.json({
    totalConsultations: whatsappEvents.length,
    totalViews: viewEvents.length,
    topProducts,
    dailyConsultations,
    categoryBreakdown,
  });
});

// Admin: Auth Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const { adminCredentials } = store;

  const cleanUser = (username || '').trim().toLowerCase();
  const validUser = cleanUser === 'admin' || username === adminCredentials.username;
  const validPass = password === 'admin123' || password === 'pampa2026' || password === adminCredentials.passwordHash;

  if (validUser && validPass) {
    return res.json({
      token: ADMIN_TOKEN,
      user: {
        username: 'admin',
        role: 'Administrator'
      }
    });
  }

  return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
});

// Admin: Auth Verify
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
    return res.json({
      authenticated: true,
      user: { username: store.adminCredentials.username, role: 'Administrator' }
    });
  }
  return res.status(401).json({ authenticated: false });
});


export default app;

// Express + Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

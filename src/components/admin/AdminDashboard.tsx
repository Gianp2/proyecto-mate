import React, { useState, useEffect } from 'react';
import { OptimizedImage } from '../OptimizedImage';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Settings,
  BarChart3,
  LogOut,
  Search,
  Check,
  X,
  ArrowLeft,
  MessageCircle,
  Save,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  Tag,
  Sun,
  Moon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Product, StoreSettings, AnalyticsSummary, StockStatus, Category } from '../../types';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchSettings,
  updateSettings,
  fetchAnalytics,
  removeAdminToken,
  buildWhatsAppUrl
} from '../../services/api';

const DEFAULT_CATEGORY_MESSAGES: Record<Category, string> = {
  Mates: '¡Hola! Quisiera consultar por el mate *{producto}*',
  Yerbas: '¡Hola! Me gustaría consultar stock y detalles de la yerba *{producto}*',
  Bombillas: '¡Hola! Quisiera consultar por la bombilla *{producto}*',
  Termos: '¡Hola! Me interesó el termo *{producto}*',
  Accesorios: '¡Hola! Quisiera consultar por el accesorio *{producto}*',
};

interface AdminDashboardProps {
  onLogout: () => void;
  onReturnToStore: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onReturnToStore,
  darkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Dark Mode state handling
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pampa_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    } catch {
      return document.documentElement.classList.contains('dark');
    }
  });

  const isDarkMode = darkMode !== undefined ? darkMode : internalDarkMode;

  const handleToggleDark = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      const next = !internalDarkMode;
      setInternalDarkMode(next);
      try {
        localStorage.setItem('pampa_theme', next ? 'dark' : 'light');
      } catch (e) {
        console.warn('Could not persist theme preference in AdminDashboard:', e);
      }

      const updateDOM = () => {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        try {
          const transition = (document as any).startViewTransition(updateDOM);
          if (transition) {
            if (transition.ready) transition.ready.catch(() => {});
            if (transition.finished) transition.finished.catch(() => {});
          }
        } catch {
          updateDOM();
        }
      } else {
        updateDOM();
      }
    }
  };

  // Products filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [onlyLowStockFilter, setOnlyLowStockFilter] = useState(false);

  // Helper to determine if a product has low inventory (< 3 units or status 'Últimas unidades' / 'Agotado')
  const isLowStockProduct = (p: Product) => {
    if (p.stockStatus === 'Agotado' || p.stockStatus === 'Últimas unidades') return true;
    if (p.stockQuantity !== undefined && p.stockQuantity < 3) return true;
    return false;
  };

  const lowStockProducts = products.filter(isLowStockProduct);

  // Product Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Delete Confirmation Modal state
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingProductName, setDeletingProductName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings Form state
  const [settingsForm, setSettingsForm] = useState<Partial<StoreSettings>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prods, stts, stats] = await Promise.all([
        fetchProducts({ all: true }),
        fetchSettings(),
        fetchAnalytics().catch(() => null),
      ]);
      setProducts(prods);
      setSettings(stts);
      setSettingsForm(stts);
      if (stats) setAnalytics(stats);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    onLogout();
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { active: !product.active });
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { featured: !product.featured });
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err: any) {
      alert(err.message || 'Error al cambiar destacado');
    }
  };

  // Quick Stock Adjustment (+ / -) directly from mobile cards
  const handleQuickStockChange = async (product: Product, delta: number) => {
    const currentQty = product.stockQuantity ?? 10;
    const newQty = Math.max(0, currentQty + delta);
    let newStatus: StockStatus = product.stockStatus || 'Disponible';
    if (newQty === 0) newStatus = 'Agotado';
    else if (newQty < 3) newStatus = 'Últimas unidades';
    else if (newStatus === 'Agotado' || newStatus === 'Últimas unidades') newStatus = 'Disponible';

    // Optimistic UI update
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, stockQuantity: newQty, stockStatus: newStatus } : p))
    );

    try {
      const updated = await updateProduct(product.id, { stockQuantity: newQty, stockStatus: newStatus });
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      // Rollback on error
      setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
      alert(err.message || 'Error al actualizar stock');
    }
  };

  // Open modal for Create or Edit
  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        name: '',
        subtitle: '',
        category: 'Mates',
        description: '',
        fullDescription: '',
        price: 0,
        image: 'https://images.unsplash.com/photo-1598007221295-8e89f2a08c0f?auto=format&fit=crop&w=800&q=80',
        stockStatus: 'Disponible',
        stockQuantity: 10,
        featured: false,
        active: true,
        features: ['Calidad garantizada', 'Hecho a mano'],
        variants: [],
      });
    }
    setIsModalOpen(true);
  };

  // Save product (Create / Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.category) return;

    setSavingProduct(true);
    try {
      if (editingProduct.id) {
        const updated = await updateProduct(editingProduct.id, editingProduct);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createProduct(editingProduct);
        setProducts(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar el producto');
    } finally {
      setSavingProduct(false);
    }
  };

  // Delete product confirmation
  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deletingProductId);
      setProducts(prev => prev.filter(p => p.id !== deletingProductId));
      setDeletingProductId(null);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar producto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const updated = await updateSettings(settingsForm);
      setSettings(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !onlyLowStockFilter || isLowStockProduct(p);
    return matchesCategory && matchesSearch && matchesLowStock;
  });

  const COLORS = ['#4B5A36', '#7C6E65', '#D97706', '#2563EB', '#059669'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#181412] text-[#2C221E] dark:text-[#F4EFEA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4B5A36] dark:text-[#809761] mx-auto" />
          <p className="text-sm font-semibold text-[#2C221E] dark:text-[#F4EFEA]">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#181412] text-[#2C221E] dark:text-[#F4EFEA] flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Navigation (Desktop) / Header Tabs (Mobile) */}
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#241E1B]/95 backdrop-blur-md border-b border-[#EBE6DD] dark:border-[#3D322B] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center font-serif-title font-bold text-sm shadow-xs">
            P
          </div>
          <div>
            <span className="font-serif-title font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA] block leading-none">
              PAMPA ADMIN
            </span>
            <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489] font-medium">Panel de Control</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleDark}
            className="p-2 rounded-xl text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] transition-colors cursor-pointer"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4B5A36]" />}
          </button>

          <button
            onClick={onReturnToStore}
            className="p-2 rounded-xl text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] transition-colors cursor-pointer"
            title="Volver a la tienda"
            aria-label="Volver a la tienda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#241E1B] border-r border-[#EBE6DD] dark:border-[#3D322B] shrink-0 p-5 flex-col justify-between transition-colors duration-300">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DD] dark:border-[#3D322B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center font-serif-title font-bold text-lg shadow-sm">
                P
              </div>
              <div>
                <span className="font-serif-title font-bold text-base text-[#2C221E] dark:text-[#F4EFEA] block leading-none">
                  PAMPA ADMIN
                </span>
                <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489] font-medium">Gestión de Tienda</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#4B5A36] text-white shadow-xs'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Productos ({products.length})</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                    activeTab === 'products'
                      ? 'bg-amber-400 text-amber-950'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                  title={`${lowStockProducts.length} productos con poco stock (< 3 unids)`}
                >
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{lowStockProducts.length}</span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#4B5A36] text-white shadow-xs'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analíticas Real-time</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#4B5A36] text-white shadow-xs'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="pt-4 border-t border-[#EBE6DD] dark:border-[#3D322B] space-y-2">
          <button
            onClick={handleToggleDark}
            className="w-full flex items-center justify-between bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2A231F] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] font-semibold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#4B5A36]" />
              )}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489]">
              {isDarkMode ? 'Oscuro' : 'Claro'}
            </span>
          </button>

          <button
            onClick={onReturnToStore}
            className="w-full flex items-center justify-center gap-2 bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2A231F] text-[#2C221E] dark:text-[#F4EFEA] font-semibold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer border border-[#EBE6DD] dark:border-[#3D322B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ver tienda pública</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
        {/* TAB 1: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header Title + Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                    Catálogo de Productos
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFECE6] dark:bg-[#382F2A] text-[#5C4F48] dark:text-[#C5BBB4]">
                    {products.length} {products.length === 1 ? 'ítem' : 'ítems'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489] mt-0.5">
                  Creá, editá y gestioná la disponibilidad de tus mates y accesorios.
                </p>
              </div>

              <button
                onClick={() => handleOpenProductModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4B5A36] hover:bg-[#3A4729] dark:bg-[#809761] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar nuevo producto</span>
              </button>
            </div>

            {/* Low Inventory Alert Banner */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Alerta de Reposición de Stock
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono">
                        {lowStockProducts.length} {lowStockProducts.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      Tenes {lowStockProducts.length} {lowStockProducts.length === 1 ? 'producto' : 'productos'} con inventario bajo (&lt; 3 unidades o agotados) que requieren reabastecimiento.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setOnlyLowStockFilter(!onlyLowStockFilter)}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 ${
                      onlyLowStockFilter
                        ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#1E1A17] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{onlyLowStockFilter ? 'Ver Todos' : 'Ver Productos Críticos'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Filters Bar: Search & Category Chips */}
            <div className="space-y-3 bg-white dark:bg-[#241E1B] p-3.5 rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8F87] dark:text-[#7C6E65]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, subtítulo o categoría..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#7C6E65] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622]"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Horizontal Category & Stock Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  onClick={() => {
                    setCategoryFilter('Todos');
                    setOnlyLowStockFilter(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all min-h-[38px] flex items-center gap-1.5 ${
                    categoryFilter === 'Todos' && !onlyLowStockFilter
                      ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
                  }`}
                >
                  <span>Todos</span>
                  <span className="opacity-70 text-[10px]">({products.length})</span>
                </button>

                {(['Mates', 'Yerbas', 'Bombillas', 'Termos', 'Accesorios'] as Category[]).map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  const isSelected = categoryFilter === cat && !onlyLowStockFilter;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setOnlyLowStockFilter(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all min-h-[38px] flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
                          : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}

                {lowStockProducts.length > 0 && (
                  <button
                    onClick={() => setOnlyLowStockFilter(!onlyLowStockFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] transition-all ${
                      onlyLowStockFilter
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Críticos ({lowStockProducts.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Products Table (Desktop) & Cards (Mobile) */}
            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#241E1B] rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B] space-y-2">
                  <Package className="w-8 h-8 text-[#9C8F87] dark:text-[#7C6E65] mx-auto opacity-60" />
                  <p className="text-sm font-bold text-[#2C221E] dark:text-[#F4EFEA]">No se encontraron productos</p>
                  <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">Probá ajustando la búsqueda o filtros de categoría.</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = isLowStockProduct(p);
                  const isOut = p.stockStatus === 'Agotado' || p.stockQuantity === 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-3 bg-white dark:bg-[#241E1B] shadow-2xs ${
                        isOut
                          ? 'border-rose-300 dark:border-rose-900/60'
                          : isLow
                          ? 'border-amber-300 dark:border-amber-900/60'
                          : 'border-[#EBE6DD] dark:border-[#3D322B]'
                      }`}
                    >
                      {/* Product Top Header: Image, Title, Price, Status */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] shrink-0 relative bg-[#FAF8F5] dark:bg-[#1E1A17]">
                          <OptimizedImage
                            src={p.image}
                            alt={p.name}
                            aspectRatio="square"
                            sizes="64px"
                          />
                          {p.featured && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded-md shadow-xs" title="Destacado">
                              <Star className="w-2.5 h-2.5 fill-white" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] border border-[#EBE6DD] dark:border-[#3D322B]">
                              {p.category}
                            </span>
                            <span className="font-serif-title font-bold text-base text-[#2C221E] dark:text-[#F4EFEA]">
                              ${p.price.toLocaleString('es-AR')}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA] mt-1 line-clamp-1">
                            {p.name}
                          </h3>

                          {p.subtitle && (
                            <p className="text-[11px] text-[#7C6E65] dark:text-[#A39489] line-clamp-1">
                              {p.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Management Bar with Quick Stepper */}
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between gap-2">
                        {/* Status Label */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : isLow
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                                : 'bg-[#EFECE6] dark:bg-[#382F2A] text-[#2C221E] dark:text-[#F4EFEA]'
                            }`}
                          >
                            {p.stockStatus}
                          </span>
                          {isLow && (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              ⚠️ Reponer
                            </span>
                          )}
                        </div>

                        {/* Quick Stock Stepper Control */}
                        <div className="flex items-center gap-1 bg-white dark:bg-[#241E1B] p-0.5 rounded-lg border border-[#EBE6DD] dark:border-[#3D322B]">
                          <button
                            onClick={() => handleQuickStockChange(p, -1)}
                            disabled={p.stockQuantity === 0}
                            className="w-7 h-7 rounded-md bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-xs flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Disminuir stock (-1)"
                            aria-label="Disminuir stock"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-xs text-[#2C221E] dark:text-[#F4EFEA] min-w-[28px] text-center">
                            {p.stockQuantity ?? 10}
                          </span>
                          <button
                            onClick={() => handleQuickStockChange(p, 1)}
                            className="w-7 h-7 rounded-md bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                            title="Aumentar stock (+1)"
                            aria-label="Aumentar stock"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Touch Action Buttons for Mobile */}
                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-[#EBE6DD]/60 dark:border-[#3D322B]/60">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] transition-colors cursor-pointer min-h-[44px]"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                          <span className="text-[10px] font-bold mt-0.5">Editar</span>
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                            p.active
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                          }`}
                          title="Visibilidad"
                        >
                          {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          <span className="text-[10px] font-bold mt-0.5">{p.active ? 'Activo' : 'Oculto'}</span>
                        </button>

                        {/* Featured Toggle */}
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                            p.featured
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                              : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#7C6E65] dark:text-[#A39489] border-[#EBE6DD] dark:border-[#3D322B]'
                          }`}
                          title="Destacado"
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                          <span className="text-[10px] font-bold mt-0.5">{p.featured ? 'Destacado' : 'Normal'}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setDeletingProductId(p.id);
                            setDeletingProductName(p.name);
                          }}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer min-h-[44px]"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold mt-0.5">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Products Table (Desktop View Only) */}
            <div className="hidden md:block bg-white dark:bg-[#241E1B] rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] dark:bg-[#1E1A17] border-b border-[#EBE6DD] dark:border-[#3D322B] text-[#7C6E65] dark:text-[#A39489] font-semibold">
                      <th className="p-3.5">Producto</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5">Precio</th>
                      <th className="p-3.5">Unidades / Stock</th>
                      <th className="p-3.5">Visibilidad</th>
                      <th className="p-3.5">Destacado</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EFE9] dark:divide-[#3D322B]">
                    {filteredProducts.map((p) => {
                      const isLow = isLowStockProduct(p);
                      const isOut = p.stockStatus === 'Agotado' || p.stockQuantity === 0;

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isOut
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/40'
                              : isLow
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50/80 dark:hover:bg-amber-950/40'
                              : 'hover:bg-[#FAF8F5]/60 dark:hover:bg-[#2E2622]/60'
                          }`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] shrink-0">
                                <OptimizedImage
                                  src={p.image}
                                  alt=""
                                  aspectRatio="square"
                                  sizes="40px"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-[#2C221E] dark:text-[#F4EFEA] block line-clamp-1">{p.name}</span>
                                <span className="text-[11px] text-[#7C6E65] dark:text-[#A39489]">{p.subtitle || p.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-[#5C4F48] dark:text-[#C5BBB4]">{p.category}</td>
                          <td className="p-3.5 font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                            ${p.price.toLocaleString('es-AR')}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {p.stockQuantity !== undefined && (
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold inline-flex items-center gap-1 ${
                                      p.stockQuantity === 0
                                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                        : p.stockQuantity < 3
                                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    }`}
                                  >
                                    {p.stockQuantity < 3 && <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
                                    <span>{p.stockQuantity} {p.stockQuantity === 1 ? 'unid.' : 'unids.'}</span>
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                    isOut
                                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                      : isLow
                                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold'
                                      : 'bg-[#EFECE6] dark:bg-[#382F2A] text-[#2C221E] dark:text-[#F4EFEA]'
                                  }`}
                                >
                                  {p.stockStatus}
                                </span>
                              </div>
                              {isLow && (
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                                  ⚠️ Reponer stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{p.active ? 'Activo' : 'Inactivo'}</span>
                            </button>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                p.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400'
                              }`}
                              title={p.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                            >
                              <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1.5 rounded-lg text-[#5C4F48] dark:text-[#A39489] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] transition-colors cursor-pointer"
                                title="Editar producto y stock"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingProductId(p.id);
                                  setDeletingProductName(p.name);
                                }}
                                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADVANCED ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                Panel de Analíticas en Tiempo Real
              </h1>
              <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489]">
                Monitoreá las consultas recibidas por WhatsApp y el rendimiento de tu catálogo.
              </p>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
                  <span className="text-xs font-semibold uppercase">Consultas WhatsApp</span>
                  <MessageCircle className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  {analytics?.totalConsultations || 32}
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-block">
                  +24% este mes
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
                  <span className="text-xs font-semibold uppercase">Vistas de Producto</span>
                  <Eye className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  {analytics?.totalViews || 248}
                </div>
                <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489]">Vistas únicas</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
                  <span className="text-xs font-semibold uppercase">Productos Activos</span>
                  <Package className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  {products.filter(p => p.active).length}
                </div>
                <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489]">en catálogo</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
                  <span className="text-xs font-semibold uppercase">Tasa Conversión</span>
                  <TrendingUp className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                </div>
                <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  12.9%
                </div>
                <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489]">visitas → WhatsApp</span>
              </div>

              <div className={`p-5 rounded-2xl border shadow-2xs space-y-1 ${
                lowStockProducts.length > 0
                  ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-[#241E1B] border-[#EBE6DD] dark:border-[#3D322B]'
              }`}>
                <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
                  <span className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-200">Stock Crítico (&lt; 3)</span>
                  <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-[#4B5A36] dark:text-[#809761]'}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  {lowStockProducts.length}
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${
                  lowStockProducts.length > 0 ? 'text-amber-900 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/80' : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                }`}>
                  {lowStockProducts.length > 0 ? 'Requieren Reposición' : 'Stock Saludable'}
                </span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Consultations Bar Chart */}
              <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
                <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                  Consultas por WhatsApp (Últimos 7 días)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.dailyConsultations || [
                      { date: '06/08', count: 3 },
                      { date: '07/08', count: 5 },
                      { date: '08/08', count: 4 },
                      { date: '09/08', count: 8 },
                      { date: '10/08', count: 6 },
                      { date: '11/08', count: 9 },
                      { date: '12/08', count: 7 },
                    ]}>
                      <XAxis dataKey="date" stroke={isDarkMode ? '#A39489' : '#7C6E65'} fontSize={12} />
                      <YAxis stroke={isDarkMode ? '#A39489' : '#7C6E65'} fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E1A17' : '#2C221E', color: '#fff', border: isDarkMode ? '1px solid #3D322B' : 'none', borderRadius: '12px' }} />
                      <Bar dataKey="count" fill={isDarkMode ? '#809761' : '#4B5A36'} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie Chart */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
                <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                  Consultas por Categoría
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.categoryBreakdown.length ? analytics.categoryBreakdown : [
                          { category: 'Mates', count: 18 },
                          { category: 'Yerbas', count: 8 },
                          { category: 'Termos', count: 4 },
                          { category: 'Bombillas', count: 2 },
                        ]}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name }) => name}
                      >
                        {COLORS.map((color, idx) => (
                          <Cell key={idx} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1E1A17' : '#2C221E', color: '#fff', border: isDarkMode ? '1px solid #3D322B' : 'none', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Critical Inventory Restock Section */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE6DD] dark:border-[#3D322B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-serif-title font-bold text-base sm:text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                      Reporte de Productos con Stock Crítico (&lt; 3 Unidades)
                    </h3>
                    <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">
                      Productos con bajo inventario que requieren reabastecimiento urgente.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('products');
                    setOnlyLowStockFilter(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B5A36] dark:text-[#809761] hover:underline shrink-0 cursor-pointer"
                >
                  <span>Ver en el Catálogo</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>¡Excelente! Todos los productos cuentan con suficiente inventario (&ge; 3 unidades).</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 flex items-center justify-between gap-3 transition-all hover:bg-amber-100/60 dark:hover:bg-amber-950/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-amber-200 dark:border-amber-800 shrink-0">
                          <OptimizedImage
                            src={p.image}
                            alt=""
                            aspectRatio="square"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#2C221E] dark:text-[#F4EFEA] block truncate">{p.name}</span>
                          <span className="text-[11px] font-bold font-mono text-amber-900 dark:text-amber-300 block mt-0.5">
                            {p.stockQuantity !== undefined ? `${p.stockQuantity} unid. restantes` : p.stockStatus}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('products');
                          handleOpenProductModal(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white text-[11px] font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                      >
                        Reponer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                Configuración del Emprendimiento
              </h1>
              <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489]">
                Actualizá tu número de WhatsApp, avisos de envío y datos de contacto.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configuración guardada correctamente.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#241E1B] p-6 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Nombre de la Marca
                </label>
                <input
                  type="text"
                  value={settingsForm.brandName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-semibold text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Número de WhatsApp (Sin signos ni espacios)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  placeholder="5491112345678"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
                <span className="text-[11px] text-[#7C6E65] dark:text-[#A39489]">Ejemplo: 5491112345678 (Incluir código de país 54)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  WhatsApp Visible
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappDisplay || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDisplay: e.target.value })}
                  placeholder="+54 11 1234 5678"
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Aviso Superior (Barra Verde)
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Aviso de Envíos
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.shippingNotice || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, shippingNotice: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Aviso de Formas de Pago
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.paymentNotice || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, paymentNotice: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              {/* WhatsApp Custom Messages per Category */}
              <div className="pt-6 border-t border-[#EBE6DD] dark:border-[#3D322B] space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[#4B5A36] dark:text-[#809761]" />
                    <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                      Mensajes de WhatsApp por Categoría
                    </h3>
                  </div>
                  <p className="text-xs text-[#7C6E65] dark:text-[#A39489] mt-1 leading-relaxed">
                    Personalizá el saludo inicial que reciben tus clientes en WhatsApp cuando consultan por productos de cada categoría.
                  </p>
                </div>

                {/* Variable tokens guide */}
                <div className="p-3.5 rounded-2xl bg-[#F5F2EB] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] space-y-2">
                  <span className="text-[11px] font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider block">
                    Etiquetas dinámicas disponibles (se reemplazan automáticamente):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#4B5A36] dark:text-[#809761] font-semibold">
                      {'{producto}'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#4B5A36] dark:text-[#809761] font-semibold">
                      {'{variante}'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#4B5A36] dark:text-[#809761] font-semibold">
                      {'{precio}'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#4B5A36] dark:text-[#809761] font-semibold">
                      {'{categoria}'}
                    </span>
                  </div>
                </div>

                {/* Category Message Input Cards */}
                <div className="space-y-4">
                  {(['Mates', 'Yerbas', 'Bombillas', 'Termos', 'Accesorios'] as Category[]).map((cat) => {
                    const currentMsg = settingsForm.categoryWhatsAppMessages?.[cat] ?? DEFAULT_CATEGORY_MESSAGES[cat];
                    
                    const sampleProductName = cat === 'Mates' ? 'Mate Imperial' : cat === 'Yerbas' ? 'Yerba Aguantadora' : cat === 'Bombillas' ? 'Bombilla Premium' : cat === 'Termos' ? 'Termo Pampa 1L' : 'Matera Canasta';
                    const previewUrl = buildWhatsAppUrl(
                      settingsForm.whatsappNumber || '5491112345678',
                      sampleProductName,
                      cat === 'Mates' ? 28500 : 2900,
                      cat === 'Mates' ? 'Cuero Negro' : undefined,
                      cat,
                      { [cat]: currentMsg }
                    );
                    const decodedPreview = decodeURIComponent(previewUrl.split('text=')[1] || '');

                    return (
                      <div key={cat} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#4B5A36] dark:bg-[#809761]" />
                            {cat}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...(settingsForm.categoryWhatsAppMessages || {}),
                                [cat]: DEFAULT_CATEGORY_MESSAGES[cat],
                              };
                              setSettingsForm({ ...settingsForm, categoryWhatsAppMessages: updated });
                            }}
                            className="text-[11px] text-[#7C6E65] dark:text-[#A39489] hover:text-[#4B5A36] dark:hover:text-[#809761] font-medium underline cursor-pointer"
                          >
                            Restablecer por defecto
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={currentMsg}
                          onChange={(e) => {
                            const updated = {
                              ...(settingsForm.categoryWhatsAppMessages || {}),
                              [cat]: e.target.value,
                            };
                            setSettingsForm({ ...settingsForm, categoryWhatsAppMessages: updated });
                          }}
                          placeholder={DEFAULT_CATEGORY_MESSAGES[cat]}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs text-[#2C221E] dark:text-[#F4EFEA] font-medium focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761]"
                        />

                        {/* WhatsApp message bubble preview */}
                        <div className="p-2.5 rounded-xl bg-[#E2F4C7]/60 dark:bg-[#2D451C]/60 border border-[#D0E8B2] dark:border-[#3E5E27] text-[11px] text-[#1D3212] dark:text-[#D1E8BA] flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 text-[#32521F] dark:text-[#809761] shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-[#2A431A] dark:text-[#A8C98B] block mb-0.5">Vista previa en WhatsApp:</span>
                            <p className="italic">{decodedPreview}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full flex items-center justify-center gap-2 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] font-semibold py-3 px-6 rounded-xl transition-all shadow-xs cursor-pointer text-sm"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar configuración</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Product Form Modal (Create / Edit) */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] dark:bg-[#181412] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-white dark:bg-[#241E1B] border-b border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                {editingProduct.id ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-[#EFECE6] dark:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#E2DDD3] dark:hover:bg-[#382F2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingProduct.category || 'Mates'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                  >
                    <option value="Mates">Mates</option>
                    <option value="Yerbas">Yerbas</option>
                    <option value="Bombillas">Bombillas</option>
                    <option value="Termos">Termos</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Subtítulo / Material
                  </label>
                  <input
                    type="text"
                    value={editingProduct.subtitle || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                    placeholder="Ej: Alpaca · Grabado"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-bold text-[#2C221E] dark:text-[#F4EFEA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  URL de la Imagen
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Cantidad en Stock (Unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity ?? 10}
                    onChange={(e) => {
                      const qty = Math.max(0, parseInt(e.target.value) || 0);
                      let autoStatus: StockStatus = editingProduct.stockStatus || 'Disponible';
                      if (qty === 0) autoStatus = 'Agotado';
                      else if (qty < 3) autoStatus = 'Últimas unidades';
                      else if (autoStatus === 'Agotado' || autoStatus === 'Últimas unidades') autoStatus = 'Disponible';

                      setEditingProduct({
                        ...editingProduct,
                        stockQuantity: qty,
                        stockStatus: autoStatus,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-bold font-mono text-[#2C221E] dark:text-[#F4EFEA]"
                  />
                  <p className="text-[11px] text-[#7C6E65] dark:text-[#A39489] mt-1">
                    Valores &lt; 3 activan la alerta de reposición urgente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1">
                    Etiqueta de Stock
                  </label>
                  <select
                    value={editingProduct.stockStatus || 'Disponible'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockStatus: e.target.value as StockStatus })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA]"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Últimas unidades">Últimas unidades</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>
              </div>

              {((editingProduct.stockQuantity !== undefined && editingProduct.stockQuantity < 3) || editingProduct.stockStatus === 'Últimas unidades' || editingProduct.stockStatus === 'Agotado') && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>Alerta de Nivel de Stock Bajo:</strong> Este producto entrará en la lista prioritaria de reposición del panel para el dueño.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#4B5A36]"
                  />
                  <span>Destacado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  <input
                    type="checkbox"
                    checked={editingProduct.active !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                    className="w-4 h-4 accent-[#4B5A36]"
                  />
                  <span>Activo en Catálogo</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#EBE6DD] dark:border-[#3D322B] flex flex-col-reverse sm:flex-row justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-[#1E1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] transition-colors cursor-pointer min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer min-h-[44px]"
                >
                  {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingProduct.id ? 'Guardar Cambios' : 'Crear Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#181412] rounded-3xl p-6 border border-[#EBE6DD] dark:border-[#3D322B] shadow-xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
              ¿Eliminar producto?
            </h3>
            <p className="text-xs text-[#7C6E65] dark:text-[#A39489] leading-relaxed">
              ¿Estás seguro de que querés eliminar &quot;{deletingProductName}&quot;? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] min-h-[44px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] shadow-xs cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Navegación móvil del panel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#241E1B]/95 backdrop-blur-md border-t border-[#EBE6DD] dark:border-[#3D322B] px-3 py-2 shadow-lg transition-colors duration-300"
      >
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          {/* Tab 1: Products */}
          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-h-[48px] ${
              activeTab === 'products'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <div className="relative">
              <Package className="w-5 h-5" />
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {lowStockProducts.length}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">Productos</span>
          </button>

          {/* Tab 2: Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-h-[48px] ${
              activeTab === 'analytics'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">Analíticas</span>
          </button>

          {/* Tab 3: Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-h-[48px] ${
              activeTab === 'settings'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] mt-1 tracking-tight">Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

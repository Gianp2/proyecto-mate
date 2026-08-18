import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Settings,
  BarChart3,
  LogOut,
  Search,
  X,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sun,
  Moon,
  Download,
} from 'lucide-react';
import {
  Product,
  StoreSettings,
  AnalyticsSummary,
  StockStatus,
  Category,
} from '../../types';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchSettings,
  updateSettings,
  fetchAnalytics,
  removeAdminToken,
} from '../../services/api';
import { ProductFormModal } from './ProductFormModal';
import { ProductTableView } from './ProductTableView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';

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
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'analytics' | 'settings'
  >('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================================================================
  // ADMIN THEME
  // =========================================================================

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

  const isDarkMode =
    darkMode !== undefined ? darkMode : internalDarkMode;

  const handleToggleDark = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
      return;
    }

    const next = !internalDarkMode;

    setInternalDarkMode(next);

    try {
      localStorage.setItem(
        'pampa_theme',
        next ? 'dark' : 'light'
      );
    } catch (e) {
      console.warn('Theme save error:', e);
    }

    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // =========================================================================
  // SEARCH & FILTERS
  // =========================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [onlyLowStockFilter, setOnlyLowStockFilter] = useState(false);

  const isLowStockProduct = (p: Product) => {
    if (
      p.stockStatus === 'Agotado' ||
      p.stockStatus === 'Últimas unidades'
    ) {
      return true;
    }

    if (
      p.stockQuantity !== undefined &&
      p.stockQuantity < 3
    ) {
      return true;
    }

    return false;
  };

  const lowStockProducts = products.filter(isLowStockProduct);

  // =========================================================================
  // MODAL & STATES
  // =========================================================================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Partial<Product> | null>(null);

  const [savingProduct, setSavingProduct] = useState(false);

  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  const [deletingProductName, setDeletingProductName] =
    useState<string>('');

  const [isDeleting, setIsDeleting] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // =========================================================================
  // LOAD DATA
  // =========================================================================

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

      if (stats) {
        setAnalytics(stats);
      }
    } catch (err: any) {
      setError(
        err.message || 'Error al cargar datos del panel'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // LOGOUT
  // =========================================================================

  const handleLogout = () => {
    removeAdminToken();
    onLogout();
  };

  // =========================================================================
  // PRODUCT ACTIONS
  // =========================================================================

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        active: !product.active,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id ? updated : p
        )
      );
    } catch (err: any) {
      alert(
        err.message || 'Error al cambiar visibilidad'
      );
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, {
        featured: !product.featured,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id ? updated : p
        )
      );
    } catch (err: any) {
      alert(
        err.message || 'Error al cambiar destacado'
      );
    }
  };

  const handleQuickStockChange = async (
    product: Product,
    delta: number
  ) => {
    const currentQty = product.stockQuantity ?? 10;
    const newQty = Math.max(
      0,
      currentQty + delta
    );

    let newStatus: StockStatus =
      product.stockStatus || 'Disponible';

    if (newQty === 0) {
      newStatus = 'Agotado';
    } else if (newQty < 3) {
      newStatus = 'Últimas unidades';
    } else if (
      newStatus === 'Agotado' ||
      newStatus === 'Últimas unidades'
    ) {
      newStatus = 'Disponible';
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              stockQuantity: newQty,
              stockStatus: newStatus,
            }
          : p
      )
    );

    try {
      const updated = await updateProduct(
        product.id,
        {
          stockQuantity: newQty,
          stockStatus: newStatus,
        }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id ? updated : p
        )
      );
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? product : p
        )
      );

      alert(
        err.message || 'Error al actualizar stock'
      );
    }
  };

  // =========================================================================
  // OPEN PRODUCT MODAL
  // =========================================================================

  const handleOpenProductModal = (
    product?: Product
  ) => {
    if (product) {
      setEditingProduct({
        ...product,
      });
    } else {
      setEditingProduct({
        name: '',
        subtitle: '',
        category: 'Mates',
        description: '',
        price: 0,
        image: '',
        stockStatus: 'Disponible',
        stockQuantity: 10,
        featured: false,
        active: true,
        features: [
          'Calidad artesanal garantizada',
          'Material premium',
        ],
        variants: [],
      });
    }

    setIsModalOpen(true);
  };

  // =========================================================================
  // SAVE PRODUCT
  // =========================================================================

  const handleSaveProduct = async (
    productData: Partial<Product>
  ) => {
    setSavingProduct(true);

    try {
      if (productData.id) {
        const updated = await updateProduct(
          productData.id,
          productData
        );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === updated.id ? updated : p
          )
        );
      } else {
        const created = await createProduct(
          productData
        );

        setProducts((prev) => [
          created,
          ...prev,
        ]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert(
        err.message || 'Error al guardar el producto'
      );
    } finally {
      setSavingProduct(false);
    }
  };

  // =========================================================================
  // DELETE PRODUCT
  // =========================================================================

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;

    setIsDeleting(true);

    try {
      await deleteProduct(deletingProductId);

      setProducts((prev) =>
        prev.filter(
          (p) => p.id !== deletingProductId
        )
      );

      setDeletingProductId(null);
    } catch (err: any) {
      alert(
        err.message || 'Error al eliminar producto'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================================
  // SAVE SETTINGS
  // =========================================================================

  const handleSaveSettings = async (
    form: Partial<StoreSettings>
  ) => {
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const updated = await updateSettings(form);

      setSettings(updated);
      setSettingsSuccess(true);

      setTimeout(() => {
        setSettingsSuccess(false);
      }, 3500);
    } catch (err: any) {
      alert(
        err.message ||
          'Error al guardar configuración'
      );
    } finally {
      setSavingSettings(false);
    }
  };

  // =========================================================================
  // EXPORT CATALOG
  // =========================================================================

  const handleExportCatalog = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          products,
          null,
          2
        )
      );

    const downloadAnchor =
      document.createElement('a');

    downloadAnchor.setAttribute(
      'href',
      dataStr
    );

    downloadAnchor.setAttribute(
      'download',
      `catalogo_pampa_${new Date()
        .toISOString()
        .slice(0, 10)}.json`
    );

    document.body.appendChild(
      downloadAnchor
    );

    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // =========================================================================
  // FILTERED PRODUCTS
  // =========================================================================

  const filteredProducts =
    products.filter((p) => {
      const matchesCategory =
        categoryFilter === 'Todos' ||
        p.category === categoryFilter;

      const matchesSearch =
        !searchQuery ||
        p.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        p.category
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (p.subtitle &&
          p.subtitle
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ));

      const matchesLowStock =
        !onlyLowStockFilter ||
        isLowStockProduct(p);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesLowStock
      );
    });

  const totalInventoryValue =
    products.reduce(
      (acc, p) =>
        acc +
        p.price *
          (p.stockQuantity ?? 1),
      0
    );

  // =========================================================================
  // LOADING
  // =========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#181412] text-[#2C221E] dark:text-[#F4EFEA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4B5A36] dark:text-[#809761] mx-auto" />

          <p className="text-sm font-semibold text-[#2C221E] dark:text-[#F4EFEA]">
            Cargando panel de administración...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN
  // =========================================================================

  return (
    <div className="fixed inset-0 w-screen h-screen max-w-full max-h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#181412] text-[#2C221E] dark:text-[#F4EFEA] flex flex-col md:flex-row transition-colors duration-300 select-none">

      {/* =====================================================================
          MOBILE HEADER
      ====================================================================== */}

      <header className="md:hidden shrink-0 z-30 bg-white/95 dark:bg-[#241E1B]/95 backdrop-blur-md border-b border-[#EBE6DD] dark:border-[#3D322B] px-4 py-3 flex items-center justify-between shadow-2xs">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center font-serif-title font-bold text-base shadow-xs">
            P
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-title font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA] block leading-none">
                PAMPA
              </span>

              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761]">
                Admin
              </span>
            </div>

            <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489] font-medium mt-0.5 block">
              {activeTab === 'products'
                ? 'Catálogo de Productos'
                : activeTab === 'analytics'
                ? 'Métricas en Vivo'
                : 'Ajustes del Negocio'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleDark}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] transition-colors cursor-pointer border border-transparent hover:border-[#EBE6DD] dark:hover:border-[#3D322B]"
            title="Cambiar tema"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#4B5A36]" />
            )}
          </button>

          <button
            type="button"
            onClick={onReturnToStore}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] transition-colors cursor-pointer border border-transparent hover:border-[#EBE6DD] dark:hover:border-[#3D322B]"
            title="Ver tienda"
            aria-label="Ver tienda pública"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          DESKTOP SIDEBAR
      ====================================================================== */}

      <aside className="hidden md:flex w-72 bg-white dark:bg-[#241E1B] border-r border-[#EBE6DD] dark:border-[#3D322B] shrink-0 p-5 flex-col justify-between transition-colors duration-300 h-full overflow-y-auto">

        <div className="space-y-6">

          {/* BRAND */}
          <div className="flex items-center justify-between pb-5 border-b border-[#EBE6DD] dark:border-[#3D322B]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center font-serif-title font-bold text-xl shadow-md">
                P
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-title font-bold text-base text-[#2C221E] dark:text-[#F4EFEA] block leading-none">
                    PAMPA
                  </span>

                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761]">
                    Admin
                  </span>
                </div>

                <span className="text-xs text-[#7C6E65] dark:text-[#A39489] font-medium mt-1 block">
                  {settings?.brandName ||
                    'Emprendimiento'}
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav
            className="flex flex-col gap-2"
            aria-label="Navegación lateral de administración"
          >
            <button
              type="button"
              onClick={() =>
                setActiveTab('products')
              }
              className={`flex items-center justify-between w-full px-4 py-3.5 min-h-[50px] rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] shadow-sm font-bold scale-[1.02]'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                <span>Productos</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                    activeTab === 'products'
                      ? 'bg-white/20 text-white dark:text-[#181412]'
                      : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#7C6E65] dark:text-[#A39489]'
                  }`}
                >
                  {products.length}
                </span>

                {lowStockProducts.length >
                  0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                      activeTab === 'products'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                    title={`${lowStockProducts.length} productos con stock crítico`}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>
                      {
                        lowStockProducts.length
                      }
                    </span>
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab('analytics')
              }
              className={`flex items-center justify-between w-full px-4 py-3.5 min-h-[50px] rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] shadow-sm font-bold scale-[1.02]'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <span>
                  Analíticas Real-time
                </span>
              </div>

              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                title="Datos en vivo"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab('settings')
              }
              className={`flex items-center justify-between w-full px-4 py-3.5 min-h-[50px] rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] shadow-sm font-bold scale-[1.02]'
                  : 'text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </div>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="pt-4 border-t border-[#EBE6DD] dark:border-[#3D322B] space-y-2">

          <button
            type="button"
            onClick={handleToggleDark}
            className="w-full flex items-center justify-between bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2A231F] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] font-semibold text-xs min-h-[46px] px-3.5 rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#4B5A36]" />
              )}

              <span>
                {isDarkMode
                  ? 'Tema Claro'
                  : 'Tema Oscuro'}
              </span>
            </div>

            <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] bg-white dark:bg-[#28211D] px-2 py-0.5 rounded-lg border border-[#EBE6DD] dark:border-[#3D322B]">
              {isDarkMode
                ? 'Oscuro'
                : 'Claro'}
            </span>
          </button>

          <button
            type="button"
            onClick={onReturnToStore}
            className="w-full flex items-center justify-center gap-2.5 bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2A231F] text-[#2C221E] dark:text-[#F4EFEA] font-semibold text-xs min-h-[46px] px-3.5 rounded-2xl transition-all cursor-pointer border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs min-h-[46px] px-3.5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT
      ====================================================================== */}

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto overflow-x-hidden min-w-0">

        {/* ===================================================================
            PRODUCTS
        ==================================================================== */}

        {activeTab === 'products' && (
          <div className="space-y-5">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                    Catálogo de Productos
                  </h1>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EFECE6] dark:bg-[#382F2A] text-[#5C4F48] dark:text-[#C5BBB4]">
                    {products.length}{' '}
                    {products.length === 1
                      ? 'ítem'
                      : 'ítems'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489] mt-0.5">
                  Gestioná precios, stock,
                  fotos con Cloudinary y
                  visibilidad de tus mates y
                  accesorios.
                </p>
              </div>

              {/* ============================================================
                  QUICK ACTIONS
                  ============================================================ */}

              <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto">

                {/* EXPORT */}
                <button
                  type="button"
                  onClick={
                    handleExportCatalog
                  }
                  className="
                    shrink-0
                    inline-flex
                    items-center
                    justify-center
                    gap-1.5
                    h-10
                    px-3
                    sm:px-3.5
                    rounded-xl
                    bg-white
                    dark:bg-[#241E1B]
                    hover:bg-[#FAF8F5]
                    dark:hover:bg-[#2E2622]
                    text-[#5C4F48]
                    dark:text-[#C5BBB4]
                    border
                    border-[#EBE6DD]
                    dark:border-[#3D322B]
                    text-[11px]
                    sm:text-xs
                    font-bold
                    cursor-pointer
                    shadow-2xs
                    transition-colors
                  "
                  title="Exportar catálogo en formato JSON"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />

                  <span className="hidden sm:inline whitespace-nowrap">
                    Exportar
                  </span>
                </button>

                {/* NUEVO PRODUCTO */}
                <button
                  type="button"
                  onClick={() =>
                    handleOpenProductModal()
                  }
                  className="
                    shrink-0
                    inline-flex
                    items-center
                    justify-center
                    gap-1.5
                    h-10
                    px-3.5
                    sm:px-4
                    rounded-xl
                    bg-[#4B5A36]
                    hover:bg-[#3A4729]
                    dark:bg-[#809761]
                    dark:hover:bg-[#6b824e]
                    text-white
                    dark:text-[#181412]
                    font-bold
                    text-[11px]
                    sm:text-xs
                    whitespace-nowrap
                    shadow-xs
                    transition-all
                    active:scale-[0.98]
                    cursor-pointer
                  "
                >
                  <Plus className="w-4 h-4 shrink-0" />

                  <span className="whitespace-nowrap">
                    Nuevo producto
                  </span>
                </button>
              </div>
            </div>

            {/* =================================================================
                METRICS
            ================================================================== */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] block">
                  Total Productos
                </span>

                <span className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                  {products.length}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] block">
                  Activos en Tienda
                </span>

                <span className="font-serif-title font-bold text-lg text-emerald-700 dark:text-emerald-400">
                  {
                    products.filter(
                      (p) => p.active
                    ).length
                  }
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border shadow-2xs space-y-0.5 ${
                  lowStockProducts.length >
                  0
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-[#241E1B] border-[#EBE6DD] dark:border-[#3D322B]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-200 block">
                  Stock Crítico (&lt; 3)
                </span>

                <span className="font-serif-title font-bold text-lg text-amber-900 dark:text-amber-300">
                  {lowStockProducts.length}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] block">
                  Valor Estimado
                </span>

                <span className="font-serif-title font-bold text-lg font-mono text-[#2C221E] dark:text-[#F4EFEA]">
                  $
                  {totalInventoryValue.toLocaleString(
                    'es-AR'
                  )}
                </span>
              </div>
            </div>

            {/* =================================================================
                STOCK ALERT
            ================================================================== */}

            {lowStockProducts.length >
              0 && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">

                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        Alerta de Reposición
                        de Stock
                      </h3>

                      <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono">
                        {
                          lowStockProducts.length
                        }{' '}
                        {lowStockProducts.length ===
                        1
                          ? 'producto'
                          : 'productos'}
                      </span>
                    </div>

                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      Tenés{' '}
                      {
                        lowStockProducts.length
                      }{' '}
                      {lowStockProducts.length ===
                      1
                        ? 'producto'
                        : 'productos'}{' '}
                      con inventario bajo
                      (&lt; 3 unidades o
                      agotados).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOnlyLowStockFilter(
                      !onlyLowStockFilter
                    )
                  }
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 ${
                    onlyLowStockFilter
                      ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#1E1A17] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />

                  <span>
                    {onlyLowStockFilter
                      ? 'Mostrar Todos'
                      : 'Filtrar Críticos'}
                  </span>
                </button>
              </div>
            )}

            {/* =================================================================
                SEARCH & CATEGORY FILTER
            ================================================================== */}

            <div className="space-y-3 bg-white dark:bg-[#241E1B] p-3.5 sm:p-4 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">

              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F87] dark:text-[#7C6E65]" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Buscar por nombre, subtítulo o categoría..."
                  className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery('')
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#7C6E65] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622]"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* CATEGORY CHIPS */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">

                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter(
                      'Todos'
                    );
                    setOnlyLowStockFilter(
                      false
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all min-h-[38px] flex items-center gap-1.5 ${
                    categoryFilter ===
                      'Todos' &&
                    !onlyLowStockFilter
                      ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
                  }`}
                >
                  <span>Todos</span>

                  <span className="opacity-70 text-[10px]">
                    ({products.length})
                  </span>
                </button>

                {(
                  [
                    'Mates',
                    'Yerbas',
                    'Bombillas',
                    'Termos',
                    'Accesorios',
                  ] as Category[]
                ).map((cat) => {
                  const count =
                    products.filter(
                      (p) =>
                        p.category === cat
                    ).length;

                  const isSelected =
                    categoryFilter ===
                      cat &&
                    !onlyLowStockFilter;

                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(
                          cat
                        );
                        setOnlyLowStockFilter(
                          false
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all min-h-[38px] flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
                          : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
                      }`}
                    >
                      <span>{cat}</span>

                      <span className="opacity-70 text-[10px]">
                        ({count})
                      </span>
                    </button>
                  );
                })}

                {lowStockProducts.length >
                  0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setOnlyLowStockFilter(
                        !onlyLowStockFilter
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 min-h-[38px] transition-all ${
                      onlyLowStockFilter
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />

                    <span>
                      Críticos (
                      {
                        lowStockProducts.length
                      }
                      )
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* =================================================================
                PRODUCTS TABLE
            ================================================================== */}

            <ProductTableView
              products={filteredProducts}
              onEdit={(p) =>
                handleOpenProductModal(p)
              }
              onDelete={(id, name) => {
                setDeletingProductId(id);
                setDeletingProductName(name);
              }}
              onToggleActive={
                handleToggleActive
              }
              onToggleFeatured={
                handleToggleFeatured
              }
              onQuickStockChange={
                handleQuickStockChange
              }
            />
          </div>
        )}

        {/* ===================================================================
            ANALYTICS
        ==================================================================== */}

        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            products={products}
            isDarkMode={isDarkMode}
            onRestockProduct={(p) => {
              setActiveTab('products');
              handleOpenProductModal(p);
            }}
            onGoToProducts={() => {
              setActiveTab('products');
              setOnlyLowStockFilter(true);
            }}
          />
        )}

        {/* ===================================================================
            SETTINGS
        ==================================================================== */}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSave={handleSaveSettings}
            saving={savingSettings}
            success={settingsSuccess}
          />
        )}
      </main>

      {/* =====================================================================
          PRODUCT FORM MODAL
      ====================================================================== */}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        product={editingProduct}
        onSave={handleSaveProduct}
        saving={savingProduct}
      />

      {/* =====================================================================
          DELETE MODAL
      ====================================================================== */}

      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">

          <div className="bg-white dark:bg-[#181412] rounded-3xl p-6 border border-[#EBE6DD] dark:border-[#3D322B] shadow-xl max-w-sm w-full space-y-4 text-center">

            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
              ¿Eliminar producto?
            </h3>

            <p className="text-xs text-[#7C6E65] dark:text-[#A39489] leading-relaxed">
              ¿Estás seguro de que querés
              eliminar &quot;
              {deletingProductName}
              &quot;? Esta acción no se puede
              deshacer.
            </p>

            <div className="flex items-center gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setDeletingProductId(null)
                }
                className="flex-1 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] min-h-[44px] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmDelete
                }
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] shadow-xs cursor-pointer"
              >
                {isDeleting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}

                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================================== */}

      <nav
        aria-label="Navegación móvil del panel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#241E1B]/95 backdrop-blur-xl border-t border-[#EBE6DD] dark:border-[#3D322B] px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors duration-300"
      >
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto items-center">

          {/* PRODUCTOS */}
          <button
            type="button"
            onClick={() =>
              setActiveTab('products')
            }
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer relative min-h-[52px] ${
              activeTab === 'products'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15 shadow-2xs scale-105'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <div className="relative">
              <Package className="w-5 h-5" />

              {lowStockProducts.length >
                0 && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {
                    lowStockProducts.length
                  }
                </span>
              )}
            </div>

            <span className="text-[11px] mt-1 tracking-tight">
              Productos
            </span>
          </button>

          {/* ANALYTICS */}
          <button
            type="button"
            onClick={() =>
              setActiveTab('analytics')
            }
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer relative min-h-[52px] ${
              activeTab === 'analytics'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15 shadow-2xs scale-105'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />

            <span className="text-[11px] mt-1 tracking-tight">
              Métricas
            </span>
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() =>
              setActiveTab('settings')
            }
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer relative min-h-[52px] ${
              activeTab === 'settings'
                ? 'text-[#4B5A36] dark:text-[#809761] font-bold bg-[#4B5A36]/10 dark:bg-[#809761]/15 shadow-2xs scale-105'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <Settings className="w-5 h-5" />

            <span className="text-[11px] mt-1 tracking-tight">
              Ajustes
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
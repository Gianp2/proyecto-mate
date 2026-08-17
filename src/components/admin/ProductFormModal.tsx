import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  CheckCircle2,
  Tag,
  Percent,
  Star,
  Coffee,
  Leaf,
  Sparkles,
  Flame,
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Category, StockStatus } from '../../types';
import { CloudinaryImageUploader } from './CloudinaryImageUploader';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<Product> | null;
  onSave: (product: Partial<Product>) => Promise<void>;
  saving: boolean;
}

const CATEGORIES: { value: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'Mates', label: 'Mates', icon: Coffee },
  { value: 'Yerbas', label: 'Yerbas', icon: Leaf },
  { value: 'Bombillas', label: 'Bombillas', icon: Sparkles },
  { value: 'Termos', label: 'Termos', icon: Flame },
  { value: 'Accesorios', label: 'Accesorios', icon: ShoppingBag },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  saving,
}) => {
  if (!isOpen || !product) return null;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    category: 'Mates',
    description: '',
    price: 0,
    originalPrice: undefined,
    image: '',
    stockStatus: 'Disponible',
    stockQuantity: 10,
    featured: false,
    active: true,
    ...product,
  });

  // Keep state synchronized with selected product
  useEffect(() => {
    if (product) {
      setFormData({
        name: '',
        subtitle: '',
        category: 'Mates',
        description: '',
        price: 0,
        originalPrice: undefined,
        image: '',
        stockStatus: 'Disponible',
        stockQuantity: 10,
        featured: false,
        active: true,
        ...product,
      });
    }
  }, [product]);

  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string }>({});

  const isEditing = Boolean(formData.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; price?: string } = {};

    if (!formData.name?.trim()) {
      errors.name = 'Por favor ingresá el nombre del producto.';
    }

    if (formData.price === undefined || formData.price === null || formData.price < 0) {
      errors.price = 'El precio debe ser un número válido mayor o igual a 0.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    await onSave(formData);
  };

  const handleStockQtyChange = (qtyStr: string) => {
    const qty = Math.max(0, parseInt(qtyStr, 10) || 0);
    let autoStatus: StockStatus = formData.stockStatus || 'Disponible';
    if (qty === 0) autoStatus = 'Agotado';
    else if (qty < 3) autoStatus = 'Últimas unidades';
    else if (autoStatus === 'Agotado' || autoStatus === 'Últimas unidades') autoStatus = 'Disponible';

    setFormData({
      ...formData,
      stockQuantity: qty,
      stockStatus: autoStatus,
    });
  };

  const isLowStock =
    (formData.stockQuantity !== undefined && formData.stockQuantity < 3) ||
    formData.stockStatus === 'Últimas unidades' ||
    formData.stockStatus === 'Agotado';

  const discountPercent =
    formData.originalPrice && formData.price && formData.originalPrice > formData.price
      ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#241E1B] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col transition-colors">
        
        {/* ========================================================================= */}
        {/* 1. UNIFIED MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] dark:bg-[#1C1815] border-b border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#2C221E] dark:text-[#F4EFEA] leading-tight truncate">
                {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <p className="text-xs text-[#7C6E65] dark:text-[#A39489] mt-0.5 truncate">
                {isEditing
                  ? `Modificando ${formData.name || 'producto'}`
                  : 'Cargá los datos esenciales para publicar en tu catálogo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#28221E] text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] hover:bg-[#EFECE6] dark:hover:bg-[#342C26] transition-colors cursor-pointer border border-[#EBE6DD] dark:border-[#3D322B] shrink-0 ml-2 flex items-center justify-center"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. FORM BODY - Single Unified Orderly Card */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
          
          {/* Top Section: Category & Visibility (Toggles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider">
                1. Categoría del Producto *
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = (formData.category || 'Mates') === cat.value;
                const CategoryIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[56px] ${
                      isSelected
                        ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] border-[#4B5A36] shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] border-[#EBE6DD] dark:border-[#3D322B] hover:border-[#4B5A36]'
                    }`}
                  >
                    <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-white dark:text-[#181412]' : 'text-[#4B5A36] dark:text-[#809761]'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Layout: Photo on one side, Essential Data on the other */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Foto Upload & Fast Toggles */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-2">
                  2. Foto del Producto
                </label>
                <CloudinaryImageUploader
                  label="Subir foto o usar cámara"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  folder="pampa_catalog"
                />
              </div>

              {/* Publication Toggles */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* Active Toggle */}
                <label className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[48px] ${
                  formData.active !== false
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#EBE6DD] dark:border-[#3D322B]'
                }`}>
                  <div>
                    <span className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                      Visible en la tienda
                    </span>
                    <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489]">
                      Disponible para encargar
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-[#4B5A36] dark:accent-[#809761] cursor-pointer"
                  />
                </label>

                {/* Featured Toggle */}
                <label className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[48px] ${
                  formData.featured
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#EBE6DD] dark:border-[#3D322B]'
                }`}>
                  <div>
                    <span className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-1">
                      <span>Destacado en Inicio</span>
                      <Star className={`w-3.5 h-3.5 ${formData.featured ? 'text-amber-500 fill-amber-500' : 'text-[#7C6E65] dark:text-[#A39489]'}`} />
                    </span>
                    <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489]">
                      Sección principal
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Product Details, Price and Stock */}
            <div className="md:col-span-7 space-y-4">
              <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider">
                3. Datos, Precios y Stock
              </label>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="Ej: Mate Imperial de Calabaza"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] transition-colors min-h-[44px] ${
                    formErrors.name ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20' : 'border-[#EBE6DD] dark:border-[#3D322B]'
                  }`}
                />
                {formErrors.name && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Subtitle / Short spec */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                  Detalle corto (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Ej: Virola cincelada · Cuero vacuno"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761]"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sale Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                    Precio ($ ARS) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#7C6E65] dark:text-[#A39489]">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price ?? 0}
                      onChange={(e) => {
                        setFormData({ ...formData, price: Number(e.target.value) });
                        if (formErrors.price) setFormErrors({ ...formErrors, price: undefined });
                      }}
                      className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border text-sm font-bold font-mono text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[44px] ${
                        formErrors.price ? 'border-rose-400 dark:border-rose-600' : 'border-[#EBE6DD] dark:border-[#3D322B]'
                      }`}
                    />
                  </div>
                  {formErrors.price && (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                      {formErrors.price}
                    </span>
                  )}
                </div>

                {/* Strikethrough Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1 flex items-center justify-between">
                    <span>Precio Anterior ($ Opcional)</span>
                    {discountPercent !== null && discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#7C6E65] dark:text-[#A39489]">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Para tachado"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Stock and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Stock Quantity */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                    Unidades en Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity ?? 10}
                    onChange={(e) => handleStockQtyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-mono font-bold text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[44px]"
                  />
                </div>

                {/* Stock Status Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                    Estado de Stock
                  </label>
                  <select
                    value={formData.stockStatus || 'Disponible'}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as StockStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] cursor-pointer min-h-[44px]"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Últimas unidades">Últimas unidades</option>
                    <option value="Agotado">Agotado</option>
                    <option value="Próximamente">Próximamente</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-[#5C4F48] dark:text-[#A39489] mb-1">
                  Descripción breve (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contale a tus clientes por qué este producto es especial..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] resize-none"
                />
              </div>

              {isLowStock && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="leading-tight">
                    <strong>Aviso de stock:</strong> Mostrará aviso de reposición.
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. MODAL FOOTER BAR (AL FINAL DE LA CARD DEL FORM) */}
          {/* ========================================================================= */}
          <div className="pt-5 border-t border-[#EBE6DD] dark:border-[#3D322B] flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#241E1B] pb-2 z-10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] transition-all cursor-pointer min-h-[48px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer min-h-[48px] active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isEditing ? 'Guardar Cambios' : 'Publicar Producto'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

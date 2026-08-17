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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] dark:bg-[#181412] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xl w-full max-w-5xl overflow-hidden max-h-[94vh] flex flex-col transition-colors">
        
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER - High-contrast & clear context */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#241E1B] border-b border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center shrink-0 border border-[#4B5A36]/20">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#2C221E] dark:text-[#F4EFEA] leading-tight truncate">
                  {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  formData.active !== false
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}>
                  {formData.active !== false ? 'Activo' : 'Oculto'}
                </span>
              </div>
              <p className="text-xs text-[#7C6E65] dark:text-[#A39489] mt-0.5 truncate">
                {isEditing
                  ? `Modificando ${formData.name || 'producto'}`
                  : 'Completá los datos y cargá la foto de tu producto'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] transition-colors cursor-pointer border border-[#EBE6DD] dark:border-[#3D322B] shrink-0 ml-2"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. FORM BODY - Responsive 2-column layout */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: Foto y Visibilidad */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Media Card */}
              <div className="bg-white dark:bg-[#241E1B] p-4 sm:p-5 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2EFE9] dark:border-[#3D322B]">
                  <div className="w-7 h-7 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                    Foto del Producto
                  </h4>
                </div>

                <CloudinaryImageUploader
                  label="Seleccionar o Capturar Foto"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  folder="pampa_catalog"
                />
              </div>

              {/* Status and Store Visibility Card */}
              <div className="bg-white dark:bg-[#241E1B] p-4 sm:p-5 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2EFE9] dark:border-[#3D322B]">
                  <div className="w-7 h-7 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                    Opciones de Publicación
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {/* Active Toggle */}
                  <label className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[50px] ${
                    formData.active !== false
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#EBE6DD] dark:border-[#3D322B]'
                  }`}>
                    <div>
                      <span className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                        Visible en la Tienda
                      </span>
                      <span className="text-[11px] text-[#7C6E65] dark:text-[#A39489]">
                        Los clientes pueden ver y encargar este producto
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 accent-[#4B5A36] dark:accent-[#809761] cursor-pointer"
                    />
                  </label>

                  {/* Featured Toggle */}
                  <label className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer min-h-[50px] ${
                    formData.featured
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                      : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#EBE6DD] dark:border-[#3D322B]'
                  }`}>
                    <div>
                      <span className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-1.5">
                        <span>Destacado en Inicio</span>
                        <Star className={`w-3.5 h-3.5 ${formData.featured ? 'text-amber-500 fill-amber-500' : 'text-[#7C6E65] dark:text-[#A39489]'}`} />
                      </span>
                      <span className="text-[11px] text-[#7C6E65] dark:text-[#A39489]">
                        Se muestra en la sección principal
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Info, Categoría, Precios y Stock */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Section 1: General Info & Category Chips */}
              <div className="bg-white dark:bg-[#241E1B] p-4 sm:p-5 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#F2EFE9] dark:border-[#3D322B]">
                  <div className="w-7 h-7 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                    Información Básica
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Category Selector with visual touch buttons */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-2">
                      Categoría *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CATEGORIES.map((cat) => {
                        const isSelected = (formData.category || 'Mates') === cat.value;
                        const CategoryIcon = cat.icon;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.value })}
                            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[52px] ${
                              isSelected
                                ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] border-[#4B5A36] shadow-xs scale-[1.02]'
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

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Nombre del Producto *
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
                      className={`w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] transition-colors min-h-[48px] ${
                        formErrors.name ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20' : 'border-[#EBE6DD] dark:border-[#3D322B]'
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Subtitle / Details */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Detalle corto (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Ej: Virola cincelada · Cuero vacuno"
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Escribí una descripción breve para los clientes..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Stock Inventory */}
              <div className="bg-white dark:bg-[#241E1B] p-4 sm:p-5 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F2EFE9] dark:border-[#3D322B]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                      Precios y Stock
                    </h4>
                  </div>
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                      <Percent className="w-3 h-3" />
                      <span>{discountPercent}% OFF</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sale Price */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Precio de Venta ($ ARS) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[#7C6E65] dark:text-[#A39489]">
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
                        className={`w-full pl-9 pr-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border text-base font-bold font-mono text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[48px] ${
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

                  {/* Original / Strikethrough Price */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Precio Anterior / Tachado ($ Opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[#7C6E65] dark:text-[#A39489]">
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
                        placeholder="Para mostrar descuento"
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[48px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Unidades Disponibles
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity ?? 10}
                      onChange={(e) => handleStockQtyChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-mono font-bold text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] min-h-[48px]"
                    />
                  </div>

                  {/* Stock Status Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                      Estado
                    </label>
                    <select
                      value={formData.stockStatus || 'Disponible'}
                      onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as StockStatus })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36] cursor-pointer min-h-[48px]"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Últimas unidades">Últimas unidades</option>
                      <option value="Agotado">Agotado</option>
                      <option value="Próximamente">Próximamente</option>
                    </select>
                  </div>
                </div>

                {isLowStock && (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="leading-tight">
                      <strong>Aviso de stock:</strong> Este producto mostrará badge de reposición.
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. MODAL FOOTER BAR */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-[#EBE6DD] dark:border-[#3D322B] flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-[#FAF8F5] dark:bg-[#181412] pb-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#1E1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] transition-colors cursor-pointer min-h-[48px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer min-h-[48px] active:scale-98"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{isEditing ? 'Guardar Cambios' : 'Publicar Producto'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

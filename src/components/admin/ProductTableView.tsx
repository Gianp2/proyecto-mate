import React, { useState, useMemo } from 'react';
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ArrowUpDown,
  AlertTriangle,
  Grid,
  List,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product, StockStatus } from '../../types';
import { OptimizedImage } from '../OptimizedImage';

interface ProductTableViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onToggleActive: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  onQuickStockChange: (product: Product, delta: number) => void;
  onSelectProduct?: (product: Product) => void;
  selectedProductId?: string | null;
}

type SortField = 'name' | 'price' | 'stockQuantity' | 'category';
type SortDirection = 'asc' | 'desc';

export const ProductTableView: React.FC<ProductTableViewProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onQuickStockChange,
  onSelectProduct,
  selectedProductId,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'stockQuantity') {
        aVal = a.stockQuantity ?? 0;
        bVal = b.stockQuantity ?? 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [products, sortField, sortDirection]);

  const isLowStock = (product: Product) => {
    return (
      (product.stockQuantity !== undefined && product.stockQuantity < 3) ||
      product.stockStatus === 'Últimas unidades' ||
      product.stockStatus === 'Agotado'
    );
  };

  if (products.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h4 className="font-serif-title font-bold text-base sm:text-lg text-[#2C221E] dark:text-[#F4EFEA]">
          No se encontraron productos
        </h4>
        <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489] max-w-sm mx-auto">
          Probá ajustando el término de búsqueda o seleccioná otra categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Layout View Mode Switcher (Grid vs Table) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E65] dark:text-[#A39489]">
          Mostrando {sortedProducts.length} {sortedProducts.length === 1 ? 'producto' : 'productos'}
        </span>

        <div className="flex items-center gap-1 bg-white dark:bg-[#241E1B] p-1 rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] shadow-2xs'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cuadrícula</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] shadow-2xs'
                : 'text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MOBILE-FIRST RESPONSIVE PRODUCT CARDS GRID */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {sortedProducts.map((p) => {
            const isLow = isLowStock(p);
            const isOut = p.stockStatus === 'Agotado' || p.stockQuantity === 0;

            return (
              <div
                key={p.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 bg-white dark:bg-[#241E1B] shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                  isOut
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : isLow
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-[#EBE6DD] dark:border-[#3D322B]'
                }`}
              >
                {/* Upper Section: Image + Badges + Title */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail Card */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] shrink-0 relative bg-[#FAF8F5] dark:bg-[#1E1A17] shadow-2xs">
                      {p.image ? (
                        <OptimizedImage src={p.image} alt={p.name} aspectRatio="square" sizes="90px" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#7C6E65] p-2 text-center">
                          <Package className="w-6 h-6 opacity-40 mb-1" />
                          <span className="text-[9px] leading-tight">Sin foto</span>
                        </div>
                      )}

                      {p.featured && (
                        <span
                          className="absolute top-1.5 left-1.5 bg-amber-500 text-white p-1 rounded-lg shadow-xs"
                          title="Producto Destacado"
                        >
                          <Star className="w-3 h-3 fill-white" />
                        </span>
                      )}
                    </div>

                    {/* Metadata & Price */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] border border-[#EBE6DD] dark:border-[#3D322B]">
                          {p.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          p.active
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}>
                          {p.active ? 'Activo' : 'Oculto'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-[#2C221E] dark:text-[#F4EFEA] leading-snug line-clamp-2">
                        {p.name}
                      </h4>

                      {p.subtitle && (
                        <p className="text-[11px] text-[#7C6E65] dark:text-[#A39489] line-clamp-1 mt-0.5">
                          {p.subtitle}
                        </p>
                      )}

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-serif-title font-bold text-base sm:text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                          ${p.price.toLocaleString('es-AR')}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-xs text-[#9C8F87] line-through font-mono">
                            ${p.originalPrice.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Level Bar & Stepper */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          isOut
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                            : isLow
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80'
                            : 'bg-white dark:bg-[#28211D] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B]'
                        }`}
                      >
                        {p.stockStatus}
                      </span>
                      {isLow && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Reponer</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Stock Controls (Touch friendly min-h 44px) */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#241E1B] p-1 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B]">
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(p, -1)}
                        disabled={p.stockQuantity === 0}
                        className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Disminuir stock (-1)"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-mono font-bold text-xs text-[#2C221E] dark:text-[#F4EFEA] min-w-[32px] text-center">
                        {p.stockQuantity ?? 10}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(p, 1)}
                        className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#1E1A17] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                        title="Aumentar stock (+1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Mobile-First Touch Actions Grid (min-h-[44px]) */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#EBE6DD]/80 dark:border-[#3D322B]/80">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 hover:bg-[#4B5A36]/20 text-[#4B5A36] dark:text-[#809761] transition-colors cursor-pointer min-h-[44px]"
                    title="Editar producto"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold mt-0.5">Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleActive(p)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-colors cursor-pointer min-h-[44px] ${
                      p.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                    }`}
                    title={p.active ? 'Ocultar en tienda' : 'Mostrar en tienda'}
                  >
                    {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="text-[10px] font-bold mt-0.5">{p.active ? 'Activo' : 'Oculto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFeatured(p)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-colors cursor-pointer min-h-[44px] ${
                      p.featured
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                        : 'bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#7C6E65] dark:text-[#A39489] border-[#EBE6DD] dark:border-[#3D322B]'
                    }`}
                    title={p.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                  >
                    <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span className="text-[10px] font-bold mt-0.5">{p.featured ? 'Destacado' : 'Normal'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(p.id, p.name)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer min-h-[44px]"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold mt-0.5">Borrar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DESKTOP & WIDE TABLE VIEW */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#241E1B] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EBE6DD] dark:border-[#3D322B] bg-[#FAF8F5] dark:bg-[#1E1A17] text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] dark:text-[#A39489]">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-[#2C221E]" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      <span>Categoría</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-[#2C221E]" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      <span>Precio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-[#2C221E]" onClick={() => handleSort('stockQuantity')}>
                    <div className="flex items-center gap-1">
                      <span>Stock</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6DD] dark:divide-[#3D322B] text-xs">
                {sortedProducts.map((p) => {
                  const isLow = isLowStock(p);
                  const isOut = p.stockStatus === 'Agotado' || p.stockQuantity === 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17]/60 transition-colors"
                    >
                      {/* Product Photo & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] shrink-0 bg-[#FAF8F5] dark:bg-[#1E1A17]">
                            {p.image ? (
                              <OptimizedImage src={p.image} alt={p.name} aspectRatio="square" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#7C6E65]">
                                <Package className="w-4 h-4 opacity-40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                                {p.name}
                              </span>
                              {p.featured && (
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              )}
                            </div>
                            {p.subtitle && (
                              <span className="text-[11px] text-[#7C6E65] dark:text-[#A39489] block">
                                {p.subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FAF8F5] dark:bg-[#1E1A17] text-[#5C4F48] dark:text-[#A39489] border border-[#EBE6DD] dark:border-[#3D322B]">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-serif-title font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                        ${p.price.toLocaleString('es-AR')}
                      </td>

                      {/* Stock Stepper */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#1E1A17] p-1 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B]">
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(p, -1)}
                            disabled={p.stockQuantity === 0}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-[#28211D] hover:bg-[#EFECE6] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            aria-label="Restar una unidad de stock"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-xs text-[#2C221E] dark:text-[#F4EFEA] min-w-[28px] text-center">
                            {p.stockQuantity ?? 10}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(p, 1)}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-[#28211D] hover:bg-[#EFECE6] text-[#2C221E] dark:text-[#F4EFEA] font-bold text-xs flex items-center justify-center cursor-pointer"
                            aria-label="Sumar una unidad de stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : isLow
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {p.stockStatus}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#7C6E65] hover:text-[#4B5A36] hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17] transition-colors cursor-pointer"
                            title="Editar"
                            aria-label="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleActive(p)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#7C6E65] hover:text-[#2C221E] hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17] transition-colors cursor-pointer"
                            title={p.active ? 'Desactivar' : 'Activar'}
                            aria-label={p.active ? 'Ocultar producto' : 'Activar producto'}
                          >
                            {p.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(p.id, p.name)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar"
                            aria-label="Eliminar producto"
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
      )}
    </div>
  );
};

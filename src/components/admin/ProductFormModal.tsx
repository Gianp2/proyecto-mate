import React, { useEffect, useState } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertTriangle,
  Package,
  Star,
  Coffee,
  Leaf,
  Sparkles,
  Flame,
  ShoppingBag,
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

const CATEGORIES: {
  value: Category;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'Mates', label: 'Mates', icon: Coffee },
  { value: 'Yerbas', label: 'Yerbas', icon: Leaf },
  { value: 'Bombillas', label: 'Bombillas', icon: Sparkles },
  { value: 'Termos', label: 'Termos', icon: Flame },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  saving,
}) => {
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
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    price?: string;
  }>({});

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

      setFormErrors({});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isEditing = Boolean(formData.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      name?: string;
      price?: string;
    } = {};

    if (!formData.name?.trim()) {
      errors.name = 'Por favor ingresá el nombre del producto.';
    }

    if (
      formData.price === undefined ||
      formData.price === null ||
      formData.price < 0
    ) {
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

    if (qty === 0) {
      autoStatus = 'Agotado';
    } else if (qty < 3) {
      autoStatus = 'Últimas unidades';
    } else if (
      autoStatus === 'Agotado' ||
      autoStatus === 'Últimas unidades'
    ) {
      autoStatus = 'Disponible';
    }

    setFormData({
      ...formData,
      stockQuantity: qty,
      stockStatus: autoStatus,
    });
  };

  const isLowStock =
    (formData.stockQuantity !== undefined &&
      formData.stockQuantity < 3) ||
    formData.stockStatus === 'Últimas unidades' ||
    formData.stockStatus === 'Agotado';

  const discountPercent =
    formData.originalPrice &&
    formData.price &&
    formData.originalPrice > formData.price
      ? Math.round(
          ((formData.originalPrice - formData.price) /
            formData.originalPrice) *
            100
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5">
      <div
        className="
          w-full max-w-5xl
          max-h-[94vh]
          overflow-hidden
          flex flex-col
          rounded-[28px]
          border border-[#E9E3DA] dark:border-[#3B3029]
          bg-white dark:bg-[#241E1B]
          shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* ================================================================
            HEADER
        ================================================================= */}
        <div
          className="
            shrink-0
            flex items-center justify-between
            gap-4
            px-5 py-4 sm:px-6
            border-b border-[#E9E3DA] dark:border-[#3B3029]
            bg-[#FCFAF7] dark:bg-[#1C1815]
          "
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="
                w-10 h-10
                shrink-0
                rounded-xl
                flex items-center justify-center
                bg-[#4B5A36] dark:bg-[#809761]
                text-white dark:text-[#181412]
              "
            >
              <Package className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#2C221E] dark:text-[#F4EFEA] truncate">
                {isEditing ? 'Editar producto' : 'Nuevo producto'}
              </h2>

              <p className="text-[11px] sm:text-xs text-[#7C6E65] dark:text-[#A39489] truncate">
                {isEditing
                  ? `Modificando ${formData.name || 'producto'}`
                  : 'Completá la información para publicar tu producto'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar ventana"
            className="
              w-9 h-9
              shrink-0
              rounded-xl
              flex items-center justify-center
              border border-[#E9E3DA] dark:border-[#3B3029]
              bg-white dark:bg-[#28221E]
              text-[#7C6E65] dark:text-[#A39489]
              hover:bg-[#F0ECE6] dark:hover:bg-[#342C26]
              hover:text-[#2C221E] dark:hover:text-white
              transition-colors
              cursor-pointer
              disabled:opacity-50
            "
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ================================================================
            FORM
        ================================================================= */}
        <form
          onSubmit={handleSubmit}
          className="
            flex-1
            overflow-y-auto
            px-4 py-4 sm:px-6 sm:py-5
          "
        >
          {/* ==============================================================
              CATEGORÍAS
          =============================================================== */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C6E65] dark:text-[#A39489]">
                  Categoría
                </p>

                <p className="text-xs text-[#5C4F48] dark:text-[#B7AAA0] mt-0.5">
                  Seleccioná dónde aparecerá el producto
                </p>
              </div>

              <span className="text-[10px] font-semibold text-[#4B5A36] dark:text-[#A4B78A]">
                {formData.category || 'Mates'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected =
                  (formData.category || 'Mates') === cat.value;

                const CategoryIcon = cat.icon;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        category: cat.value,
                      })
                    }
                    className={`
                      h-11
                      px-2.5
                      rounded-xl
                      border
                      flex items-center justify-center gap-2
                      text-[11px] font-bold
                      transition-all
                      cursor-pointer
                      ${
                        isSelected
                          ? `
                            bg-[#4B5A36] dark:bg-[#809761]
                            border-[#4B5A36] dark:border-[#809761]
                            text-white dark:text-[#181412]
                            shadow-sm
                          `
                          : `
                            bg-[#FAF8F5] dark:bg-[#1E1A17]
                            border-[#E9E3DA] dark:border-[#3B3029]
                            text-[#5C4F48] dark:text-[#A39489]
                            hover:border-[#4B5A36]
                            dark:hover:border-[#809761]
                            hover:text-[#4B5A36]
                            dark:hover:text-[#B2C394]
                          `
                      }
                    `}
                  >
                    <CategoryIcon
                      className={`
                        w-3.5 h-3.5 shrink-0
                        ${
                          isSelected
                            ? 'text-white dark:text-[#181412]'
                            : 'text-[#4B5A36] dark:text-[#809761]'
                        }
                      `}
                    />

                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ==============================================================
              CONTENIDO PRINCIPAL
          =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
            {/* ============================================================
                COLUMNA IZQUIERDA
            ============================================================= */}
            <div className="space-y-4">
              {/* Imagen */}
              <section>
                <div className="mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C6E65] dark:text-[#A39489]">
                    Imagen
                  </p>
                </div>

                <div
                  className="
                    rounded-2xl
                    border border-[#E9E3DA] dark:border-[#3B3029]
                    bg-[#FAF8F5] dark:bg-[#1E1A17]
                    p-2
                  "
                >
                  <CloudinaryImageUploader
                    label="Subir foto o usar cámara"
                    value={formData.image || ''}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        image: url,
                      })
                    }
                    folder="pampa_catalog"
                  />
                </div>
              </section>

              {/* Estado */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C6E65] dark:text-[#A39489] mb-2">
                  Publicación
                </p>

                <div className="space-y-2">
                  {/* Visible */}
                  <label
                    className={`
                      flex items-center justify-between gap-3
                      rounded-xl
                      border
                      px-3 py-2.5
                      cursor-pointer
                      transition-all
                      ${
                        formData.active !== false
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                          : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#E9E3DA] dark:border-[#3B3029]'
                      }
                    `}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                        Visible en tienda
                      </p>

                      <p className="text-[10px] text-[#7C6E65] dark:text-[#A39489] mt-0.5">
                        Disponible para clientes
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#4B5A36] cursor-pointer shrink-0"
                    />
                  </label>

                  {/* Destacado */}
                  <label
                    className={`
                      flex items-center justify-between gap-3
                      rounded-xl
                      border
                      px-3 py-2.5
                      cursor-pointer
                      transition-all
                      ${
                        formData.featured
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                          : 'bg-[#FAF8F5] dark:bg-[#1E1A17] border-[#E9E3DA] dark:border-[#3B3029]'
                      }
                    `}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-1.5">
                        Destacado
                        <Star
                          className={`
                            w-3.5 h-3.5
                            ${
                              formData.featured
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-[#8B7D74]'
                            }
                          `}
                        />
                      </p>

                      <p className="text-[10px] text-[#7C6E65] dark:text-[#A39489] mt-0.5">
                        Mostrar en inicio
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </section>
            </div>

            {/* ============================================================
                COLUMNA DERECHA
            ============================================================= */}
            <div className="min-w-0">
              <section
                className="
                  rounded-2xl
                  border border-[#E9E3DA] dark:border-[#3B3029]
                  bg-[#FCFAF7] dark:bg-[#1D1916]
                  p-4 sm:p-5
                "
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7C6E65] dark:text-[#A39489]">
                      Información del producto
                    </p>

                    <p className="text-xs text-[#5C4F48] dark:text-[#B7AAA0] mt-0.5">
                      Datos principales, precio y stock
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] dark:text-[#B7AAA0] mb-1.5">
                      Nombre del producto *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        });

                        if (formErrors.name) {
                          setFormErrors({
                            ...formErrors,
                            name: undefined,
                          });
                        }
                      }}
                      placeholder="Ej: Mate Imperial de Calabaza"
                      className={`
                        w-full
                        h-11
                        px-3.5
                        rounded-xl
                        border
                        bg-white dark:bg-[#241F1B]
                        text-sm
                        text-[#2C221E] dark:text-[#F4EFEA]
                        placeholder:text-[#AAA098] dark:placeholder:text-[#6F655E]
                        outline-none
                        transition-colors
                        ${
                          formErrors.name
                            ? 'border-rose-400 dark:border-rose-600'
                            : 'border-[#E9E3DA] dark:border-[#3B3029] focus:border-[#4B5A36] dark:focus:border-[#809761]'
                        }
                      `}
                    />

                    {formErrors.name && (
                      <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Detalle */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] dark:text-[#B7AAA0] mb-1.5">
                      Detalle corto
                      <span className="font-normal text-[#9B9088] ml-1">
                        · opcional
                      </span>
                    </label>

                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Ej: Virola cincelada · Cuero vacuno"
                      className="
                        w-full h-11
                        px-3.5
                        rounded-xl
                        border border-[#E9E3DA] dark:border-[#3B3029]
                        bg-white dark:bg-[#241F1B]
                        text-sm
                        text-[#2C221E] dark:text-[#F4EFEA]
                        placeholder:text-[#AAA098] dark:placeholder:text-[#6F655E]
                        outline-none
                        focus:border-[#4B5A36] dark:focus:border-[#809761]
                        transition-colors
                      "
                    />
                  </div>

                  {/* Precios */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#5C4F48] dark:text-[#B7AAA0]">
                        Precios
                      </label>

                      {discountPercent !== null &&
                        discountPercent > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                            {discountPercent}% OFF
                          </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Precio actual */}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7D74]">
                          $
                        </span>

                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.price ?? 0}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            });

                            if (formErrors.price) {
                              setFormErrors({
                                ...formErrors,
                                price: undefined,
                              });
                            }
                          }}
                          placeholder="Precio actual"
                          className={`
                            w-full h-11
                            pl-7 pr-3
                            rounded-xl
                            border
                            bg-white dark:bg-[#241F1B]
                            text-sm font-bold font-mono
                            text-[#2C221E] dark:text-[#F4EFEA]
                            outline-none
                            ${
                              formErrors.price
                                ? 'border-rose-400'
                                : 'border-[#E9E3DA] dark:border-[#3B3029] focus:border-[#4B5A36]'
                            }
                          `}
                        />
                      </div>

                      {/* Precio anterior */}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7D74]">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={formData.originalPrice ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              originalPrice: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="Precio anterior"
                          className="
                            w-full h-11
                            pl-7 pr-3
                            rounded-xl
                            border border-[#E9E3DA] dark:border-[#3B3029]
                            bg-white dark:bg-[#241F1B]
                            text-sm
                            text-[#2C221E] dark:text-[#F4EFEA]
                            outline-none
                            focus:border-[#4B5A36]
                          "
                        />
                      </div>
                    </div>

                    {formErrors.price && (
                      <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] dark:text-[#B7AAA0] mb-1.5">
                      Stock
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity ?? 10}
                        onChange={(e) =>
                          handleStockQtyChange(e.target.value)
                        }
                        placeholder="Cantidad"
                        className="
                          w-full h-11
                          px-3.5
                          rounded-xl
                          border border-[#E9E3DA] dark:border-[#3B3029]
                          bg-white dark:bg-[#241F1B]
                          text-sm font-bold font-mono
                          text-[#2C221E] dark:text-[#F4EFEA]
                          outline-none
                          focus:border-[#4B5A36]
                        "
                      />

                      <select
                        value={formData.stockStatus || 'Disponible'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stockStatus: e.target.value as StockStatus,
                          })
                        }
                        className="
                          w-full h-11
                          px-3
                          rounded-xl
                          border border-[#E9E3DA] dark:border-[#3B3029]
                          bg-white dark:bg-[#241F1B]
                          text-sm
                          text-[#2C221E] dark:text-[#F4EFEA]
                          outline-none
                          focus:border-[#4B5A36]
                          cursor-pointer
                        "
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Últimas unidades">
                          Últimas unidades
                        </option>
                        <option value="Agotado">Agotado</option>
                        <option value="Próximamente">
                          Próximamente
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C4F48] dark:text-[#B7AAA0] mb-1.5">
                      Descripción
                      <span className="font-normal text-[#9B9088] ml-1">
                        · opcional
                      </span>
                    </label>

                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Contale a tus clientes por qué este producto es especial..."
                      className="
                        w-full
                        px-3.5 py-2.5
                        rounded-xl
                        border border-[#E9E3DA] dark:border-[#3B3029]
                        bg-white dark:bg-[#241F1B]
                        text-sm
                        text-[#2C221E] dark:text-[#F4EFEA]
                        placeholder:text-[#AAA098] dark:placeholder:text-[#6F655E]
                        outline-none
                        resize-none
                        focus:border-[#4B5A36] dark:focus:border-[#809761]
                      "
                    />
                  </div>

                  {/* Aviso stock */}
                  {isLowStock && (
                    <div
                      className="
                        flex items-center gap-2
                        px-3 py-2
                        rounded-xl
                        border border-amber-200 dark:border-amber-900
                        bg-amber-50 dark:bg-amber-950/30
                        text-amber-900 dark:text-amber-200
                      "
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />

                      <p className="text-[10px] leading-tight">
                        <strong>Aviso de stock:</strong> se mostrará un aviso
                        de reposición.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* ==============================================================
              FOOTER — PARTE DE LA MISMA CARD
          =============================================================== */}
          <div
            className="
              mt-5
              pt-4
              border-t border-[#E9E3DA] dark:border-[#3B3029]
              flex flex-col-reverse sm:flex-row
              items-stretch sm:items-center
              justify-end
              gap-2.5
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                h-11
                px-5
                rounded-xl
                border border-[#E9E3DA] dark:border-[#3B3029]
                bg-[#FAF8F5] dark:bg-[#1E1A17]
                text-xs font-bold
                text-[#5C4F48] dark:text-[#A39489]
                hover:bg-[#EFECE6] dark:hover:bg-[#2A241F]
                transition-colors
                cursor-pointer
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                h-11
                px-6
                rounded-xl
                flex items-center justify-center gap-2
                bg-[#4B5A36] dark:bg-[#809761]
                hover:bg-[#3D492C] dark:hover:bg-[#6E854F]
                text-white dark:text-[#181412]
                text-xs sm:text-sm
                font-bold
                shadow-sm hover:shadow-md
                transition-all
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
                active:scale-[0.99]
              "
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              <span>
                {isEditing ? 'Guardar cambios' : 'Publicar producto'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
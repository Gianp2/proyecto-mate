import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';
import { ProductSkeletonGrid } from './ProductSkeletonGrid';

interface CatalogProps {
  products: Product[];
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
  loading?: boolean;
}

export const Catalog: React.FC<CatalogProps> = ({ products, settings, onSelectProduct, loading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);

  const categories: string[] = ['Todos', 'Mates', 'Yerbas', 'Bombillas', 'Termos', 'Accesorios'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.active) return false;
        const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q));

        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.order - b.order;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Reset to page 1 when filter, search or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);

    // Scroll smoothly to top of catalog section after React DOM re-render
    setTimeout(() => {
      const catalogElement = document.getElementById('catalogo');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <section id="catalogo" className="scroll-mt-20 sm:scroll-mt-24 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-2">
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            Catálogo
          </h2>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C6E65] dark:text-[#BAACA2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] placeholder:text-[#9C8F87] dark:placeholder:text-[#8C7D73] focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] focus:ring-1 focus:ring-[#4B5A36] dark:focus:ring-[#809761] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7C6E65] dark:text-[#BAACA2] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Categories Horizontal Scrolling Pills & Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8"
      >
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#4B5A36] dark:bg-[#809761] text-white shadow-xs'
                  : 'bg-white dark:bg-[#241E1B] text-[#5C4F48] dark:text-[#C5B9B0] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#7C6E65] dark:text-[#BAACA2]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs sm:text-sm text-[#2C221E] dark:text-[#F4EFEA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#4B5A36] dark:focus:border-[#809761] cursor-pointer"
          >
            <option value="default">Ordenar por</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
        </div>
      </motion.div>

      {/* Results Summary Info */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between text-xs text-[#7C6E65] dark:text-[#BAACA2] mb-4 px-1">
          <span>
            Mostrando <strong>{startItem} - {endItem}</strong> de <strong>{filteredProducts.length}</strong> productos
          </span>
          <div className="hidden sm:flex items-center gap-1.5">
            <span>Mostrar por página:</span>
            {[8, 12, 16].map((count) => (
              <button
                key={count}
                onClick={() => setItemsPerPage(count)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-xs cursor-pointer transition-colors ${
                  itemsPerPage === count
                    ? 'bg-[#4B5A36] dark:bg-[#809761] text-white'
                    : 'bg-white dark:bg-[#241E1B] text-[#5C4F48] dark:text-[#C5B9B0] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] border border-[#EBE6DD] dark:border-[#3D322B]'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ProductSkeletonGrid count={itemsPerPage} />
          </motion.div>
        ) : displayedProducts.length > 0 ? (
          <motion.div
            key={`${selectedCategory}-${currentPage}-${searchQuery}-${sortBy}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {displayedProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onSelectProduct={onSelectProduct}
                index={idx}
              />
            ))}
          </motion.div>
        ) : (
        /* Empty Search State */
        <div className="text-center py-16 px-4 bg-white dark:bg-[#241E1B] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-[#EFECE6] dark:bg-[#2E2622] text-[#7C6E65] dark:text-[#BAACA2] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA] mb-1">
            No encontramos productos
          </h3>
          <p className="text-sm text-[#7C6E65] dark:text-[#BAACA2] mb-4">
            No hay resultados que coincidan con &quot;{searchQuery}&quot; en la categoría {selectedCategory}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="bg-[#4B5A36] dark:bg-[#809761] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#3A4729] dark:hover:bg-[#96AD76] transition-all cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      )}
      </AnimatePresence>

      {/* Pagination Control Bar */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#241E1B] p-4 rounded-2xl border border-[#EBE6DD] dark:border-[#3D322B]">
          <span className="text-xs text-[#7C6E65] dark:text-[#BAACA2]">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            {/* Previous button */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#4B5A36] dark:bg-[#809761] text-white shadow-xs'
                    : 'bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#5C4F48] dark:text-[#C5B9B0] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next button */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

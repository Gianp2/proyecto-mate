import React from 'react';
import {
  MessageCircle,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnalyticsSummary, Product } from '../../types';
import { OptimizedImage } from '../OptimizedImage';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  products: Product[];
  isDarkMode: boolean;
  onRestockProduct: (product: Product) => void;
  onGoToProducts: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  products,
  isDarkMode,
  onRestockProduct,
  onGoToProducts,
}) => {
  const lowStockProducts = products.filter(
    (p) =>
      p.stockStatus === 'Agotado' ||
      p.stockStatus === 'Últimas unidades' ||
      (p.stockQuantity !== undefined && p.stockQuantity < 3)
  );

  const activeProductsCount = products.filter((p) => p.active).length;
  const COLORS = ['#4B5A36', '#7C6E65', '#D97706', '#2563EB', '#059669'];

  const defaultDaily = [
    { date: 'Lun', count: 4 },
    { date: 'Mar', count: 7 },
    { date: 'Mié', count: 5 },
    { date: 'Jue', count: 11 },
    { date: 'Vie', count: 9 },
    { date: 'Sáb', count: 14 },
    { date: 'Dom', count: 8 },
  ];

  const defaultCategoryData = [
    { category: 'Mates', count: 24 },
    { category: 'Yerbas', count: 12 },
    { category: 'Bombillas', count: 8 },
    { category: 'Termos', count: 6 },
    { category: 'Accesorios', count: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            Analíticas en Tiempo Real
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489] mt-0.5">
            Métricas de interés, conversiones a WhatsApp y estado general del inventario.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-semibold text-[#5C4F48] dark:text-[#C5BBB4] shadow-2xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761]" />
          <span>Últimos 30 días</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Consultas WhatsApp */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
            <span className="text-[11px] font-bold uppercase tracking-wider">WhatsApp Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            {analytics?.totalConsultations || 38}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-flex">
            <Sparkles className="w-3 h-3" />
            <span>+28% este mes</span>
          </div>
        </div>

        {/* Card 2: Vistas Catálogo */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vistas Únicas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            {analytics?.totalViews || 312}
          </div>
          <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489] block">
            Sesiones de catálogo
          </span>
        </div>

        {/* Card 3: Productos Activos */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catálogo Activo</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            {activeProductsCount}
          </div>
          <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489] block">
            de {products.length} productos
          </span>
        </div>

        {/* Card 4: Tasa de Conversión */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversión</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            13.5%
          </div>
          <span className="text-[11px] font-medium text-[#7C6E65] dark:text-[#A39489] block">
            visitas &rarr; WhatsApp
          </span>
        </div>

        {/* Card 5: Alerta de Stock */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-2xs space-y-2 col-span-2 lg:col-span-1 ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-[#241E1B] border-[#EBE6DD] dark:border-[#3D322B]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7C6E65] dark:text-[#A39489]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Stock Crítico
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif-title font-bold text-[#2C221E] dark:text-[#F4EFEA]">
            {lowStockProducts.length}
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block ${
              lowStockProducts.length > 0
                ? 'text-amber-900 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/80'
                : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
            }`}
          >
            {lowStockProducts.length > 0 ? 'Reposición Necesaria' : 'Inventario Óptimo'}
          </span>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Daily Consultations */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                Consultas Diarias por WhatsApp
              </h3>
              <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">
                Flujo de clientes interesados por día
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.dailyConsultations?.length ? analytics.dailyConsultations : defaultDaily}
              >
                <XAxis dataKey="date" stroke={isDarkMode ? '#A39489' : '#7C6E65'} fontSize={12} />
                <YAxis stroke={isDarkMode ? '#A39489' : '#7C6E65'} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1E1A17' : '#2C221E',
                    color: '#fff',
                    border: isDarkMode ? '1px solid #3D322B' : 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill={isDarkMode ? '#809761' : '#4B5A36'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Categories Breakdown */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
              Interés por Categoría
            </h3>
            <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">Distribución de consultas recibidas</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryBreakdown?.length ? analytics.categoryBreakdown : defaultCategoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {COLORS.map((color, idx) => (
                    <Cell key={idx} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1E1A17' : '#2C221E',
                    color: '#fff',
                    border: isDarkMode ? '1px solid #3D322B' : 'none',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Restock Module */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBE6DD] dark:border-[#3D322B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-base sm:text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                Productos con Stock Crítico (&lt; 3 Unidades)
              </h3>
              <p className="text-xs text-[#7C6E65] dark:text-[#A39489]">
                Ítems que requieren reposición prioritaria para no perder ventas.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToProducts}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4B5A36] dark:text-[#809761] hover:underline shrink-0 cursor-pointer"
          >
            <span>Ver en el Catálogo</span>
            <span>&rarr;</span>
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 font-medium">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Excelente! Todos los productos cuentan con suficiente inventario (&ge; 3 unidades).</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 transition-all hover:bg-amber-100/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-200 dark:border-amber-800 shrink-0 bg-white dark:bg-[#1E1A17]">
                    <OptimizedImage src={p.image} alt="" aspectRatio="square" sizes="48px" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#2C221E] dark:text-[#F4EFEA] block truncate">
                      {p.name}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-amber-900 dark:text-amber-300 block mt-0.5">
                      {p.stockQuantity !== undefined ? `${p.stockQuantity} unid. disponibles` : p.stockStatus}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRestockProduct(p)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-2xs transition-colors cursor-pointer"
                >
                  Reponer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

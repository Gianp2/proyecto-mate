import React, { useState } from 'react';
import {
  Save,
  Loader2,
  Check,
  MessageCircle,
  Store,
  Truck,
  CreditCard,
  Cloud,
  ExternalLink,
  Phone,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { StoreSettings, Category } from '../../types';
import { buildWhatsAppUrl } from '../../services/api';

const DEFAULT_CATEGORY_MESSAGES: Record<Category, string> = {
  Mates: '¡Hola! Quisiera consultar por el mate *{producto}*',
  Yerbas: '¡Hola! Me gustaría consultar stock y detalles de la yerba *{producto}*',
  Bombillas: '¡Hola! Quisiera consultar por la bombilla *{producto}*',
  Termos: '¡Hola! Me interesó el termo *{producto}*',
  Accesorios: '¡Hola! Quisiera consultar por el accesorio *{producto}*',
};

interface SettingsViewProps {
  settings: StoreSettings | null;
  onSave: (form: Partial<StoreSettings>) => Promise<void>;
  saving: boolean;
  success: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSave,
  saving,
  success,
}) => {
  const [formData, setFormData] = useState<Partial<StoreSettings>>({
    brandName: 'Pampa',
    tagline: 'Mates y Accesorios Artesanales',
    whatsappNumber: '5491112345678',
    whatsappDisplay: '+54 11 1234 5678',
    instagramHandle: 'pampa.mates',
    instagramUrl: 'https://instagram.com/pampa.mates',
    announcementText: '3 cuotas sin interés y envíos a todo el país',
    shippingNotice: 'Despachamos tu pedido en 24 a 48 hs hábiles.',
    paymentNotice: 'Transferencia bancaria (10% OFF), Mercado Pago y tarjetas de crédito.',
    address: 'Buenos Aires, Argentina',
    categoryWhatsAppMessages: {},
    ...settings,
  });

  const [activeSection, setActiveSection] = useState<'general' | 'whatsapp' | 'cloudinary'>('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleResetCategoryMsg = (cat: Category) => {
    const updated = {
      ...(formData.categoryWhatsAppMessages || {}),
      [cat]: DEFAULT_CATEGORY_MESSAGES[cat],
    };
    setFormData({ ...formData, categoryWhatsAppMessages: updated });
  };

  const handleInsertToken = (cat: Category, token: string) => {
    const current = formData.categoryWhatsAppMessages?.[cat] ?? DEFAULT_CATEGORY_MESSAGES[cat];
    const updated = {
      ...(formData.categoryWhatsAppMessages || {}),
      [cat]: `${current} ${token}`,
    };
    setFormData({ ...formData, categoryWhatsAppMessages: updated });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
          Configuración del Emprendimiento
        </h2>
        <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#A39489] mt-0.5">
          Ajustá la información de contacto, mensajes dinámicos de WhatsApp y almacenamiento en la nube.
        </p>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-[#EBE6DD] dark:border-[#3D322B] pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSection('general')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === 'general'
              ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
              : 'bg-white dark:bg-[#241E1B] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>General & Contacto</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === 'whatsapp'
              ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
              : 'bg-white dark:bg-[#241E1B] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Mensajes de WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cloudinary')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
            activeSection === 'cloudinary'
              ? 'bg-[#4B5A36] dark:bg-[#809761] text-white dark:text-[#181412] font-bold shadow-xs'
              : 'bg-white dark:bg-[#241E1B] text-[#5C4F48] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B]'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Cloudinary Fotos</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>¡Configuración guardada exitosamente! Los cambios ya están vigentes.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: GENERAL & CONTACT */}
        {activeSection === 'general' && (
          <div className="space-y-5 bg-white dark:bg-[#241E1B] p-5 sm:p-7 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
            <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-2 pb-2 border-b border-[#EBE6DD] dark:border-[#3D322B]">
              <Store className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
              <span>Identidad & WhatsApp de Ventas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                  Nombre de la Marca
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandName || ''}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-semibold text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                  Eslogan / Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Ej: Mates y Accesorios Artesanales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                  Número de WhatsApp (Sin signos ni espacios) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7C6E65] dark:text-[#A39489]" />
                  <input
                    type="text"
                    required
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="5491112345678"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm font-mono font-bold text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                  />
                </div>
                <span className="text-[10px] text-[#7C6E65] dark:text-[#A39489] mt-1 block">
                  Incluir código de país (Ej: 54911...). A este número llegarán todos los pedidos.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                  WhatsApp Formateado (Visual para el cliente)
                </label>
                <input
                  type="text"
                  value={formData.whatsappDisplay || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappDisplay: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#EBE6DD] dark:border-[#3D322B] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2C221E] dark:text-[#F4EFEA]">
                Avisos y Banners Públicos
              </h4>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5">
                  Barra de Anuncios Superior (Aviso Promocional)
                </label>
                <input
                  type="text"
                  value={formData.announcementText || ''}
                  onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                  placeholder="Ej: 3 cuotas sin interés y envíos a todo el país"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-sm text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761]" />
                    <span>Aviso de Envíos</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.shippingNotice || ''}
                    onChange={(e) => setFormData({ ...formData, shippingNotice: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-xs text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761]" />
                    <span>Aviso de Formas de Pago</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.paymentNotice || ''}
                    onChange={(e) => setFormData({ ...formData, paymentNotice: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] text-xs text-[#2C221E] dark:text-[#F4EFEA] focus:outline-none focus:border-[#4B5A36]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: WHATSAPP MESSAGES PER CATEGORY */}
        {activeSection === 'whatsapp' && (
          <div className="space-y-5 bg-white dark:bg-[#241E1B] p-5 sm:p-7 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                <span>Plantillas de Mensajes por Categoría</span>
              </h3>
              <p className="text-xs text-[#7C6E65] dark:text-[#A39489] mt-0.5 leading-relaxed">
                Personalizá el saludo con el que tus clientes inician la conversación en WhatsApp para cada tipo de producto.
              </p>
            </div>

            {/* Variable Tokens Helper */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] space-y-2">
              <span className="text-[11px] font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider block">
                Variables dinámicas (clic para insertar):
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {['{producto}', '{precio}', '{variante}', '{categoria}'].map((token) => (
                  <span
                    key={token}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-[#4B5A36] dark:text-[#809761] font-semibold text-xs cursor-pointer hover:border-[#4B5A36] transition-colors"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>

            {/* Category inputs */}
            <div className="space-y-4">
              {(['Mates', 'Yerbas', 'Bombillas', 'Termos', 'Accesorios'] as Category[]).map((cat) => {
                const currentMsg =
                  formData.categoryWhatsAppMessages?.[cat] ?? DEFAULT_CATEGORY_MESSAGES[cat];

                const sampleProductName =
                  cat === 'Mates'
                    ? 'Mate Imperial'
                    : cat === 'Yerbas'
                    ? 'Yerba Aguantadora'
                    : cat === 'Bombillas'
                    ? 'Bombilla Pico de Loro'
                    : cat === 'Termos'
                    ? 'Termo Pampa 1L'
                    : 'Matera Canasta Cuero';

                const previewUrl = buildWhatsAppUrl(
                  formData.whatsappNumber || '5491112345678',
                  sampleProductName,
                  cat === 'Mates' ? 28500 : 3200,
                  cat === 'Mates' ? 'Cuero Negro' : undefined,
                  cat,
                  { [cat]: currentMsg }
                );
                const decodedPreview = decodeURIComponent(previewUrl.split('text=')[1] || '');

                return (
                  <div
                    key={cat}
                    className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4B5A36] dark:bg-[#809761]" />
                        {cat}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleResetCategoryMsg(cat)}
                        className="text-[11px] text-[#7C6E65] dark:text-[#A39489] hover:text-[#4B5A36] dark:hover:text-[#809761] font-medium underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restablecer</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={currentMsg}
                      onChange={(e) => {
                        const updated = {
                          ...(formData.categoryWhatsAppMessages || {}),
                          [cat]: e.target.value,
                        };
                        setFormData({ ...formData, categoryWhatsAppMessages: updated });
                      }}
                      placeholder={DEFAULT_CATEGORY_MESSAGES[cat]}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] text-xs text-[#2C221E] dark:text-[#F4EFEA] font-medium focus:outline-none focus:border-[#4B5A36]"
                    />

                    {/* WhatsApp message bubble */}
                    <div className="p-3 rounded-xl bg-[#E2F4C7]/60 dark:bg-[#2D451C]/60 border border-[#D0E8B2] dark:border-[#3E5E27] text-[11px] text-[#1D3212] dark:text-[#D1E8BA] flex items-start gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#32521F] dark:text-[#809761] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-[#2A431A] dark:text-[#A8C98B] block mb-0.5">
                          Vista previa en WhatsApp:
                        </span>
                        <p className="italic">{decodedPreview}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: CLOUDINARY STATUS */}
        {activeSection === 'cloudinary' && (
          <div className="space-y-5 bg-white dark:bg-[#241E1B] p-5 sm:p-7 rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EBE6DD] dark:border-[#3D322B]">
              <Cloud className="w-5 h-5 text-[#4B5A36] dark:text-[#809761]" />
              <h3 className="font-serif-title font-bold text-lg text-[#2C221E] dark:text-[#F4EFEA]">
                Servidor de Medios Cloudinary
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#EBE6DD] dark:border-[#3D322B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  Estado de la Integración:
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-3.5 h-3.5" />
                  <span>Conectado</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B]">
                  <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] block">
                    Cloud Name Activo
                  </span>
                  <span className="font-mono font-bold text-sm text-[#4B5A36] dark:text-[#809761]">
                    dam2bx2ab
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B]">
                  <span className="text-[10px] uppercase font-bold text-[#7C6E65] dark:text-[#A39489] block">
                    Carpeta de Destino
                  </span>
                  <span className="font-mono font-bold text-sm text-[#2C221E] dark:text-[#F4EFEA]">
                    pampa_catalog
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#7C6E65] dark:text-[#A39489] leading-relaxed pt-1">
                Todas las fotos que arrastres o selecciones en el creador de productos se suben de forma segura y se convierten automáticamente al formato WebP optimizado de alta velocidad.
              </p>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[48px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar toda la configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};

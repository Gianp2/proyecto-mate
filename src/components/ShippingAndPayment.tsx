import React from 'react';
import { motion } from 'motion/react';
import { Truck, CreditCard, MapPin, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface ShippingAndPaymentProps {
  settings: StoreSettings;
}

export const ShippingAndPayment: React.FC<ShippingAndPaymentProps> = ({ settings }) => {
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  return (
    <section id="envios-pagos" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white dark:bg-[#241E1B] rounded-3xl p-6 sm:p-10 border border-[#EBE6DD] dark:border-[#3D322B] shadow-xs"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-[#4B5A36] dark:text-[#809761] uppercase tracking-wider bg-[#4B5A36]/10 dark:bg-[#809761]/20 px-3 py-1 rounded-full">
            Información Útil
          </span>
          <h2 className="font-serif-title text-2xl sm:text-4xl font-bold text-[#2C221E] dark:text-[#F4EFEA] mt-3">
            Envíos y Formas de Pago
          </h2>
          <p className="text-sm sm:text-base text-[#7C6E65] dark:text-[#BAACA2] mt-2">
            Hacemos que tu experiencia de compra sea fácil, transparente y segura.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1: Envíos */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#F0ECE4] dark:border-[#3D322B] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2C221E] dark:text-[#F4EFEA]">Envíos</h3>
            <p className="text-xs text-[#62534C] dark:text-[#C5B9B0] leading-relaxed">
              {settings.shippingNotice || 'A todo el país a través de Correo Argentino y otras transportadoras. Despachamos en 24hs.'}
            </p>
          </div>

          {/* Item 2: Formas de Pago */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#F0ECE4] dark:border-[#3D322B] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2C221E] dark:text-[#F4EFEA]">Formas de pago</h3>
            <p className="text-xs text-[#62534C] dark:text-[#C5B9B0] leading-relaxed">
              {settings.paymentNotice || 'Efectivo, Transferencia Bancaria (10% OFF) y Mercado Pago con todas las tarjetas.'}
            </p>
          </div>

          {/* Item 3: Retiro */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#F0ECE4] dark:border-[#3D322B] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2C221E] dark:text-[#F4EFEA]">Retiro sin cargo</h3>
            <p className="text-xs text-[#62534C] dark:text-[#C5B9B0] leading-relaxed">
              Podés retirar tu pedido en nuestro punto de entrega previo acuerdo por WhatsApp.
            </p>
          </div>

          {/* Item 4: Consultas */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1E1A17] border border-[#F0ECE4] dark:border-[#3D322B] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2C221E] dark:text-[#F4EFEA]">Atención personalizada</h3>
            <p className="text-xs text-[#62534C] dark:text-[#C5B9B0] leading-relaxed">
              Escribinos por WhatsApp y te ayudamos a elegir el mate ideal para vos o para regalar.
            </p>
          </div>
        </div>

        {/* Banner CTA */}
        <div className="mt-8 pt-6 border-t border-[#EBE6DD] dark:border-[#3D322B] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#4B5A36]/5 dark:bg-[#809761]/10 p-4 sm:p-6 rounded-2xl">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm sm:text-base text-[#2C221E] dark:text-[#F4EFEA]">¿Tenés alguna duda sobre tu compra?</h4>
            <p className="text-xs text-[#7C6E65] dark:text-[#BAACA2]">Respondemos todas tus consultas al instante.</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#96AD76] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
};

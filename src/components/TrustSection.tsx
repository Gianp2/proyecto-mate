import React from 'react';
import { motion } from 'motion/react';
import { Award, Headphones, Truck, ShieldCheck } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const benefits = [
    {
      icon: Award,
      title: 'Productos seleccionados',
      description: 'Calidad artesanal que se siente en cada detalle.',
    },
    {
      icon: Headphones,
      title: 'Atención personalizada',
      description: 'Estamos para asesorarte y responder todas tus dudas.',
    },
    {
      icon: Truck,
      title: 'Envíos a todo el país',
      description: 'Envíos seguros a donde estés a través de transporte oficial.',
    },
    {
      icon: ShieldCheck,
      title: 'Compra fácil y segura',
      description: 'Consultá directamente por WhatsApp y recibí tu pedido.',
    },
  ];

  return (
    <section id="nosotros" className="py-8 bg-white/60 dark:bg-[#241E1B]/60 border-y border-[#EBE6DD] dark:border-[#3D322B] my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col items-center text-center p-3 rounded-2xl transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#2C221E] dark:text-[#F4EFEA] mb-1">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#BAACA2] max-w-xs leading-snug">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

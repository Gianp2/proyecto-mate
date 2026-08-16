import React from 'react';
import { motion } from 'motion/react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { StoreSettings } from '../types';

interface InstagramFeedProps {
  settings: StoreSettings;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ settings }) => {
  return (
    <section id="contacto" className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-xl mx-auto space-y-3"
      >
        <span className="inline-block text-xs font-semibold text-[#4B5A36] dark:text-[#809761] uppercase tracking-wider bg-[#4B5A36]/10 dark:bg-[#809761]/20 px-3.5 py-1.5 rounded-full">
          Comunidad PAMPA
        </span>
        <h2 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E] dark:text-[#F4EFEA]">
          Seguinos en Instagram
        </h2>
        <a
          href={settings.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] hover:border-[#4B5A36] dark:hover:border-[#809761] text-[#2C221E] dark:text-[#F4EFEA] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer group mt-1"
        >
          <Instagram className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
          <span>@{settings.instagramHandle || 'pampa.mates'}</span>
          <ArrowUpRight className="w-4 h-4 text-[#7C6E65] dark:text-[#BAACA2] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </motion.div>
    </section>
  );
};


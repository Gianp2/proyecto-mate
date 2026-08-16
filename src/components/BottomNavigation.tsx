import React from 'react';
import { motion } from 'motion/react';
import { Home, ShoppingBag, MessageCircle } from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl, trackEvent } from '../services/api';

interface BottomNavigationProps {
  settings: StoreSettings;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  onAccountClick?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  settings,
  activeSection,
  onNavigateSection,
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    undefined,
    undefined,
    undefined,
    undefined,
    settings.categoryWhatsAppMessages
  );

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('whatsapp_click', {
      source: 'bottom_nav',
    });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const navItems = [
    {
      id: 'hero',
      label: 'Inicio',
      icon: Home,
      action: () => onNavigateSection('hero'),
      isActive: activeSection === 'hero',
    },
    {
      id: 'catalogo',
      label: 'Catálogo',
      icon: ShoppingBag,
      action: () => onNavigateSection('catalogo'),
      isActive: activeSection === 'catalogo',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      action: handleWhatsAppClick,
      isActive: false,
      isHighlight: true,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#1E1A17]/95 backdrop-blur-md border-t border-[#EBE6DD] dark:border-[#3D322B] shadow-2xl px-2 py-1.5 transition-colors duration-300"
      aria-label="Navegación rápida inferior"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.action}
              type="button"
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 ${
                active
                  ? 'text-[#4B5A36] dark:text-[#809761] font-bold'
                  : item.isHighlight
                  ? 'text-[#25D366] dark:text-[#42E380]'
                  : 'text-[#7C6E65] dark:text-[#BAACA2] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
              }`}
            >
              {/* Active Background Pill */}
              {active && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-0 bg-[#4B5A36]/10 dark:bg-[#809761]/20 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon Container with Badge for WhatsApp */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
                  }`}
                />
                {item.isHighlight && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#1E1A17] animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] sm:text-xs mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

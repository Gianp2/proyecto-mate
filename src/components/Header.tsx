import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, MessageCircle, Home, ShoppingBag, Users, Truck, PhoneCall, Instagram, Sun, Moon } from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface HeaderProps {
  settings: StoreSettings;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeSection,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'hero', label: 'Inicio', icon: Home },
    { id: 'catalogo', label: 'Catálogo', icon: ShoppingBag },
    { id: 'nosotros', label: 'Nosotros', icon: Users },
    { id: 'envios-pagos', label: 'Envíos y Pagos', icon: Truck },
    { id: 'contacto', label: 'Contacto', icon: PhoneCall },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  return (
    <>
      {/* Top Banner Notice */}
      {settings.announcementText && (
        <div className="bg-[#4B5A36] dark:bg-[#2A341E] text-white text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide shadow-inner dark:border-b dark:border-[#3D322B]">
          {settings.announcementText}
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF8F5]/90 dark:bg-[#1A1614]/90 backdrop-blur-md shadow-xs py-3'
            : 'bg-[#FAF8F5] dark:bg-[#1A1614] py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            aria-label="Ir a Inicio"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#4B5A36]/10 dark:bg-[#809761]/20 flex items-center justify-center text-[#4B5A36] dark:text-[#809761] group-hover:bg-[#4B5A36] dark:group-hover:bg-[#809761] group-hover:text-white transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17 8C8 10 59 16.17 3.82 21.34L2.4 19.93C4.89 17.44 8.7 15.11 13 14C11.5 12.5 9 10.5 7 10C5 9.5 3 10 3 10C3 10 4 7 8 6C12 5 15 6 17 8Z" />
                <path d="M12 3C15 5 18 8 20 12C21 14 21 17 21 17C21 17 19 16 17 14C15 12 13 9 12 3Z" />
              </svg>
            </div>
            <div>
              <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-tight text-[#2C221E] dark:text-[#F4EFEA] block leading-none">
                {settings.brandName || 'PAMPA'}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#7C6E65] dark:text-[#BAACA2] uppercase block mt-0.5">
                {settings.tagline || 'MATES & YERBAS'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                  activeSection === link.id
                    ? 'text-[#4B5A36] dark:text-[#809761] font-semibold'
                    : 'text-[#5C4F48] dark:text-[#C5B9B0] hover:text-[#2C221E] dark:hover:text-[#F4EFEA]'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4B5A36] dark:bg-[#809761] rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-full bg-white dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] transition-colors cursor-pointer shadow-2xs"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro nocturno'}
              aria-label="Cambiar tema"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-[#E6B050]" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C6E65]" />
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3B482A] dark:hover:bg-[#96AD76] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>

          {/* Mobile Right Controls (Theme + Hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-white dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] transition-colors cursor-pointer"
              aria-label="Cambiar tema"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-[#E6B050]" />
              ) : (
                <Moon className="w-5 h-5 text-[#7C6E65]" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#2C221E] dark:text-[#F4EFEA] hover:bg-[#EFECE6] dark:hover:bg-[#2E2622] transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Glassmorphic Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 md:hidden flex flex-col glass-panel"
          >
            {/* Mobile Menu Header */}
            <div className="p-4 sm:p-6 flex items-center justify-between border-b border-[#2C221E]/10 dark:border-[#3D322B]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
                  <span className="font-serif-title font-bold text-sm">P</span>
                </div>
                <span className="font-serif-title text-lg font-bold text-[#2C221E] dark:text-[#F4EFEA]">
                  {settings.brandName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-full bg-white/80 dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] border border-[#EBE6DD] dark:border-[#3D322B]"
                  aria-label="Cambiar modo"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-[#E6B050]" /> : <Moon className="w-5 h-5 text-[#7C6E65]" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-white/60 dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] hover:bg-white dark:hover:bg-[#2E2622] transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex-1 px-6 py-8 flex flex-col justify-center space-y-4">
              {navLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.2 }}
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full flex items-center gap-4 text-left p-3.5 rounded-2xl text-lg font-medium transition-all ${
                      activeSection === link.id
                        ? 'bg-[#4B5A36] dark:bg-[#809761] text-white shadow-sm'
                        : 'text-[#2C221E] dark:text-[#F4EFEA] hover:bg-white/60 dark:hover:bg-[#2E2622]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeSection === link.id ? 'text-white' : 'text-[#4B5A36] dark:text-[#809761]'}`} />
                    <span>{link.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Menu Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 border-t border-[#2C221E]/10 dark:border-[#3D322B] bg-white/40 dark:bg-[#1A1614]/60 space-y-3"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#4B5A36] dark:bg-[#809761] text-white font-semibold py-3.5 px-5 rounded-xl shadow-md active:scale-95 transition-all text-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Consultar por WhatsApp</span>
              </a>

              <div className="flex items-center justify-center gap-4 pt-2">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors shadow-xs"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-white/80 dark:bg-[#241E1B] text-[#2C221E] dark:text-[#F4EFEA] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors shadow-xs"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

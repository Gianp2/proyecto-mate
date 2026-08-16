import React from 'react';
import { MessageCircle, Instagram, MapPin, Lock } from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (sectionId: string) => void;
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onAdminClick }) => {
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  return (
    <footer id="contacto" className="bg-white dark:bg-[#241E1B] border-t border-[#EBE6DD] dark:border-[#3D322B] pt-8 pb-24 md:pt-10 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Brand + 2-col on Mobile (Nav + Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-6 border-b border-[#F2EFE9] dark:border-[#3D322B]">
          {/* Brand & Slogan */}
          <div className="md:col-span-5 text-center md:text-left flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center shadow-sm">
                <span className="font-serif-title font-bold text-xs">P</span>
              </div>
              <span className="font-serif-title text-lg font-bold tracking-tight text-[#2C221E] dark:text-[#F4EFEA]">
                {settings.brandName || 'PAMPA'}
              </span>
            </div>
            <p className="text-xs text-[#7C6E65] dark:text-[#BAACA2] max-w-sm leading-relaxed">
              Mates artesanales, yerbas de estacionamiento natural y accesorios premium seleccionados con pasión.
            </p>
          </div>

          {/* Mobile 2-column section: Navigation & Contact side-by-side */}
          <div className="md:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 text-left">
            {/* Col: Navigation */}
            <div className="space-y-2">
              <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-[#2C221E] dark:text-[#F4EFEA]">
                Navegación
              </h4>
              <ul className="space-y-1.5 text-xs text-[#62534C] dark:text-[#C5B9B0]">
                <li>
                  <button onClick={() => onNavigate('hero')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer text-left">
                    Inicio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('catalogo')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer text-left">
                    Catálogo
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('nosotros')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer text-left">
                    Nosotros
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('envios-pagos')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer text-left">
                    Envíos y Pagos
                  </button>
                </li>
              </ul>
            </div>

            {/* Col: Contact & Social */}
            <div className="space-y-2">
              <h4 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-[#2C221E] dark:text-[#F4EFEA]">
                Contacto
              </h4>
              <ul className="space-y-2 text-xs text-[#62534C] dark:text-[#C5B9B0]">
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors group"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{settings.whatsappDisplay || 'WhatsApp'}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors group"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="truncate">@{settings.instagramHandle || 'pampa.mates'}</span>
                  </a>
                </li>
                <li className="inline-flex items-center gap-1.5 text-[#7C6E65] dark:text-[#BAACA2]">
                  <MapPin className="w-3.5 h-3.5 text-[#4B5A36] dark:text-[#809761] shrink-0" />
                  <span className="truncate">{settings.address || 'Argentina'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Rights Bar: Compact & Centered */}
        <div className="pt-4 flex flex-col items-center justify-center text-center text-xs text-[#9C8F87] dark:text-[#8C7D73] gap-1.5">
          <div className="flex flex-wrap items-center justify-center gap-1 leading-relaxed">
            <span>© {new Date().getFullYear()} {settings.brandName || 'PAMPA'} Mates & Yerbas. Todos los derechos reservados.</span>
            <button
              onClick={onAdminClick}
              className="w-4 h-4 rounded-full hover:bg-[#4B5A36]/10 dark:hover:bg-[#809761]/20 inline-flex items-center justify-center text-[#9C8F87] dark:text-[#8C7D73] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors focus:outline-none cursor-pointer"
              title="Acceso Administración"
              aria-label="Administración"
            >
              <Lock className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
            </button>
          </div>
          <p className="text-[10px] text-[#A89D96] dark:text-[#8C7D73] tracking-wide">
            Hecho con pasión y tradición matera
          </p>
        </div>
      </div>
    </footer>
  );
};

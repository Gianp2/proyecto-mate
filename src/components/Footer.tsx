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
    <footer id="contacto" className="bg-white dark:bg-[#241E1B] border-t border-[#EBE6DD] dark:border-[#3D322B] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#F2EFE9] dark:border-[#3D322B]">
          {/* Col 1: Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4B5A36] dark:bg-[#809761] text-white flex items-center justify-center">
                <span className="font-serif-title font-bold text-sm">P</span>
              </div>
              <span className="font-serif-title text-xl font-bold tracking-tight text-[#2C221E] dark:text-[#F4EFEA]">
                {settings.brandName || 'PAMPA'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#BAACA2] max-w-sm leading-relaxed">
              Productos seleccionados para disfrutar lo mejor de nuestras raíces. Mates artesanales, yerbas de estacionamiento natural y accesorios premium.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C221E] dark:text-[#F4EFEA]">Navegación</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#62534C] dark:text-[#C5B9B0]">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer">
                  Catálogo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nosotros')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer">
                  Nosotros
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('envios-pagos')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer">
                  Envíos y Pagos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer">
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2C221E] dark:text-[#F4EFEA]">Contacto & Redes</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#62534C] dark:text-[#C5B9B0]">
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors">
                  <MessageCircle className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                  <span>{settings.whatsappDisplay || '+54 11 1234 5678'}</span>
                </a>
              </li>
              <li>
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors">
                  <Instagram className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                  <span>@{settings.instagramHandle || 'pampa.mates'}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-[#7C6E65] dark:text-[#BAACA2]">
                <MapPin className="w-4 h-4 text-[#4B5A36] dark:text-[#809761]" />
                <span>{settings.address || 'Buenos Aires, Argentina'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights Bar + Discrete Admin Trigger */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9C8F87] dark:text-[#8C7D73] gap-2">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} {settings.brandName || 'Pampa'} Mates & Yerbas. Todos los derechos reservados.</span>
            {/* Discrete admin access icon - discreetly integrated leaf dot */}
            <button
              onClick={onAdminClick}
              className="w-4 h-4 rounded-full hover:bg-[#4B5A36]/10 dark:hover:bg-[#809761]/20 inline-flex items-center justify-center text-[#9C8F87] dark:text-[#8C7D73] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors ml-1 focus:outline-none cursor-pointer"
              title="Acceso Administración"
              aria-label="Administración"
            >
              <Lock className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
            </button>
          </p>
          <p className="text-[11px] text-[#A89D96] dark:text-[#8C7D73]">
            Hecho con pasión y tradición matera
          </p>
        </div>
      </div>
    </footer>
  );
};

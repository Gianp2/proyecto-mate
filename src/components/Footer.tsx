import React from 'react';
import {
  ArrowUpRight,
  Instagram,
  Lock,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (sectionId: string) => void;
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onAdminClick,
}) => {
  const brandName = settings.brandName || 'PAMPA';
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber);

  const navigationLinks = [
    { label: 'Inicio', section: 'hero' },
    { label: 'Catálogo', section: 'catalogo' },
    { label: 'Nosotros', section: 'nosotros' },
    { label: 'Envíos y Pagos', section: 'envios-pagos' },
  ];

  return (
    <footer
      id="contacto"
      className="
        relative w-full overflow-hidden
        border-t border-[#E9E3D9]
        bg-[#FCFAF7]
        pb-24 pt-12
        dark:border-[#3D322B]
        dark:bg-[#201A17]
        md:pb-8 md:pt-14
      "
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-32 -top-32
          h-72 w-72 rounded-full
          bg-[#4B5A36]/5 blur-3xl
          dark:bg-[#809761]/5
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-40 -left-32
          h-80 w-80 rounded-full
          bg-[#B99A6B]/5 blur-3xl
        "
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* Main content */}
        <div
          className="
            grid grid-cols-1 gap-10
            border-b border-[#E9E3D9] pb-10
            dark:border-[#3D322B]
            md:grid-cols-12 md:gap-12
          "
        >
          {/* Brand */}
          <div className="md:col-span-5">
            <div
              className="
                flex flex-col items-center text-center
                md:items-start md:text-left
              "
            >
              {/* Brand */}
              <button
                type="button"
                onClick={() => onNavigate('hero')}
                className="
                  group mb-4 inline-flex items-center gap-3
                  rounded-xl
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#4B5A36]
                  focus-visible:ring-offset-2
                  dark:focus-visible:ring-[#809761]
                  dark:focus-visible:ring-offset-[#201A17]
                "
                aria-label={`Ir al inicio de ${brandName}`}
              >
                <span
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full
                    bg-[#4B5A36]
                    text-white
                    shadow-sm
                    transition-transform duration-300
                    group-hover:scale-105
                    dark:bg-[#809761]
                  "
                >
                  <span className="font-serif-title text-sm font-bold">
                    {brandName.charAt(0).toUpperCase()}
                  </span>
                </span>

                <span
                  className="
                    font-serif-title text-xl font-bold
                    tracking-tight
                    text-[#2C221E]
                    dark:text-[#F4EFEA]
                  "
                >
                  {brandName}
                </span>
              </button>

              {/* Description */}
              <p
                className="
                  max-w-md text-sm leading-6
                  text-[#756960]
                  dark:text-[#B8AAA0]
                "
              >
                Mates artesanales, yerbas seleccionadas y accesorios
                materos elegidos con dedicación para disfrutar cada momento.
              </p>
            </div>
          </div>

          {/* Navigation + Contact */}
          <div
            className="
              grid grid-cols-2
              gap-6 sm:gap-12
              md:col-span-7
              md:grid-cols-2
            "
          >
            {/* Navigation */}
            <div className="flex flex-col items-center text-center">
              <h3
                className="
                  mb-4 text-[11px] font-bold uppercase
                  tracking-[0.16em]
                  text-[#40352F]
                  dark:text-[#F4EFEA]
                "
              >
                Navegación
              </h3>

              <nav aria-label="Navegación del sitio">
                <ul className="flex flex-col items-center space-y-3">
                  {navigationLinks.map((link) => (
                    <li key={link.section}>
                      <button
                        type="button"
                        onClick={() => onNavigate(link.section)}
                        className="
                          group inline-flex items-center
                          justify-center gap-1
                          text-sm
                          text-[#756960]
                          transition-colors
                          hover:text-[#4B5A36]
                          focus:outline-none
                          focus-visible:underline
                          dark:text-[#B8AAA0]
                          dark:hover:text-[#9AAF7E]
                        "
                      >
                        <span>{link.label}</span>

                        <ArrowUpRight
                          className="
                            h-3 w-3
                            opacity-0
                            transition-all
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:opacity-100
                          "
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center text-center">
              <h3
                className="
                  mb-4 text-[11px] font-bold uppercase
                  tracking-[0.16em]
                  text-[#40352F]
                  dark:text-[#F4EFEA]
                "
              >
                Contacto
              </h3>

              <ul className="flex flex-col items-center gap-3">

                {/* WhatsApp */}
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center justify-center
                      gap-2
                      text-sm
                      text-[#756960]
                      transition-colors
                      hover:text-[#4B5A36]
                      dark:text-[#B8AAA0]
                      dark:hover:text-[#9AAF7E]
                    "
                  >
                    <MessageCircle
                      className="
                        h-4 w-4 shrink-0
                        text-[#4B5A36]
                        dark:text-[#809761]
                      "
                    />

                    <span className="leading-5">
                      {settings.whatsappDisplay || 'WhatsApp'}
                    </span>
                  </a>
                </li>

                {/* Instagram */}
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center justify-center
                      gap-2
                      text-sm
                      text-[#756960]
                      transition-colors
                      hover:text-[#4B5A36]
                      dark:text-[#B8AAA0]
                      dark:hover:text-[#9AAF7E]
                    "
                  >
                    <Instagram
                      className="
                        h-4 w-4 shrink-0
                        text-[#4B5A36]
                        dark:text-[#809761]
                      "
                    />

                    <span className="leading-5">
                      @{settings.instagramHandle || 'pampa.mates'}
                    </span>
                  </a>
                </li>

                {/* Location */}
                <li>
                  <div
                    className="
                      inline-flex items-center justify-center
                      gap-2
                      text-sm
                      text-[#756960]
                      dark:text-[#B8AAA0]
                    "
                  >
                    <MapPin
                      className="
                        h-4 w-4 shrink-0
                        text-[#4B5A36]
                        dark:text-[#809761]
                      "
                    />

                    <span className="leading-5">
                      {settings.address || 'Argentina'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="
            flex flex-col items-center justify-between
            gap-4 pt-6
            text-center
            sm:flex-row sm:text-left
          "
        >
          <div
            className="
              flex flex-wrap items-center
              justify-center gap-x-2 gap-y-1
              text-[11px]
              text-[#9B9088]
              dark:text-[#82766D]
              sm:justify-start
            "
          >
            <span>
              © {new Date().getFullYear()} {brandName}. Todos los derechos
              reservados.
            </span>

            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>

            <span>
              Hecho con pasión y tradición matera.
            </span>
          </div>

          {/* Admin */}
          <button
            type="button"
            onClick={onAdminClick}
            title="Acceso Administración"
            aria-label="Acceso Administración"
            className="
              group inline-flex items-center gap-1.5
              rounded-lg px-2 py-1.5
              text-[10px]
              text-[#A79C94]
              transition-colors
              hover:bg-[#4B5A36]/5
              hover:text-[#4B5A36]
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#4B5A36]
              dark:text-[#776D66]
              dark:hover:bg-[#809761]/10
              dark:hover:text-[#9AAF7E]
              dark:focus-visible:ring-[#809761]
            "
          >
            <Lock
              className="
                h-3 w-3
                opacity-50
                transition-opacity
                group-hover:opacity-100
              "
            />

            <span>Administración</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, CheckCircle2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installed, setInstalled] = useState(false);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registrado exitosamente:', reg.scope);
          })
          .catch((err) => {
            console.error('[PWA] Fallo al registrar Service Worker:', err);
          });
      });
    }

    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setInstalled(true);
    }

    // Monitor Online / Offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);

      // Check if user previously dismissed prompt in this session
      const dismissed = sessionStorage.getItem('pampa_pwa_prompt_dismissed');
      if (!dismissed && !isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track app installation
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] App instalada con éxito en el dispositivo');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setShowPrompt(false);
    await deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó instalar la aplicación');
      setInstalled(true);
    } else {
      console.log('[PWA] Usuario rechazó la instalación');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pampa_pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Alert Indicator Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-[#2C221E] text-white p-3.5 rounded-2xl shadow-xl border border-[#4B5A36] flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#4B5A36]/30 flex items-center justify-center text-amber-400 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-300">Modo Sin Conexión</p>
                <p className="text-gray-300 text-[11px]">Estás explorando el catálogo guardado en tu dispositivo.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOffline(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Banner Prompt */}
      <AnimatePresence>
        {showPrompt && !installed && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white dark:bg-[#241E1B] p-4 rounded-2xl shadow-2xl border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#4B5A36] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5A36] dark:text-[#809761]">
                    Aplicación Móvil
                  </span>
                  <h4 className="font-serif-title font-bold text-base leading-tight">
                    Instalá PAMPA Mates
                  </h4>
                  <p className="text-xs text-[#7C6E65] dark:text-[#BAACA2] mt-0.5">
                    Accedé al catálogo más rápido y consultá sin conexión.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-[#7C6E65] hover:text-[#2C221E] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-[#4B5A36] hover:bg-[#3B482A] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Instalar en el celular</span>
              </button>
              <button
                onClick={handleDismiss}
                className="bg-[#F5F2EB] dark:bg-[#2D2622] hover:bg-[#EBE6DD] dark:hover:bg-[#3A312B] text-[#7C6E65] dark:text-[#BAACA2] font-semibold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Ahora no
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

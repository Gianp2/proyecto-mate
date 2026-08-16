import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          type="button"
          aria-label="Volver arriba"
          title="Volver al inicio"
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-[#4B5A36] dark:bg-[#809761] text-white shadow-lg hover:shadow-xl hover:bg-[#3B482A] dark:hover:bg-[#96AD76] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4B5A36] dark:focus:ring-[#809761] focus:ring-offset-2 active:scale-90"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

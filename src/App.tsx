import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { Catalog } from './components/Catalog';
import { ShippingAndPayment } from './components/ShippingAndPayment';
import { InstagramFeed } from './components/InstagramFeed';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { ScrollToTop } from './components/ScrollToTop';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { BottomNavigation } from './components/BottomNavigation';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, StoreSettings } from './types';
import { fetchProducts, fetchSettings, verifyAdminAuth } from './services/api';
import { INITIAL_SETTINGS } from './data/initialData';
import { useSeoMetadata } from './hooks/useSeoMetadata';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'store' | 'admin-login' | 'admin-dashboard'>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pampa_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return document.documentElement.classList.contains('dark');
    } catch {
      return document.documentElement.classList.contains('dark');
    }
  });

  // Dynamic SEO metadata hook for document title & meta tags
  useSeoMetadata({
    currentRoute,
    selectedProduct,
    activeSection,
    settings,
  });

  // Intersection Observer to detect current visible section on scroll
  useEffect(() => {
    if (currentRoute !== 'store' || loading) return;

    const sections = ['hero', 'nosotros', 'catalogo', 'envios-pagos', 'contacto'];
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0.15,
    });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentRoute, loading]);

  const applyTheme = useCallback((isDark: boolean) => {
    try {
      localStorage.setItem('pampa_theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Could not persist theme preference:', e);
    }

    const currentlyDark = document.documentElement.classList.contains('dark');
    if (currentlyDark === isDark) return;

    const updateDOM = () => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      try {
        const transition = (document as any).startViewTransition(updateDOM);
        if (transition) {
          if (transition.ready) transition.ready.catch(() => {});
          if (transition.finished) transition.finished.catch(() => {});
        }
      } catch {
        updateDOM();
      }
    } else {
      updateDOM();
    }
  }, []);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode, applyTheme]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Sync route based on URL path or query
  useEffect(() => {
    const handleUrlRoute = async () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const productSlug = searchParams.get('producto');

      if (path === '/admin/login') {
        setCurrentRoute('admin-login');
      } else if (path === '/admin/dashboard' || path === '/admin') {
        const isAuth = await verifyAdminAuth();
        if (isAuth) {
          setCurrentRoute('admin-dashboard');
        } else {
          setCurrentRoute('admin-login');
        }
      } else {
        setCurrentRoute('store');
      }

      // Load initial catalog & settings
      try {
        const [prods, stts] = await Promise.all([
          fetchProducts(),
          fetchSettings().catch(() => INITIAL_SETTINGS),
        ]);
        setProducts(prods);
        setSettings(stts);

        // Check if individual product URL requested
        if (productSlug) {
          const match = prods.find((p) => p.slug === productSlug || p.id === productSlug);
          if (match) {
            setSelectedProduct(match);
          }
        }
      } catch (e) {
        console.error('Error fetching initial app data:', e);
      } finally {
        setLoading(false);
      }
    };

    handleUrlRoute();

    const handlePopState = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const productSlug = searchParams.get('producto');

      if (path === '/admin/login') {
        setCurrentRoute('admin-login');
      } else if (path.startsWith('/admin')) {
        setCurrentRoute('admin-dashboard');
      } else {
        setCurrentRoute('store');
      }

      if (productSlug) {
        setProducts((currentProducts) => {
          const match = currentProducts.find((p) => p.slug === productSlug || p.id === productSlug);
          if (match) setSelectedProduct(match);
          return currentProducts;
        });
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when product selected or modal closed
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    const newUrl = `${window.location.pathname}?producto=${product.slug}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    const newUrl = window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const navigateToRoute = (route: 'store' | 'admin-login' | 'admin-dashboard') => {
    setCurrentRoute(route);
    let targetPath = '/';
    if (route === 'admin-login') targetPath = '/admin/login';
    if (route === 'admin-dashboard') targetPath = '/admin/dashboard';
    window.history.pushState({}, '', targetPath);
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      const headerOffset = 80;
      const elementPosition = elem.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, y: 16, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.99 },
  };

  return (
    <AnimatePresence mode="wait">
      {currentRoute === 'admin-login' && (
        <motion.div
          key="admin-login"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitionVariants}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminLogin
            onLoginSuccess={() => navigateToRoute('admin-dashboard')}
            onReturnToStore={() => navigateToRoute('store')}
          />
        </motion.div>
      )}

      {currentRoute === 'admin-dashboard' && (
        <motion.div
          key="admin-dashboard"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitionVariants}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <AdminDashboard
            onLogout={() => navigateToRoute('admin-login')}
            onReturnToStore={() => navigateToRoute('store')}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </motion.div>
      )}

      {currentRoute === 'store' && (
        <motion.div
          key="store"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitionVariants}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#1A1614] text-[#2C221E] dark:text-[#F4EFEA] transition-colors duration-300 antialiased"
        >
          <Header
            settings={settings}
            activeSection={activeSection}
            onNavigate={handleNavigateSection}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          <main className="flex-1 pb-16 md:pb-0">
            <Hero
              settings={settings}
              onExploreCatalog={() => handleNavigateSection('catalogo')}
            />

            <TrustSection />

            <FeaturedProducts
              products={products}
              settings={settings}
              onSelectProduct={handleSelectProduct}
            />

            <Catalog
              products={products}
              settings={settings}
              onSelectProduct={handleSelectProduct}
              loading={loading}
            />

            <ShippingAndPayment settings={settings} />

            <InstagramFeed settings={settings} />
          </main>

          <Footer
            settings={settings}
            onNavigate={handleNavigateSection}
            onAdminClick={() => navigateToRoute('admin-login')}
          />

          {/* Product Detail Modal with smooth exit & enter animation */}
          <AnimatePresence>
            {selectedProduct && (
              <ProductModal
                product={selectedProduct}
                settings={settings}
                onClose={handleCloseProductModal}
              />
            )}
          </AnimatePresence>

          {/* Floating Scroll to Top button */}
          <ScrollToTop />

          {/* Mobile Bottom Navigation Bar */}
          <BottomNavigation
            settings={settings}
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
          />

          {/* PWA Service Worker & Install Prompt Banner */}
          <PwaInstallPrompt />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

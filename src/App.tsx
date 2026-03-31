import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCalculatorStore } from './store/calculatorStore';
import StarField from './components/StarField';
import Navbar from './components/Navbar';
import WeightInput from './components/WeightInput';
import BodySelector from './components/BodySelector';
import WeightResult from './components/WeightResult';
import ComparisonBar from './components/ComparisonBar';
import FunFact, { BodyDetail } from './components/BodyDetail';
import CompareView from './components/CompareView';
import CustomBodyView from './components/CustomBodyView';
import Footer from './components/Footer';

export default function App() {
  const { activeView, theme, setResolvedTheme } = useCalculatorStore();

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : theme
    );

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (e: MediaQueryListEvent) => {
        const resolved = e.matches ? 'light' : 'dark';
        setResolvedTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, setResolvedTheme]);

  return (
    <>
      <StarField />
      <div className="app-layout">
        <Navbar />

        {/* Mobile header */}
        <div className="main-content">
          <div className="mobile-header">
            <span className="mobile-header-logo">🪐</span>
            <span className="mobile-header-title">Cosmic Weight</span>
            <div className="mobile-header-actions">
              <button
                className="theme-toggle"
                onClick={() => {
                  const newTheme = theme === 'dark' ? 'light' : 'dark';
                  useCalculatorStore.getState().setTheme(newTheme);
                  useCalculatorStore.getState().setResolvedTheme(newTheme);
                  document.documentElement.setAttribute('data-theme', newTheme);
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CalculatorView />
              </motion.div>
            )}

            {activeView === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CompareView />
              </motion.div>
            )}

            {activeView === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <BodyDetail />
              </motion.div>
            )}

            {activeView === 'custom' && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CustomBodyView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
      </div>
    </>
  );
}

export function CalculatorView() {
  const { setActiveView } = useCalculatorStore();

  return (
    <div className="calculator-view" id="calculator-view-section">
      <div className="calculator-left">
        <WeightInput />
        <BodySelector />
        {/* Subtle CTA for Custom Body */}
        <button
          className="custom-cta-inline"
          onClick={() => setActiveView('custom')}
          id="custom-body-cta"
        >
          <span className="custom-cta-icon">🔬</span>
          <span className="custom-cta-text">Create a custom body with any mass & radius</span>
          <span className="custom-cta-arrow">→</span>
        </button>
      </div>
      <div className="calculator-right">
        <WeightResult />
        <ComparisonBar />
        <FunFact />
      </div>
    </div>
  );
}


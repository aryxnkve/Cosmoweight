import { useCalculatorStore } from '../store/calculatorStore';
import type { ViewType } from '../data/types';

const tabs: { id: ViewType; icon: string; label: string }[] = [
  { id: 'calculator', icon: '⚖️', label: 'Calculator' },
  { id: 'compare', icon: '📊', label: 'Compare' },
  { id: 'explore', icon: '🔭', label: 'Explore' },
  { id: 'custom', icon: '🔬', label: 'Custom' },
];

export default function Navbar() {
  const { activeView, setActiveView, theme, setTheme, setResolvedTheme } = useCalculatorStore();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setResolvedTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <a className="navbar-brand" href="/" aria-label="Cosmic Weight Calculator home">
          <span className="navbar-logo">🪐</span>
          <span className="navbar-title">Cosmic Weight</span>
        </a>

        <div className="navbar-nav" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              className={`nav-tab ${activeView === tab.id ? 'active' : ''}`}
              onClick={() => setActiveView(tab.id)}
              role="tab"
              aria-selected={activeView === tab.id}
              aria-controls={`view-${tab.id}`}
            >
              <span className="nav-tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

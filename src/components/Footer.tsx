export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-main">
          <span className="footer-logo">🪐</span>
          <div>
            <p className="footer-brand">Cosmic Weight Calculator</p>
            <p className="footer-tagline">Discover your weight across the universe</p>
          </div>
        </div>
        <div className="footer-links">
          <p className="footer-disclaimer">
            All gravity values are based on publicly available astrophysics data.
            Theoretical bodies are marked with disclaimers.
            Not intended for actual space mission planning. 🚀
          </p>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            Built with ❤️ and React • Data from NASA & ESA
          </p>
        </div>
      </div>
    </footer>
  );
}

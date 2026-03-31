import { useMemo, useState } from 'react';
import { useCalculatorStore } from '../store/calculatorStore';
import { celestialBodies, categoryLabels, categoryOrder } from '../data/celestialBodies';
import type { Category, CelestialBody } from '../data/types';

export default function BodySelector() {
  const { selectedBody, setSelectedBody, searchQuery, setSearchQuery } = useCalculatorStore();
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filteredBodies = useMemo(() => {
    let bodies = celestialBodies;

    if (activeCategory !== 'all') {
      bodies = bodies.filter((b) => b.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      bodies = bodies.filter((b) => b.name.toLowerCase().includes(q));
    }

    return bodies;
  }, [activeCategory, searchQuery]);

  const handleSelectBody = (body: CelestialBody) => {
    setSelectedBody(body);
  };

  return (
    <div className="body-selector-card glass-card" id="body-selector-section">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">🌍</span>
        <h2 className="section-title">Choose a Celestial Body</h2>
      </div>

      <div className="body-search-wrapper">
        <span className="body-search-icon" aria-hidden="true">🔍</span>
        <input
          id="body-search"
          type="text"
          className="body-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search planets, moons, stars..."
          aria-label="Search celestial bodies"
        />
      </div>

      <div className="category-tabs" role="tablist" aria-label="Body categories">
        <button
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
          role="tab"
          aria-selected={activeCategory === 'all'}
        >
          All
        </button>
        {categoryOrder.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            role="tab"
            aria-selected={activeCategory === cat}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="body-grid" role="listbox" aria-label="Celestial bodies">
        {filteredBodies.map((body) => (
          <button
            key={body.id}
            id={`body-${body.id}`}
            className={`body-card ${selectedBody.id === body.id ? 'selected' : ''}`}
            onClick={() => handleSelectBody(body)}
            role="option"
            aria-selected={selectedBody.id === body.id}
            aria-label={`Select ${body.name}`}
          >
            <div className="body-card-planet">
              {body.imageUrl ? (
                <img
                  src={body.imageUrl}
                  alt={body.name}
                  className="body-card-planet-sphere"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <div
                  className="body-card-planet-sphere"
                  style={{ background: body.cssGradient }}
                />
              )}
              {body.id === 'saturn' && !body.imageUrl && <div className="planet-ring" />}
            </div>
            <span className="body-card-name">{body.name}</span>
          </button>
        ))}
        {filteredBodies.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
            No bodies found matching "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
}

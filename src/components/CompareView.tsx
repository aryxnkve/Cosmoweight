import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '../store/calculatorStore';
import { celestialBodies, categoryLabels, categoryOrder } from '../data/celestialBodies';
import { calculateWeight, formatWeight, formatGravityMultiplier, unitLabels, validateWeightInput } from '../utils/calculations';
import type { Category, CelestialBody, SortField, DisplayMode } from '../data/types';

const stateColors: Record<DisplayMode, string> = {
  normal: 'var(--text-bright)',
  heavy: 'var(--state-heavy)',
  light: 'var(--state-light)',
  zero_g: 'var(--state-zerog)',
  microgravity: 'var(--state-micro)',
  negative_weight: 'var(--state-negative)',
};

function getWeightColor(mode: DisplayMode): string {
  return stateColors[mode] || 'var(--text-bright)';
}

export default function CompareView() {
  const { weightInput, selectedUnit, compareSort, setCompareSort, compareFilter, setCompareFilter, openBodyDetail } = useCalculatorStore();
  const validation = validateWeightInput(weightInput);
  const inputValue = parseFloat(weightInput);

  const sortedBodies = useMemo(() => {
    let bodies = [...celestialBodies];

    // Filter
    if (compareFilter !== 'all') {
      bodies = bodies.filter((b) => b.category === compareFilter);
    }

    // Sort
    bodies.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (compareSort.field) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          return compareSort.direction === 'asc'
            ? (aVal as string).localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        case 'gravity':
          aVal = Math.abs(a.gravityMultiplier);
          bVal = Math.abs(b.gravityMultiplier);
          break;
        case 'weight':
          aVal = Math.abs(a.gravityMultiplier);
          bVal = Math.abs(b.gravityMultiplier);
          break;
        default:
          return 0;
      }
      return compareSort.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return bodies;
  }, [compareFilter, compareSort]);

  const handleSort = (field: SortField) => {
    if (compareSort.field === field) {
      setCompareSort({ field, direction: compareSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setCompareSort({ field, direction: field === 'name' ? 'asc' : 'desc' });
    }
  };

  const handleBodyClick = (body: CelestialBody) => {
    openBodyDetail(body);
  };

  // Logarithmic bar scale to visualize the enormous range from asteroids to black holes
  const logBarWidth = (multiplier: number): number => {
    if (multiplier === 0) return 0;
    const abs = Math.abs(multiplier);
    // log10(1) = 0, log10(10) = 1, log10(1e12) = 12
    // Map to 0-100 range with a minimum visible width of 2%
    const maxLog = 12; // black hole ~1e12
    const logVal = Math.log10(Math.max(abs, 0.0001));
    // Shift so even tiny values get some bar: (logVal + 4) / (maxLog + 4) maps -4..12 → 0..1
    return Math.max(2, Math.min(100, ((logVal + 4) / (maxLog + 4)) * 100));
  };

  return (
    <div className="compare-view" id="compare-view-section">
      <h2 className="page-title">
        Compare <span className="page-title-accent">All Bodies</span>
      </h2>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '-16px', marginBottom: '20px' }}>
        {sortedBodies.length} celestial {sortedBodies.length === 1 ? 'body' : 'bodies'}
        {validation.valid && ` • Weight: ${weightInput} ${unitLabels[selectedUnit]}`}
      </p>

      {/* Controls */}
      <div className="compare-controls">
        <select
          className="category-tab"
          value={compareFilter}
          onChange={(e) => setCompareFilter(e.target.value as Category | 'all')}
          style={{ padding: '8px 16px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer' }}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categoryOrder.map((cat) => (
            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['name', 'gravity'] as SortField[]).map((field) => (
            <button
              key={field}
              className={`compare-sort-btn ${compareSort.field === field ? 'active' : ''}`}
              onClick={() => handleSort(field)}
            >
              {field === 'name' ? 'A–Z' : 'Gravity'}
              {compareSort.field === field && (compareSort.direction === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="compare-grid">
        {sortedBodies.map((body, index) => {
          const weight = validation.valid
            ? calculateWeight(inputValue, selectedUnit, body)
            : null;

          const barWidth = logBarWidth(body.gravityMultiplier);

          const getBarColor = () => {
            if (body.displayMode === 'heavy') return 'linear-gradient(90deg, #ff6040, #ff8c42)';
            if (body.displayMode === 'light') return 'linear-gradient(90deg, #40d8c0, #40a0e0)';
            if (body.displayMode === 'zero_g') return 'linear-gradient(90deg, #60d0ff, #a080e0)';
            if (body.displayMode === 'negative_weight') return 'linear-gradient(90deg, #b040ff, #d060ff)';
            if (body.displayMode === 'microgravity') return 'linear-gradient(90deg, #80c0e0, #60d0ff)';
            return `linear-gradient(90deg, ${body.accentColor}, ${body.accentColor}cc)`;
          };

          return (
            <motion.div
              key={body.id}
              className="compare-item glass-card glass-card--interactive"
              onClick={() => handleBodyClick(body)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${body.accentColor}, transparent)` }} />

              <div className="compare-item-header">
                <div className="compare-item-planet">
                  {body.imageUrl ? (
                    <img
                      src={body.imageUrl}
                      alt={body.name}
                      className="compare-item-planet-sphere"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="compare-item-planet-sphere"
                      style={{ background: body.cssGradient }}
                    />
                  )}
                </div>
                <div>
                  <p className="compare-item-name">{body.name}</p>
                  <p className="compare-item-category">{categoryLabels[body.category]}</p>
                </div>
              </div>

              {weight ? (
                <>
                  <p className="compare-item-weight" style={{ color: getWeightColor(body.displayMode) }}>
                    {body.displayMode === 'zero_g'
                      ? '0'
                      : formatWeight(weight.weightInSelectedUnit, selectedUnit)}
                    <span className="compare-item-unit"> {unitLabels[selectedUnit]}</span>
                  </p>
                  <p className="compare-item-gravity">
                    {formatGravityMultiplier(body.gravityMultiplier)} Earth gravity
                  </p>
                </>
              ) : (
                <>
                  <p className="compare-item-gravity" style={{ marginTop: 0 }}>
                    {formatGravityMultiplier(body.gravityMultiplier)} Earth gravity
                  </p>
                  <p className="compare-item-gravity">
                    {body.surfaceGravityMs2.toFixed(2)} m/s²
                  </p>
                </>
              )}

              <div className="compare-item-bar">
                <motion.div
                  className="compare-item-bar-fill"
                  style={{ background: getBarColor() }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, delay: Math.min(index * 0.03 + 0.2, 0.7) }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

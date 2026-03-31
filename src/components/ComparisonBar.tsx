import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '../store/calculatorStore';
import { formatGravityMultiplier, validateWeightInput } from '../utils/calculations';

export default function ComparisonBar() {
  const { weightInput, selectedBody } = useCalculatorStore();
  const validation = validateWeightInput(weightInput);

  const data = useMemo(() => {
    if (!validation.valid) return null;

    const earthGravity = 9.81;
    const selectedGravity = Math.abs(selectedBody.surfaceGravityMs2);
    // Cap at 300% for display, but show real value
    const earthPercent = 100;
    const selectedPercent = Math.min((selectedGravity / earthGravity) * 100, 300);

    return {
      earthPercent,
      selectedPercent,
      selectedGravity,
      earthGravity,
      maxPercent: Math.max(earthPercent, selectedPercent),
    };
  }, [selectedBody, validation.valid]);

  if (!data) return null;

  const barScale = 100 / Math.max(data.maxPercent, 100);

  const getBarColor = () => {
    if (selectedBody.displayMode === 'heavy') return 'linear-gradient(90deg, #ff6040, #ff8c42)';
    if (selectedBody.displayMode === 'light') return 'linear-gradient(90deg, #40d8c0, #40a0e0)';
    if (selectedBody.displayMode === 'zero_g') return 'linear-gradient(90deg, #60d0ff, #a080e0)';
    if (selectedBody.displayMode === 'negative_weight') return 'linear-gradient(90deg, #b040ff, #d060ff)';
    return `linear-gradient(90deg, ${selectedBody.accentColor}, ${selectedBody.accentColor}cc)`;
  };

  return (
    <div className="comparison-bar-card glass-card" id="comparison-bar-section">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">📏</span>
        <h2 className="section-title">Gravity Comparison</h2>
      </div>

      <div className="comparison-bar-container">
        {/* Earth bar */}
        <div className="comparison-bar-row">
          <span className="comparison-bar-label">🌍 Earth</span>
          <div className="comparison-bar-track" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="comparison-bar-fill"
              style={{ background: 'linear-gradient(90deg, #4a90d9, #60b0ff)' }}
              initial={{ width: 0 }}
              animate={{ width: `${data.earthPercent * barScale}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <span className="comparison-bar-value">1.00×</span>
        </div>

        {/* Selected body bar */}
        <div className="comparison-bar-row">
          <span className="comparison-bar-label">{selectedBody.emoji} {selectedBody.name}</span>
          <div className="comparison-bar-track" role="progressbar" aria-valuenow={data.selectedPercent} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="comparison-bar-fill"
              style={{ background: getBarColor() }}
              initial={{ width: 0 }}
              animate={{ width: `${data.selectedPercent * barScale}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            />
          </div>
          <span className="comparison-bar-value">{formatGravityMultiplier(selectedBody.gravityMultiplier)}</span>
        </div>
      </div>
    </div>
  );
}

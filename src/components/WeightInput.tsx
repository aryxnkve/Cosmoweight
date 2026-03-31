import { useCalculatorStore } from '../store/calculatorStore';
import { validateWeightInput, unitLabels } from '../utils/calculations';
import type { UnitType } from '../data/types';

const units: UnitType[] = ['kg', 'lbs', 'N', 'stone'];

export default function WeightInput() {
  const { weightInput, setWeightInput, selectedUnit, setSelectedUnit } = useCalculatorStore();
  const validation = validateWeightInput(weightInput);
  const hasInput = weightInput.trim().length > 0;

  return (
    <div className="weight-input-card glass-card" id="weight-input-section">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">⚖️</span>
        <h2 className="section-title">Your Weight on Earth</h2>
      </div>

      <div className="weight-input-group">
        <div className="weight-input-wrapper">
          <input
            id="weight-input"
            type="number"
            className={`weight-input ${hasInput && !validation.valid ? 'error' : ''}`}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="70"
            min="0.1"
            max="99999"
            step="any"
            aria-label={`Enter your weight in ${unitLabels[selectedUnit]}`}
            autoComplete="off"
          />
          {hasInput && !validation.valid && (
            <p className="weight-input-error" role="alert">{validation.error}</p>
          )}
        </div>

        <div className="unit-selector" role="radiogroup" aria-label="Weight unit">
          {units.map((unit) => (
            <button
              key={unit}
              id={`unit-btn-${unit}`}
              className={`unit-btn ${selectedUnit === unit ? 'active' : ''}`}
              onClick={() => setSelectedUnit(unit)}
              role="radio"
              aria-checked={selectedUnit === unit}
              aria-label={`Select ${unit}`}
            >
              {unitLabels[unit]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

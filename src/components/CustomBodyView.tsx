// ═══════════════════════════════════════════════════════════════
//  Custom Body View — Calculate Weight on Any Imaginable Body
//  F-01 Input Form, F-02 Real-Time Calc, F-03 Result Display,
//  F-04 Step-by-Step Breakdown, F-05 Plausibility Warnings,
//  F-08 Compare Custom vs Presets
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '../store/calculatorStore';
import { computeGravity, computeWeight, checkPlausibility, generateBreakdown } from '../lib/gravityEngine';
import { toKilograms, toMetres, massUnitLabels, massUnitFullNames, radiusUnitLabels, radiusUnitFullNames } from '../lib/unitConversion';
import { formatWeight, unitLabels, validateWeightInput } from '../utils/calculations';
import type { MassUnit, RadiusUnit, CustomWeightResult, PlausibilityWarning, CalculationStep } from '../data/types';

// ─── REFERENCE BODIES FOR COMPARE (F-08) ────────────────────
const COMPARE_BODIES = [
  { name: 'Moon', emoji: '🌙', g_ms2: 1.62, ratio: 0.165 },
  { name: 'Mars', emoji: '♂️', g_ms2: 3.72, ratio: 0.379 },
  { name: 'Earth', emoji: '🌍', g_ms2: 9.81, ratio: 1.0 },
  { name: 'Jupiter', emoji: '♃', g_ms2: 24.79, ratio: 2.528 },
  { name: 'Sun', emoji: '☀️', g_ms2: 274.0, ratio: 27.94 },
];

const MASS_UNITS: MassUnit[] = ['kg', 'earth_mass', 'jupiter_mass', 'solar_mass'];
const RADIUS_UNITS: RadiusUnit[] = ['m', 'km', 'earth_radius', 'au'];

export default function CustomBodyView() {
  const {
    weightInput, selectedUnit,
    customBodyName, customMassInput, customMassUnit,
    customRadiusInput, customRadiusUnit, showBreakdown,
    setCustomBodyName, setCustomMassInput, setCustomMassUnit,
    setCustomRadiusInput, setCustomRadiusUnit, setShowBreakdown,
  } = useCalculatorStore();

  // ─── Debounced computation (F-02: 300ms) ──────────────────
  const [debouncedMass, setDebouncedMass] = useState(customMassInput);
  const [debouncedRadius, setDebouncedRadius] = useState(customRadiusInput);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debouncedSetMass = useCallback((val: string) => {
    setCustomMassInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedMass(val), 300);
  }, [setCustomMassInput]);

  const debouncedSetRadius = useCallback((val: string) => {
    setCustomRadiusInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedRadius(val), 300);
  }, [setCustomRadiusInput]);

  // Sync on unit change
  useEffect(() => { setDebouncedMass(customMassInput); }, [customMassUnit]);
  useEffect(() => { setDebouncedRadius(customRadiusInput); }, [customRadiusUnit]);

  // ─── Validation ───────────────────────────────────────────
  const massValue = parseFloat(debouncedMass);
  const radiusValue = parseFloat(debouncedRadius);
  const weightValidation = validateWeightInput(weightInput);
  const userWeight = parseFloat(weightInput);

  const massValid = !isNaN(massValue) && massValue > 0;
  const radiusValid = !isNaN(radiusValue) && radiusValue > 0;
  const allValid = massValid && radiusValid && weightValidation.valid;

  // ─── Computation ──────────────────────────────────────────
  const computation = useMemo(() => {
    if (!allValid) return null;

    const massKg = toKilograms(massValue, customMassUnit);
    const radiusM = toMetres(radiusValue, customRadiusUnit);

    if (massKg <= 0 || radiusM <= 0) return null;

    const gravity = computeGravity(massKg, radiusM);
    const weight = computeWeight(gravity, userWeight, selectedUnit);
    const warnings = checkPlausibility(
      gravity.g_ms2, gravity.density_kg_m3,
      radiusM, gravity.schwarzschild_r_m, massKg
    );
    const breakdown = generateBreakdown(
      massValue, customMassUnit,
      radiusValue, customRadiusUnit,
      userWeight, selectedUnit, weight
    );

    return { weight, warnings, breakdown };
  }, [massValue, radiusValue, customMassUnit, customRadiusUnit, userWeight, selectedUnit, allValid]);

  const isBlocked = computation?.warnings.some(w => w.severity === 'BLOCKED') ?? false;

  // ─── Animated count-up for result ─────────────────────────
  const [displayG, setDisplayG] = useState(0);
  const prevGRef = useRef(0);

  useEffect(() => {
    if (!computation || isBlocked) { setDisplayG(0); return; }
    const target = computation.weight.g_ms2;
    const start = prevGRef.current;
    const duration = 600;
    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayG(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else prevGRef.current = target;
    }
    requestAnimationFrame(animate);
  }, [computation, isBlocked]);

  return (
    <div className="custom-view" id="custom-body-view">
      {/* ── Formula Hero ── */}
      <div className="custom-formula-hero">
        <h2 className="custom-formula-text">
          <span className="custom-formula-g">g</span>
          <span className="custom-formula-eq">=</span>
          <span className="custom-formula-frac">
            <span className="custom-formula-num">G × M</span>
            <span className="custom-formula-den">r²</span>
          </span>
        </h2>
        <p className="custom-formula-subtitle">Calculate weight on any imaginable body</p>
      </div>

      <div className="custom-layout">
        {/* ════════ INPUT ZONE ════════ */}
        <div className="custom-input-zone glass-card" id="custom-input-section">
          <div className="section-header">
            <span className="section-icon" aria-hidden="true">🔬</span>
            <h2 className="section-title">Define Your Body</h2>
          </div>

          {/* Body Name */}
          <div className="custom-field">
            <label htmlFor="custom-body-name" className="custom-field-label">
              Body Name <span className="custom-field-optional">(optional)</span>
            </label>
            <input
              id="custom-body-name"
              type="text"
              className="custom-text-input"
              value={customBodyName}
              onChange={(e) => setCustomBodyName(e.target.value)}
              placeholder="e.g. Kepler-442b, My Planet..."
              maxLength={40}
              aria-label="Body name"
            />
          </div>

          {/* Mass + Radius Grid */}
          <div className="custom-input-grid">
            {/* Mass */}
            <div className="custom-field">
              <label htmlFor="custom-mass" className="custom-field-label">Mass of Body *</label>
              <div className="custom-input-with-unit">
                <input
                  id="custom-mass"
                  type="number"
                  className={`custom-numeric-input ${debouncedMass && !massValid ? 'error' : ''}`}
                  value={customMassInput}
                  onChange={(e) => debouncedSetMass(e.target.value)}
                  placeholder="1.0"
                  min="0"
                  step="any"
                  aria-label={`Mass in ${massUnitFullNames[customMassUnit]}`}
                />
                <select
                  id="custom-mass-unit"
                  className="custom-unit-dropdown"
                  value={customMassUnit}
                  onChange={(e) => setCustomMassUnit(e.target.value as MassUnit)}
                  aria-label="Mass unit"
                >
                  {MASS_UNITS.map(u => (
                    <option key={u} value={u}>{massUnitLabels[u]} — {massUnitFullNames[u]}</option>
                  ))}
                </select>
              </div>
              {debouncedMass && !massValid && (
                <p className="custom-field-error" role="alert">Mass must be a positive number.</p>
              )}
            </div>

            {/* Radius */}
            <div className="custom-field">
              <label htmlFor="custom-radius" className="custom-field-label">Radius of Body *</label>
              <div className="custom-input-with-unit">
                <input
                  id="custom-radius"
                  type="number"
                  className={`custom-numeric-input ${debouncedRadius && !radiusValid ? 'error' : ''}`}
                  value={customRadiusInput}
                  onChange={(e) => debouncedSetRadius(e.target.value)}
                  placeholder="1.0"
                  min="0"
                  step="any"
                  aria-label={`Radius in ${radiusUnitFullNames[customRadiusUnit]}`}
                />
                <select
                  id="custom-radius-unit"
                  className="custom-unit-dropdown"
                  value={customRadiusUnit}
                  onChange={(e) => setCustomRadiusUnit(e.target.value as RadiusUnit)}
                  aria-label="Radius unit"
                >
                  {RADIUS_UNITS.map(u => (
                    <option key={u} value={u}>{radiusUnitLabels[u]} — {radiusUnitFullNames[u]}</option>
                  ))}
                </select>
              </div>
              {debouncedRadius && !radiusValid && (
                <p className="custom-field-error" role="alert">Radius must be a positive number.</p>
              )}
            </div>
          </div>

          {/* Weight (reuse existing) */}
          <div className="custom-field">
            <label htmlFor="custom-weight" className="custom-field-label">Your Weight on Earth *</label>
            <div className="custom-weight-display">
              <span className="custom-weight-value">
                {weightValidation.valid ? `${weightInput} ${unitLabels[selectedUnit]}` : 'Enter on Calculator tab'}
              </span>
              {!weightValidation.valid && (
                <p className="custom-field-error">Set your weight in the Calculator view first.</p>
              )}
            </div>
          </div>
        </div>

        {/* ════════ RESULT ZONE (direct grid child) ════════ */}
        {computation && !isBlocked && (
          <ResultPanel
            key="result"
            result={computation.weight}
            warnings={computation.warnings}
            displayG={displayG}
            bodyName={customBodyName || 'Custom Body'}
            selectedUnit={selectedUnit}
            userWeight={userWeight}
          />
        )}

        {isBlocked && computation && (
          <BlackHoleState
            key="blocked"
            warnings={computation.warnings}
          />
        )}

        {!computation && (
          <div className="custom-empty-state glass-card">
            <span className="custom-empty-icon">🪐</span>
            <p className="custom-empty-text">Enter mass and radius to calculate gravity</p>
          </div>
        )}
      </div>

      {/* ════════ EDUCATION ZONE ════════ */}
      {computation && !isBlocked && (
        <>
          {/* Step-by-step breakdown (F-04) */}
          <div className="custom-breakdown-section glass-card" id="custom-breakdown">
            <button
              className="custom-breakdown-toggle"
              onClick={() => setShowBreakdown(!showBreakdown)}
              aria-expanded={showBreakdown}
              aria-controls="breakdown-content"
            >
              <span>📐 Show Calculation</span>
              <span className={`custom-breakdown-chevron ${showBreakdown ? 'open' : ''}`}>▼</span>
            </button>

            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  id="breakdown-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="custom-breakdown-steps">
                    {computation.breakdown.map((step) => (
                      <BreakdownStep key={step.step} step={step} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Compare chart (F-08) */}
          <CompareChart
            customG={computation.weight.g_ms2}
            customRatio={computation.weight.ratio_vs_earth}
            bodyName={customBodyName || 'Custom Body'}
          />
        </>
      )}
    </div>
  );
}


// ─── Result Panel (F-03) ────────────────────────────────────
function ResultPanel({
  result, warnings, displayG, bodyName, selectedUnit, userWeight,
}: {
  result: CustomWeightResult;
  warnings: PlausibilityWarning[];
  displayG: number;
  bodyName: string;
  selectedUnit: string;
  userWeight: number;
}) {
  const nonBlockedWarnings = warnings.filter(w => w.severity !== 'BLOCKED');

  const formatSig = (n: number, sig: number = 4): string => {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 0.001 && abs < 1e6) return n.toPrecision(sig);
    return n.toExponential(sig - 1);
  };

  const diffSign = result.weight_diff_unit > 0 ? '+' : '';
  const diffLabel = result.weight_diff_unit > 0 ? 'heavier' : result.weight_diff_unit < 0 ? 'lighter' : '';

  return (
    <motion.div
      className="custom-result-panel glass-card"
      data-mode="custom"
      id="custom-result-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="custom-result-header">
        <div className="custom-result-planet-icon">🔬</div>
        <div>
          <h3 className="custom-result-name">{bodyName}</h3>
          <p className="custom-result-category">Custom Body</p>
        </div>
      </div>

      {/* Main result */}
      <div className="custom-result-main">
        <motion.p
          className="custom-result-g"
          key={displayG}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {formatSig(displayG)}
          <span className="custom-result-g-unit">m/s²</span>
        </motion.p>
        <p className="custom-result-ratio">{formatSig(result.ratio_vs_earth)}× Earth gravity</p>
      </div>

      {/* Weight result */}
      <div className="custom-result-weight-row">
        <div className="custom-result-weight-card">
          <p className="custom-result-weight-label">Your weight here</p>
          <p className="custom-result-weight-value">
            {formatWeight(result.weight_on_body_unit)} <span>{unitLabels[selectedUnit as keyof typeof unitLabels]}</span>
          </p>
        </div>
        <div className="custom-result-weight-card">
          <p className="custom-result-weight-label">Weight on Earth</p>
          <p className="custom-result-weight-value custom-result-weight-earth">
            {userWeight} <span>{unitLabels[selectedUnit as keyof typeof unitLabels]}</span>
          </p>
        </div>
      </div>

      {/* Weight difference */}
      <div className={`custom-result-diff ${result.weight_diff_unit > 0 ? 'heavier' : 'lighter'}`}>
        {diffSign}{formatWeight(Math.abs(result.weight_diff_unit))} {unitLabels[selectedUnit as keyof typeof unitLabels]} {diffLabel}
      </div>

      {/* Derived stats */}
      <div className="custom-result-stats-grid">
        <div className="custom-result-stat">
          <p className="custom-result-stat-label">Body Density</p>
          <p className="custom-result-stat-value">{formatSig(result.density_kg_m3)} <span>kg/m³</span></p>
        </div>
        <div className="custom-result-stat">
          <p className="custom-result-stat-label">Schwarzschild Radius</p>
          <p className="custom-result-stat-value">{formatSig(result.schwarzschild_r_m)} <span>m</span></p>
        </div>
        <div className="custom-result-stat">
          <p className="custom-result-stat-label">Escape Velocity</p>
          <p className="custom-result-stat-value">{formatSig(result.escape_velocity_ms / 1000)} <span>km/s</span></p>
        </div>
      </div>

      {/* Plausibility warnings (F-05) */}
      {nonBlockedWarnings.map(w => (
        <div key={w.id} className={`custom-warning custom-warning--${w.severity.toLowerCase()}`}>
          <span>{w.icon}</span>
          <p>{w.message}</p>
        </div>
      ))}
    </motion.div>
  );
}


// ─── Black Hole Blocked State ───────────────────────────────
function BlackHoleState({ warnings }: { warnings: PlausibilityWarning[] }) {
  const blocked = warnings.find(w => w.severity === 'BLOCKED');
  return (
    <motion.div
      className="custom-black-hole glass-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="custom-black-hole-icon"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        🕳️
      </motion.div>
      <h3 className="custom-black-hole-title">⛔ Black Hole</h3>
      <p className="custom-black-hole-text">{blocked?.message}</p>
      <p className="custom-black-hole-sub">
        The radius you entered is smaller than the Schwarzschild radius for this mass.
        No physical surface exists — escape velocity exceeds the speed of light.
      </p>
    </motion.div>
  );
}


// ─── Breakdown Step (F-04) ──────────────────────────────────
function BreakdownStep({ step }: { step: CalculationStep }) {
  return (
    <div className="custom-breakdown-step">
      <div className="custom-breakdown-step-num">{step.step}</div>
      <div className="custom-breakdown-step-content">
        <p className="custom-breakdown-step-label">{step.label}</p>
        <p className="custom-breakdown-step-formula">{step.formula}</p>
        <p className="custom-breakdown-step-sub">{step.substitution}</p>
        <p className="custom-breakdown-step-result">{step.result}</p>
      </div>
    </div>
  );
}


// ─── Compare Chart (F-08) ───────────────────────────────────
function CompareChart({ customG, customRatio, bodyName }: { customG: number; customRatio: number; bodyName: string }) {
  const allBodies = [
    ...COMPARE_BODIES,
    { name: bodyName, emoji: '🔬', g_ms2: customG, ratio: customRatio },
  ].sort((a, b) => a.g_ms2 - b.g_ms2);

  const maxG = Math.max(...allBodies.map(b => b.g_ms2));

  const barWidth = (g: number) => {
    if (maxG === 0) return 0;
    // Use log scale if range is extreme
    if (maxG / Math.min(...allBodies.map(b => b.g_ms2)) > 100) {
      const logMax = Math.log10(maxG + 1);
      const logVal = Math.log10(g + 1);
      return Math.max(3, (logVal / logMax) * 100);
    }
    return Math.max(3, (g / maxG) * 100);
  };

  return (
    <div className="custom-compare glass-card" id="custom-compare-section">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">📊</span>
        <h2 className="section-title">Compare Gravity</h2>
      </div>

      <div className="custom-compare-chart">
        {allBodies.map((body, i) => {
          const isCustom = body.name === bodyName;
          return (
            <div
              key={body.name}
              className={`custom-compare-row ${isCustom ? 'custom-compare-row--highlight' : ''}`}
            >
              <span className="custom-compare-label">
                {body.emoji} {body.name}
              </span>
              <div className="custom-compare-track">
                <motion.div
                  className="custom-compare-fill"
                  style={{
                    background: isCustom
                      ? 'linear-gradient(90deg, #b040ff, #d060ff)'
                      : 'linear-gradient(90deg, #4a90d9, #60b0ff)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth(body.g_ms2)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                />
              </div>
              <span className="custom-compare-value">
                {body.g_ms2 >= 1000 ? body.g_ms2.toExponential(1) : body.g_ms2.toFixed(2)} m/s²
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

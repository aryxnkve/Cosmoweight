import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatorStore } from '../store/calculatorStore';
import { calculateWeight, formatWeight, formatGravityMultiplier, unitLabels, generateShareUrl, validateWeightInput } from '../utils/calculations';
import { categoryLabels } from '../data/celestialBodies';

export default function WeightResult() {
  const { weightInput, selectedUnit, selectedBody, openBodyDetail } = useCalculatorStore();
  const [displayValue, setDisplayValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const prevValueRef = useRef(0);

  const validation = validateWeightInput(weightInput);
  const inputValue = parseFloat(weightInput);

  const result = useMemo(() => {
    if (!validation.valid) return null;
    return calculateWeight(inputValue, selectedUnit, selectedBody);
  }, [inputValue, selectedUnit, selectedBody, validation.valid]);

  // Animate count-up
  useEffect(() => {
    if (!result) {
      setDisplayValue(0);
      return;
    }

    const targetValue = result.weightInSelectedUnit;
    const startValue = prevValueRef.current;
    const duration = 600;
    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const current = startValue + (targetValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = targetValue;
      }
    }

    requestAnimationFrame(animate);
  }, [result]);

  const handleShare = async () => {
    if (!result) return;
    const url = generateShareUrl(inputValue, selectedUnit, selectedBody.id);
    const text = `I would weigh ${formatWeight(result.weightInSelectedUnit, selectedUnit)} ${unitLabels[selectedUnit]} on ${selectedBody.name}! ${selectedBody.emoji}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cosmic Weight Calculator', text, url });
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="result-card glass-card" data-mode="normal" id="weight-result-section">
        <div className="section-header">
          <span className="section-icon" aria-hidden="true">🎯</span>
          <h2 className="section-title">Your Cosmic Weight</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>🪐</p>
          <p>Enter your weight to see the result</p>
        </div>
      </div>
    );
  }

  const mode = result.displayMode;
  const isZeroG = mode === 'zero_g';
  const isNegative = mode === 'negative_weight';
  const isMicro = mode === 'microgravity';
  const isHeavy = mode === 'heavy';

  const massKg = selectedUnit === 'N' ? inputValue / 9.81 : inputValue * (selectedUnit === 'lbs' ? 0.453592 : selectedUnit === 'stone' ? 6.35029 : 1);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedBody.id}
        className="result-card glass-card"
        data-mode={mode}
        id="weight-result-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="result-body-header">
          <div className="result-planet" onClick={() => openBodyDetail(selectedBody)} style={{ cursor: 'pointer' }}>
            {selectedBody.imageUrl ? (
              <img
                src={selectedBody.imageUrl}
                alt={selectedBody.name}
                className="result-planet-sphere"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div
                className="result-planet-sphere"
                style={{ background: selectedBody.cssGradient }}
              />
            )}
            {!selectedBody.imageUrl && (
              <div
                className="result-planet-glow"
                style={{ background: selectedBody.cssGradient }}
              />
            )}
            {selectedBody.id === 'saturn' && !selectedBody.imageUrl && <div className="planet-ring" />}
          </div>
          <div>
            <h3
              className="result-body-name"
              style={{ cursor: 'pointer' }}
              onClick={() => openBodyDetail(selectedBody)}
            >
              {selectedBody.emoji} {selectedBody.name}
            </h3>
            <p className="result-body-category">{categoryLabels[selectedBody.category]}</p>
          </div>
        </div>

        {/* Negative badge */}
        {isNegative && (
          <div className="negative-badge">
            ⚠️ Theoretical — Negative Gravity
          </div>
        )}

        {/* Weight display */}
        {isZeroG ? (
          <div className="zero-g-display">
            <motion.div
              className="zero-g-emoji"
              animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🧑‍🚀
            </motion.div>
            <p className="zero-g-text">0 {unitLabels[selectedUnit]} — You are weightless! 🌌</p>
            <div className="mass-explainer">
              <p className="mass-explainer-title">
                <span>💡</span> Mass vs. Weight
              </p>
              <p className="mass-explainer-text">
                Your mass is still <strong>{massKg.toFixed(1)} kg</strong> — only your <em>apparent weight</em> is zero.
                Mass is the amount of matter in your body and never changes. Weight is the force of gravity pulling on your mass.
              </p>
            </div>
          </div>
        ) : (
          <div className="result-weight-display">
            <motion.p
              className="result-weight-value"
              key={`${selectedBody.id}-${inputValue}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {formatWeight(displayValue, selectedUnit)}
              <span className="result-weight-unit">{unitLabels[selectedUnit]}</span>
            </motion.p>
            {selectedUnit !== 'kg' && (
              <p className="result-weight-secondary">
                ≈ {formatWeight(result.weightInKg, 'kg')} kg
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="result-stats">
          <div className="result-stat">
            <p className="result-stat-label">Gravity Multiplier</p>
            <p className="result-stat-value">{formatGravityMultiplier(result.gravityMultiplier)} Earth</p>
          </div>
          <div className="result-stat">
            <p className="result-stat-label">Surface Gravity</p>
            <p className="result-stat-value">{result.surfaceGravityMs2.toFixed(2)} m/s²</p>
          </div>
        </div>

        {/* Jump height for light/micro bodies */}
        {(mode === 'light' || isMicro) && result.jumpHeight && result.jumpHeight < 100000 && (
          <div className="mass-explainer" style={{ marginTop: '16px', borderColor: 'rgba(64, 216, 192, 0.2)', background: 'rgba(64, 216, 192, 0.06)' }}>
            <p className="mass-explainer-title" style={{ color: 'var(--state-light)' }}>
              <span>🦘</span> Jump Height
            </p>
            <p className="mass-explainer-text">
              You could jump approximately <strong>{result.jumpHeight > 10 ? result.jumpHeight.toFixed(0) : result.jumpHeight.toFixed(1)} meters</strong> high here!
              {result.jumpHeight > 100 && ' That\'s higher than a skyscraper!'}
            </p>
          </div>
        )}

        {/* Escape velocity context */}
        {result.escapeVelocityContext && (
          <div className="mass-explainer" style={{ marginTop: '12px', borderColor: 'rgba(96, 176, 255, 0.2)', background: 'rgba(96, 176, 255, 0.06)' }}>
            <p className="mass-explainer-title" style={{ color: 'var(--state-normal)' }}>
              <span>🚀</span> Escape Velocity
            </p>
            <p className="mass-explainer-text">{result.escapeVelocityContext}</p>
          </div>
        )}

        {/* Heavy body warning */}
        {isHeavy && result.gravityMultiplier > 5 && (
          <div className="heavy-warning">
            <span>⚠️</span>
            <p className="heavy-warning-text">
              At {formatGravityMultiplier(result.gravityMultiplier)} Earth gravity, the crushing force would make it impossible for a human to stand or even breathe.
            </p>
          </div>
        )}

        {/* Gravity note */}
        {selectedBody.gravityNote && (
          <p className="gravity-note">ℹ️ {selectedBody.gravityNote}</p>
        )}

        {/* Disclaimer */}
        {selectedBody.disclaimer && (
          <div className="disclaimer-banner">
            <p className="disclaimer-text">⚠️ {selectedBody.disclaimer}</p>
          </div>
        )}

        {/* Share */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
          <button
            id="share-btn"
            className={`share-btn ${copied ? 'copied' : ''}`}
            onClick={handleShare}
            aria-label="Share your cosmic weight"
          >
            {copied ? '✅ Copied!' : '📤 Share Result'}
          </button>
          <button
            className="share-btn"
            onClick={() => openBodyDetail(selectedBody)}
            aria-label={`Learn more about ${selectedBody.name}`}
          >
            🔍 Learn More
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

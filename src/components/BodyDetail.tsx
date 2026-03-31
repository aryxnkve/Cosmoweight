import { useCalculatorStore } from '../store/calculatorStore';
import { categoryLabels, celestialBodies } from '../data/celestialBodies';
import { formatGravityMultiplier, formatDistance, formatTemperature } from '../utils/calculations';
import type { CelestialBody } from '../data/types';

export default function FunFact() {
  const { selectedBody } = useCalculatorStore();

  return (
    <div className="fun-fact-card glass-card" id="fun-fact-section">
      <div className="section-header">
        <span className="section-icon" aria-hidden="true">💡</span>
        <h2 className="section-title">Did You Know?</h2>
      </div>
      <p className="fun-fact-text">{selectedBody.funFact}</p>
    </div>
  );
}

// ─── Body Detail View ───
export function BodyDetail() {
  const { detailBody, setDetailBody } = useCalculatorStore();

  if (!detailBody) {
    return (
      <div className="explore-view">
        <ExplorePlaceholder />
      </div>
    );
  }

  return (
    <div className="explore-view">
      <button
        className="share-btn"
        onClick={() => { setDetailBody(null); }}
        style={{ marginBottom: '20px' }}
      >
        ← Back to list
      </button>

      <div className="body-detail-card glass-card" id="body-detail-section">
        <div className="body-detail-hero">
          <div className="body-detail-planet">
            {detailBody.imageUrl ? (
              <img
                src={detailBody.imageUrl}
                alt={detailBody.name}
                className="body-detail-planet-sphere"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div
                className="body-detail-planet-sphere"
                style={{ background: detailBody.cssGradient }}
              />
            )}
            {!detailBody.imageUrl && (
              <div
                className="body-detail-planet-glow"
                style={{ background: detailBody.cssGradient }}
              />
            )}
            {detailBody.id === 'saturn' && !detailBody.imageUrl && <div className="planet-ring" style={{ width: '150%', height: '150%' }} />}
          </div>

          <div className="body-detail-info">
            <h2 className="body-detail-name">{detailBody.emoji} {detailBody.name}</h2>
            <p className="body-detail-category-label">{categoryLabels[detailBody.category]}</p>
            <p className="body-detail-fun-fact">{detailBody.funFact}</p>
          </div>
        </div>

        <div className="body-detail-stats">
          <DetailStat label="Surface Gravity" value={detailBody.surfaceGravityMs2.toFixed(2)} unit="m/s²" />
          <DetailStat label="vs Earth" value={formatGravityMultiplier(detailBody.gravityMultiplier)} unit="Earth gravity" />
          {detailBody.escapeVelocityKmS && (
            <DetailStat label="Escape Velocity" value={detailBody.escapeVelocityKmS.toFixed(2)} unit="km/s" />
          )}
          {detailBody.distanceFromEarthKmAvg !== null && (
            <DetailStat label="Distance from Earth" value={formatDistance(detailBody.distanceFromEarthKmAvg)} unit="" />
          )}
          {detailBody.avgTempC !== null && (
            <DetailStat label="Avg Temperature" value={formatTemperature(detailBody.avgTempC)} unit="" />
          )}
          {detailBody.radiusKm && (
            <DetailStat label="Radius" value={detailBody.radiusKm.toLocaleString()} unit="km" />
          )}
          {detailBody.massKg && (
            <DetailStat label="Mass" value={detailBody.massKg.toExponential(2)} unit="kg" />
          )}
        </div>

        {detailBody.gravityNote && (
          <div className="mass-explainer" style={{ marginBottom: '16px' }}>
            <p className="mass-explainer-title"><span>ℹ️</span> Note</p>
            <p className="mass-explainer-text">{detailBody.gravityNote}</p>
          </div>
        )}

        {detailBody.disclaimer && (
          <div className="disclaimer-banner" style={{ marginTop: 0, marginBottom: '16px' }}>
            <p className="disclaimer-text">⚠️ {detailBody.disclaimer}</p>
          </div>
        )}

        <a
          href={detailBody.wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="body-detail-link"
        >
          📖 Read more on Wikipedia →
        </a>
      </div>
    </div>
  );
}

function DetailStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="body-detail-stat">
      <p className="body-detail-stat-label">{label}</p>
      <p className="body-detail-stat-value">
        {value}
        {unit && <span className="body-detail-stat-unit"> {unit}</span>}
      </p>
    </div>
  );
}

function ExplorePlaceholder() {
  const quickPicks: { id: string; name: string; emoji: string }[] = [
    { id: 'jupiter', name: 'Jupiter', emoji: '♃' },
    { id: 'moon', name: 'The Moon', emoji: '🌙' },
    { id: 'neutron_star', name: 'Neutron Star', emoji: '💀' },
    { id: 'iss_orbit', name: 'ISS Orbit', emoji: '🛸' },
  ];

  const handleQuickPick = (id: string) => {
    const body = celestialBodies.find((cb: CelestialBody) => cb.id === id);
    if (body) {
      useCalculatorStore.getState().openBodyDetail(body);
    }
  };

  return (
    <div className="explore-placeholder">
      <span className="explore-placeholder-icon">🔭</span>
      <p className="explore-placeholder-text">Explore the Cosmos</p>
      <p className="explore-placeholder-sub">
        Select a celestial body from the Calculator or Compare view to explore its details,
        or pick one below to get started.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
        {quickPicks.map((b) => (
          <button
            key={b.id}
            className="share-btn"
            onClick={() => handleQuickPick(b.id)}
          >
            {b.emoji} {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}

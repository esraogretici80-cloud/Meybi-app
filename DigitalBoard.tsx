/**
 * Basit dijital tahta — konuya göre SVG gösterimi.
 * İlk sürüm: önceden tanımlı görseller. İleride Canvas çizim eklenebilir.
 */

interface Props {
  hint?: string
  topicId?: string
  title?: string
}

export default function DigitalBoard({ hint, topicId, title }: Props) {
  const id = topicId || hint || 'generic'

  return (
    <div className="board" role="img" aria-label={title || 'Dijital tahta'}>
      {id.includes('güneş') || id.includes('gunes') || id.includes('ay') || id === 'fen5-gunes-dunya-ay' ? (
        <SolarSystemSVG />
      ) : id.includes('kesir') || id.includes('mat5-kesirler') ? (
        <FractionSVG />
      ) : id.includes('hucre') || id.includes('hücre') || id === 'fen7-hucre' ? (
        <CellSVG />
      ) : id.includes('kuvvet') || id.includes('force') ? (
        <ForceSVG />
      ) : id.includes('cumle') || id.includes('cümle') || id.includes('tur') ? (
        <SentenceSVG />
      ) : (
        <GenericBoardSVG title={title} />
      )}
    </div>
  )
}

function SolarSystemSVG() {
  return (
    <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="80" r="28" fill="#fbbf24" />
      <text x="60" y="85" textAnchor="middle" fill="#1a1a2e" fontSize="11" fontWeight="700">Güneş</text>
      <circle cx="160" cy="80" r="16" fill="#3b82f6" />
      <text x="160" y="85" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Dünya</text>
      <circle cx="210" cy="55" r="8" fill="#94a3b8" />
      <text x="210" y="42" textAnchor="middle" fill="#cbd5e1" fontSize="10">Ay</text>
      <ellipse cx="160" cy="80" rx="100" ry="40" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 3" />
      <text x="160" y="150" textAnchor="middle" fill="#a78bfa" fontSize="11">Güneş – Dünya – Ay (basitleştirilmiş)</text>
    </svg>
  )
}

function FractionSVG() {
  return (
    <svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="120" height="60" rx="4" fill="#312e81" stroke="#a78bfa" strokeWidth="2" />
      <line x1="50" y1="30" x2="50" y2="90" stroke="#a78bfa" strokeWidth="2" />
      <line x1="80" y1="30" x2="80" y2="90" stroke="#a78bfa" strokeWidth="2" />
      <line x1="110" y1="30" x2="110" y2="90" stroke="#a78bfa" strokeWidth="2" />
      <rect x="20" y="30" width="30" height="60" fill="#7c3aed" opacity="0.8" />
      <text x="80" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="13">1 / 4</text>
      <text x="220" y="55" fill="#a78bfa" fontSize="28" fontWeight="700">1</text>
      <line x1="200" y1="70" x2="240" y2="70" stroke="#e2e8f0" strokeWidth="3" />
      <text x="220" y="100" fill="#a78bfa" fontSize="28" fontWeight="700">4</text>
    </svg>
  )
}

function CellSVG() {
  return (
    <svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="80" rx="110" ry="60" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="160" cy="80" r="22" fill="#7c3aed" />
      <text x="160" y="84" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Çekirdek</text>
      <circle cx="100" cy="60" r="10" fill="#22c55e" opacity="0.8" />
      <text x="100" y="45" textAnchor="middle" fill="#86efac" fontSize="9">Mitokondri</text>
      <circle cx="220" cy="95" r="8" fill="#f59e0b" opacity="0.8" />
      <text x="220" y="115" textAnchor="middle" fill="#fcd34d" fontSize="9">Ribozom</text>
      <text x="160" y="155" textAnchor="middle" fill="#94a3b8" fontSize="11">Hayvan hücresi (şematik)</text>
    </svg>
  )
}

function ForceSVG() {
  return (
    <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="50" width="60" height="40" rx="4" fill="#6366f1" />
      <text x="70" y="75" textAnchor="middle" fill="white" fontSize="12">Kütle</text>
      <line x1="110" y1="70" x2="200" y2="70" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
        </marker>
      </defs>
      <text x="155" y="55" textAnchor="middle" fill="#fbbf24" fontSize="12">F (Kuvvet)</text>
      <text x="160" y="110" textAnchor="middle" fill="#94a3b8" fontSize="11">Kuvvet okla gösterilir</text>
    </svg>
  )
}

function SentenceSVG() {
  return (
    <svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="25" width="70" height="36" rx="6" fill="#7c3aed" />
      <text x="45" y="48" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Özne</text>
      <rect x="90" y="25" width="80" height="36" rx="6" fill="#2563eb" />
      <text x="130" y="48" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Yüklem</text>
      <rect x="180" y="25" width="70" height="36" rx="6" fill="#059669" />
      <text x="215" y="48" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Nesne</text>
      <rect x="260" y="25" width="50" height="36" rx="6" fill="#d97706" />
      <text x="285" y="48" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Zarf</text>
      <text x="160" y="85" textAnchor="middle" fill="#94a3b8" fontSize="11">Cümle öğeleri</text>
    </svg>
  )
}

function GenericBoardSVG({ title }: { title?: string }) {
  return (
    <svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="280" height="50" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 4" />
      <text x="160" y="50" textAnchor="middle" fill="#a78bfa" fontSize="14">
        {title ? title.slice(0, 28) : 'Konu tahtası'}
      </text>
      <text x="160" y="90" textAnchor="middle" fill="#64748b" fontSize="11">
        Görsel anlatım bu konu için hazırlanıyor
      </text>
    </svg>
  )
}

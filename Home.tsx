import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GRADES, SUBJECTS, getTopics } from '../data/curriculum'
import { useProgress } from '../hooks/useProgress'

export default function Home() {
  const navigate = useNavigate()
  const { entries, todayCount, dailyGoal } = useProgress()

  const [grade, setGrade] = useState<number | null>(null)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [mode, setMode] = useState<'kitapsiz' | 'kitapli'>('kitapsiz')
  const [level, setLevel] = useState<'basit' | 'orta' | 'ileri'>('orta')

  const topics = grade && subjectId ? getTopics(grade, subjectId) : []
  const recent = entries.slice(0, 3)

  const canStart = grade && subjectId && topicId

  const startLesson = () => {
    if (!canStart) return
    const params = new URLSearchParams({
      grade: String(grade),
      subject: subjectId!,
      topic: topicId!,
      mode,
      level
    })
    navigate(`/lesson?${params.toString()}`)
  }

  return (
    <div>
      {/* Logo & karşılama */}
      <header className="mb-3 text-center">
        <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🎓</div>
        <h1 style={{ color: 'var(--accent-light)', letterSpacing: '-0.02em' }}>MEYBI</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: 4 }}>
          Kitabın olsun ya da olmasın, öğrenmenin bir yolu var.
        </p>
      </header>

      {/* Günlük hedef */}
      <div className="card mb-2">
        <div className="flex-between">
          <span className="card-title" style={{ margin: 0 }}>Günlük hedef</span>
          <span className="badge">{todayCount} / {dailyGoal}</span>
        </div>
        <div className="progress-bar mt-1">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Sınıf seçimi */}
      <div className="card mb-2">
        <div className="card-title">1. Sınıfını seç</div>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {GRADES.map(g => (
            <button
              key={g}
              className={`btn ${grade === g ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => {
                setGrade(g)
                setSubjectId(null)
                setTopicId(null)
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Ders seçimi */}
      {grade && (
        <div className="card mb-2">
          <div className="card-title">2. Dersini seç</div>
          <div className="grid-2">
            {SUBJECTS.filter(s => (s.topics[grade]?.length || 0) > 0).map(s => (
              <button
                key={s.id}
                className={`btn ${subjectId === s.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => {
                  setSubjectId(s.id)
                  setTopicId(null)
                }}
              >
                <span>{s.icon}</span> {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Konu seçimi */}
      {subjectId && topics.length > 0 && (
        <div className="card mb-2">
          <div className="card-title">3. Konuyu seç</div>
          {topics.map(t => (
            <button
              key={t.id}
              className={`option-btn ${topicId === t.id ? 'correct' : ''}`}
              onClick={() => setTopicId(t.id)}
              style={{ marginBottom: 8 }}
            >
              <strong>{t.title}</strong>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t.unit}</div>
            </button>
          ))}
        </div>
      )}

      {/* Mod & seviye */}
      {topicId && (
        <div className="card mb-2">
          <div className="card-title">4. Çalışma ayarları</div>
          <div className="mb-1">
            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Mod</label>
            <div className="grid-2 mt-1">
              <button
                className={`btn ${mode === 'kitapsiz' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setMode('kitapsiz')}
              >
                Kitapsız
              </button>
              <button
                className={`btn ${mode === 'kitapli' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setMode('kitapli')}
              >
                Kitaplı
              </button>
            </div>
            {mode === 'kitapli' && (
              <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                Kitaplı mod MVP’de sınırlıdır. PDF yükleme ve analiz için Worker + Storage gerekir.
                Şimdilik kitapsız anlatım kullanılır; kitap bilgisi bağlama eklenebilir.
              </p>
            )}
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Anlatım seviyesi</label>
            <div className="grid-3 mt-1">
              {(['basit', 'orta', 'ileri'] as const).map(l => (
                <button
                  key={l}
                  className={`btn ${level === l ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setLevel(l)}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Başlat */}
      {canStart && (
        <button className="btn btn-primary btn-block mb-3" onClick={startLesson}>
          🚀 Derse başla
        </button>
      )}

      {/* Son öğrenilenler */}
      {recent.length > 0 && (
        <div className="card mb-2">
          <div className="card-title">Son öğrenilen konular</div>
          {recent.map((e, i) => (
            <div key={i} className="flex-between" style={{ padding: '8px 0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.topicTitle}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {e.grade}. sınıf · {e.subject}
                </div>
              </div>
              {e.score !== undefined && (
                <span className="badge">{e.score}/{e.totalQuestions}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

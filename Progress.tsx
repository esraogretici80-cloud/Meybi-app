import { useProgress } from '../hooks/useProgress'
import { useNavigate } from 'react-router-dom'

export default function Progress() {
  const { entries, dailyGoal, setDailyGoal, todayCount } = useProgress()
  const navigate = useNavigate()

  const bySubject: Record<string, number> = {}
  entries.forEach(e => {
    bySubject[e.subject] = (bySubject[e.subject] || 0) + 1
  })

  return (
    <div>
      <h1 className="mb-2">İlerleme</h1>

      <div className="card mb-2">
        <div className="card-title">Günlük hedef</div>
        <div className="flex-between mb-1">
          <span>{todayCount} / {dailyGoal} ders</span>
          <select
            className="select"
            style={{ width: 80, minHeight: 36, padding: '4px 8px' }}
            value={dailyGoal}
            onChange={e => setDailyGoal(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }}
          />
        </div>
      </div>

      <div className="card mb-2">
        <div className="card-title">Toplam tamamlanan</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-light)' }}>
          {entries.length}
        </div>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>ders kaydı (cihazda saklanır)</p>
      </div>

      {Object.keys(bySubject).length > 0 && (
        <div className="card mb-2">
          <div className="card-title">Derslere göre</div>
          {Object.entries(bySubject).map(([subj, count]) => (
            <div key={subj} className="flex-between" style={{ padding: '6px 0' }}>
              <span>{subj}</span>
              <span className="badge">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card mb-2">
        <div className="card-title">Geçmiş</div>
        {entries.length === 0 ? (
          <p className="text-muted">Henüz ders tamamlanmadı.</p>
        ) : (
          entries.slice(0, 20).map((e, i) => (
            <div
              key={i}
              style={{
                padding: '10px 0',
                borderBottom: i < Math.min(entries.length, 20) - 1 ? '1px solid var(--border)' : 'none'
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.topicTitle}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                {e.grade}. sınıf · {e.subject} ·{' '}
                {new Date(e.completedAt).toLocaleDateString('tr-TR')}
                {e.score !== undefined && ` · ${e.score}/${e.totalQuestions} doğru`}
              </div>
            </div>
          ))
        )}
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate('/')}>
        Yeni derse başla
      </button>

      <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
        Not: İlerleme şu an yalnızca bu cihazın localStorage’ında tutuluyor.
        Firebase Auth + Firestore yapılandırıldığında hesaba bağlanabilir.
      </p>
    </div>
  )
}

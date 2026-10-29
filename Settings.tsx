import { useTheme } from '../hooks/useTheme'
import { isTTSAvailable, getVoicesInfo } from '../services/tts'

export default function Settings() {
  const { theme, toggle } = useTheme()

  return (
    <div>
      <h1 className="mb-2">Ayarlar</h1>

      <div className="card mb-2">
        <div className="card-title">Görünüm</div>
        <div className="flex-between">
          <span>Tema</span>
          <button className="btn btn-secondary btn-sm" onClick={toggle}>
            {theme === 'dark' ? '🌙 Koyu' : '☀️ Açık'}
          </button>
        </div>
      </div>

      <div className="card mb-2">
        <div className="card-title">Seslendirme</div>
        <p style={{ fontSize: '0.9rem' }}>
          {isTTSAvailable()
            ? getVoicesInfo()
            : 'Bu tarayıcı sesli okumayı desteklemiyor.'}
        </p>
        <p className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
          Ses, cihazının / tarayıcının yerleşik Türkçe sesidir (Web Speech API).
          Harici TTS servisi (Google Cloud vb.) henüz bağlı değildir.
        </p>
      </div>

      <div className="card mb-2">
        <div className="card-title">Hesap</div>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Google ile giriş (Firebase Authentication) henüz aktif değil.
          Yapılandırma adımları README’de anlatılmıştır.
        </p>
        <button className="btn btn-secondary btn-block mt-1" disabled>
          Google ile giriş (yakında)
        </button>
      </div>

      <div className="card mb-2">
        <div className="card-title">Hakkında</div>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>MEYBI</strong> v0.1.0 — MVP
        </p>
        <p className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
          Ortaokul (5–8) öğrencileri için kişisel yapay zekâ öğretmeni.
          Slogan: “Kitabın olsun ya da olmasın, öğrenmenin bir yolu var.”
        </p>
      </div>

      <div className="card">
        <div className="card-title">Bilinen sınırlamalar (MVP)</div>
        <ul className="text-muted" style={{ fontSize: '0.85rem', paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Gerçek AI için Cloudflare Worker + Gemini API anahtarı gerekir</li>
          <li>Kitaplı mod / PDF analizi tam çalışmaz</li>
          <li>İlerleme yalnızca cihazda saklanır</li>
          <li>Firebase Auth henüz bağlı değil</li>
          <li>Müfredat yalnızca örnek konular içerir</li>
          <li>Dijital tahta basit SVG’lerle sınırlıdır</li>
        </ul>
      </div>
    </div>
  )
}

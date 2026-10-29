/**
 * AI servis katmanı.
 * Gerçek istekler Cloudflare Worker üzerinden gider.
 * API anahtarı asla istemciye gelmez.
 */

export interface LessonSection {
  type: 'intro' | 'explain' | 'example' | 'visual' | 'question' | 'summary' | 'quiz'
  title?: string
  content: string
  visualHint?: string
  question?: {
    text: string
    options?: string[]
    correctIndex?: number
    correctAnswer?: string
    explanation: string
  }
}

export interface LessonPlan {
  topicTitle: string
  grade: number
  subject: string
  sections: LessonSection[]
  sourcesNote: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function generateLessonPlan(params: {
  grade: number
  subject: string
  topicTitle: string
  goals: string[]
  mode: 'kitapsiz' | 'kitapli'
  bookContext?: string
  level?: 'basit' | 'orta' | 'ileri'
}): Promise<LessonPlan> {
  const res = await fetch(`${API_BASE}/lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sunucu hatası' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export async function evaluateAnswer(params: {
  question: string
  studentAnswer: string
  correctAnswer: string
  explanation?: string
}): Promise<{ correct: boolean; feedback: string }> {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })

  if (!res.ok) {
    // Fallback local evaluation for short answers
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
    const correct = norm(params.studentAnswer) === norm(params.correctAnswer)
    return {
      correct,
      feedback: correct
        ? 'Doğru! Aferin.'
        : `Bu cevap tam olarak doğru değil. Doğru cevap: ${params.correctAnswer}`
    }
  }

  return res.json()
}

/**
 * Geliştirme / demo için yerel yedek plan.
 * Gerçek AI bağlantısı yoksa veya hata olursa kullanılır.
 * Kullanıcıya "örnek içerik" olduğu açıkça belirtilir.
 */
export function getFallbackLessonPlan(params: {
  grade: number
  subject: string
  topicTitle: string
  goals: string[]
}): LessonPlan {
  const { grade, subject, topicTitle, goals } = params

  return {
    topicTitle,
    grade,
    subject,
    sourcesNote:
      'Bu içerik örnek (fallback) anlatımdır. Gerçek yapay zekâ bağlantısı kurulduğunda güncel ve kişiselleştirilmiş anlatım üretilir. Resmi müfredata birebir uyum iddiası yoktur.',
    sections: [
      {
        type: 'intro',
        title: 'Bugün ne öğreneceğiz?',
        content: `Merhaba! Bugün ${grade}. sınıf ${subject} dersinde **${topicTitle}** konusunu birlikte işleyeceğiz.\n\nHedeflerimiz:\n${goals.map(g => `• ${g}`).join('\n')}\n\nHazırsan başlayalım!`
      },
      {
        type: 'explain',
        title: 'Temel anlatım',
        content: `**${topicTitle}** konusunun temel fikri şudur: Bu konuyu günlük hayattan örneklerle ve adım adım açıklayacağız.\n\nÖnce kavramı basitçe tanıyacağız, sonra örnek çözeceğiz ve senin de denemeni isteyeceğiz.`
      },
      {
        type: 'example',
        title: 'Günlük hayattan örnek',
        content: `Düşün ki elinde bir pizza var ve onu 4 eşit dilime ayırdın. Her dilim pizza'nın 1/4'üdür. İşte kesirler (veya benzer konular) böyle ortaya çıkar — bütünün parçaları.\n\nSenin çevrende de benzer örnekler var. Öğretmeninle birlikte düşünelim.`
      },
      {
        type: 'visual',
        title: 'Görsel anlatım',
        content: 'Aşağıdaki tahtada konuyu görsel olarak takip edebilirsin.',
        visualHint: 'generic'
      },
      {
        type: 'question',
        title: 'Kontrol sorusu',
        content: 'Şimdi kısa bir kontrol sorusu:',
        question: {
          text: `"${topicTitle}" konusuyla ilgili en temel fikir nedir?`,
          options: [
            'Konuyu ezberlemek yeterlidir',
            'Temel kavramı anlayıp örneklerle pekiştirmektir',
            'Sadece formül ezberlemektir',
            'Hiçbiri'
          ],
          correctIndex: 1,
          explanation: 'Doğru yaklaşım: Temel kavramı anlamak ve örneklerle pekiştirmektir. Ezber tek başına yeterli değildir.'
        }
      },
      {
        type: 'summary',
        title: 'Özet',
        content: `Bugün **${topicTitle}** konusunu işledik.\n\n• Temel kavramı gördük\n• Örnek inceledik\n• Kontrol sorusu çözdük\n\nEksik hissettiğin yer olursa tekrar edebilirsin.`
      },
      {
        type: 'quiz',
        title: 'Mini sınav',
        content: 'Son bir soru daha:',
        question: {
          text: 'Bu derste en önemli şey neydi?',
          options: [
            'Hızlıca bitirmek',
            'Anlamak ve uygulamak',
            'Sadece dinlemek',
            'Not almamak'
          ],
          correctIndex: 1,
          explanation: 'Anlamak ve uygulamak en önemlisidir. Aferin!'
        }
      }
    ]
  }
}

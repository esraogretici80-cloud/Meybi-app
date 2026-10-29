/**
 * MEYBI AI Proxy — Cloudflare Worker
 *
 * API anahtarı yalnızca burada (env) tutulur. İstemciye asla gönderilmez.
 * Model adı env'den okunur: GEMINI_MODEL (varsayılan: gemini-3.5-flash-lite)
 *
 * Deploy:
 *   cd functions
 *   npx wrangler secret put GEMINI_API_KEY
 *   npx wrangler deploy
 */

export interface Env {
  GEMINI_API_KEY: string
  GEMINI_MODEL?: string
  ALLOWED_ORIGIN?: string
}

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'

// Basit in-memory rate limit (Worker isolate başına; üretimde KV/Durable Object önerilir)
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 15 // istek / dakika / IP
const RATE_WINDOW = 60_000

function getClientIp(req: Request): string {
  return req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown'
}

function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function corsHeaders(origin: string | null, allowed?: string): HeadersInit {
  const o = allowed || origin || '*'
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
}

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  })
}

const TEACHER_SYSTEM = `Sen MEYBI adında deneyimli bir Türk ortaokul öğretmenisin.
Öğrencilere (5-8. sınıf) doğal, yaşa uygun, samimi ve anlaşılır Türkçe ile anlatım yaparsın.

Kurallar:
- Kuru ansiklopedi metni yazma. Gerçek bir öğretmen gibi konuş.
- Önce temel fikir, sonra ayrıntı.
- Günlük hayattan örnekler ver.
- Önemli noktaları **kalın** yaz.
- Konuyu küçük bölümlere ayır.
- Aşağılayıcı dil kullanma.
- Resmi MEB müfredatına birebir uyum iddiasında bulunma; genel ortaokul seviyesinde doğru ve yararlı anlatım yap.
- Yanıtını SADECE geçerli JSON olarak ver, başka metin ekleme.`

function buildLessonPrompt(body: {
  grade: number
  subject: string
  topicTitle: string
  goals: string[]
  mode: string
  level?: string
  bookContext?: string
}): string {
  return `Aşağıdaki konu için yapılandırılmış bir ders planı üret.

Sınıf: ${body.grade}
Ders: ${body.subject}
Konu: ${body.topicTitle}
Hedefler: ${body.goals.join('; ')}
Mod: ${body.mode}
Anlatım seviyesi: ${body.level || 'orta'}
${body.bookContext ? `Kitap bağlamı (varsa kullan):\n${body.bookContext.slice(0, 3000)}` : ''}

JSON şeması (tam olarak bu yapıda döndür):
{
  "topicTitle": "string",
  "grade": number,
  "subject": "string",
  "sourcesNote": "Kısa kaynak/uyarı notu",
  "sections": [
    {
      "type": "intro" | "explain" | "example" | "visual" | "question" | "summary" | "quiz",
      "title": "string",
      "content": "Markdown destekli Türkçe metin",
      "visualHint": "opsiyonel kısa ipucu (örn. kesir, güneş, hücre)",
      "question": {
        "text": "soru metni",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "açıklama"
      }
    }
  ]
}

En az 6, en fazla 9 bölüm üret. Sıra önerisi:
1. intro (hedefler)
2. explain (temel anlatım)
3. example (günlük hayat)
4. visual (görsel ipucu)
5. question (kontrol sorusu)
6. explain veya example (derinleştirme)
7. question veya quiz
8. summary
9. quiz (mini sınav)

Her question bölümünde options (4 şık) ve correctIndex zorunlu.`
}

async function callGemini(
  env: Env,
  system: string,
  user: string
): Promise<string> {
  const key = env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY tanımlı değil')

  const model = env.GEMINI_MODEL || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${system}\n\n---\n\n${user}` }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json'
      }
    })
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini error', res.status, errText)
    throw new Error(`Gemini API hatası: ${res.status}`)
  }

  const data = await res.json() as any
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini boş yanıt döndü')
  return text
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    const ip = getClientIp(request)
    if (!checkRate(ip)) {
      return json({ error: 'Çok fazla istek. Lütfen bir dakika sonra tekrar dene.' }, 429, headers)
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '')

    try {
      if (path.endsWith('/lesson') && request.method === 'POST') {
        const body = await request.json() as any
        if (!body.grade || !body.subject || !body.topicTitle) {
          return json({ error: 'Eksik parametre: grade, subject, topicTitle gerekli' }, 400, headers)
        }

        const raw = await callGemini(env, TEACHER_SYSTEM, buildLessonPrompt(body))
        let plan: any
        try {
          plan = JSON.parse(raw)
        } catch {
          // Bazen model JSON dışı metin ekler; ilk { } bloğunu dene
          const match = raw.match(/\{[\s\S]*\}/)
          if (match) plan = JSON.parse(match[0])
          else throw new Error('JSON ayrıştırılamadı')
        }

        if (!plan.sections || !Array.isArray(plan.sections)) {
          throw new Error('Geçersiz plan yapısı')
        }

        return json(plan, 200, headers)
      }

      if (path.endsWith('/evaluate') && request.method === 'POST') {
        const body = await request.json() as any
        const prompt = `Öğrenci sorusunu değerlendir.
Soru: ${body.question}
Doğru cevap: ${body.correctAnswer}
Öğrenci cevabı: ${body.studentAnswer}
${body.explanation ? `İpucu: ${body.explanation}` : ''}

JSON döndür: { "correct": boolean, "feedback": "Türkçe, nazik ve öğretici geri bildirim" }`

        const raw = await callGemini(
          env,
          'Sen nazik bir ortaokul öğretmenisin. Kısa JSON yanıt ver.',
          prompt
        )
        let result: any
        try {
          result = JSON.parse(raw)
        } catch {
          const m = raw.match(/\{[\s\S]*\}/)
          result = m ? JSON.parse(m[0]) : { correct: false, feedback: raw }
        }
        return json(result, 200, headers)
      }

      if (path.endsWith('/health') || path === '' || path === '/') {
        return json({
          ok: true,
          service: 'meybi-ai-proxy',
          model: env.GEMINI_MODEL || DEFAULT_MODEL,
          hasKey: !!env.GEMINI_API_KEY
        }, 200, headers)
      }

      return json({ error: 'Not found' }, 404, headers)
    } catch (e: any) {
      console.error(e)
      return json({ error: e.message || 'Sunucu hatası' }, 500, headers)
    }
  }
}

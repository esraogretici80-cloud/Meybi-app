/**
 * Türkçe TTS servisi.
 * Birincil: Tarayıcı SpeechSynthesis API (ücretsiz, cihaz sesi).
 * Harici TTS servisi (Google Cloud TTS vb.) eklenebilir; şu an aktif değil.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null
let preferredVoice: SpeechSynthesisVoice | null = null

function pickTurkishVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  // Tercih sırası: tr-TR, tr, sonra herhangi bir Türkçe içeren
  const tr =
    voices.find(v => v.lang === 'tr-TR') ||
    voices.find(v => v.lang.startsWith('tr')) ||
    voices.find(v => v.lang.toLowerCase().includes('turk'))
  return tr || null
}

export function initTTS(): void {
  if (!window.speechSynthesis) return
  preferredVoice = pickTurkishVoice()
  // Bazı tarayıcılarda voices asenkron yüklenir
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickTurkishVoice()
  }
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(
  text: string,
  options: { rate?: number; onEnd?: () => void; onError?: () => void } = {}
): void {
  if (!isTTSAvailable()) {
    options.onError?.()
    return
  }

  stop()

  // Markdown benzeri işaretleri temizle
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/•/g, '')
    .replace(/\n+/g, '. ')
    .trim()

  if (!clean) return

  const u = new SpeechSynthesisUtterance(clean)
  u.lang = 'tr-TR'
  u.rate = options.rate ?? 0.95
  u.pitch = 1
  if (preferredVoice) u.voice = preferredVoice

  u.onend = () => {
    currentUtterance = null
    options.onEnd?.()
  }
  u.onerror = () => {
    currentUtterance = null
    options.onError?.()
  }

  currentUtterance = u
  window.speechSynthesis.speak(u)
}

export function pause(): void {
  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.pause()
  }
}

export function resume(): void {
  if (window.speechSynthesis?.paused) {
    window.speechSynthesis.resume()
  }
}

export function stop(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return !!window.speechSynthesis?.speaking
}

export function getVoicesInfo(): string {
  if (!isTTSAvailable()) return 'Tarayıcı TTS desteklemiyor.'
  const v = preferredVoice
  if (!v) return 'Türkçe ses bulunamadı. Cihazın varsayılan sesi kullanılacak.'
  return `Kullanılan ses: ${v.name} (${v.lang}) — tarayıcı / cihaz sesi`
}

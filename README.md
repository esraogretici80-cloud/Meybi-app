# MEYBI — Kişisel Yapay Zekâ Öğretmeni

> **Slogan:** Kitabın olsun ya da olmasın, öğrenmenin bir yolu var.

Türkiye’deki **5, 6, 7 ve 8. sınıf** öğrencilerine yönelik, Türkçe konuşan, öğretmen gibi konu anlatan, öğrencinin seviyesine uyum sağlayan eğitim platformu.

Bu depo **MVP (Aşama 1 + kısmi Aşama 2)** sürümüdür. Çalışan temel platform + yapılandırılmış ders akışı + gerçek AI proxy iskeleti + PWA + tarayıcı TTS içerir.

---

## 1. Projeyi nasıl kurarım?

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- (İsteğe bağlı) Cloudflare hesabı + Wrangler
- (İsteğe bağlı) Google AI Studio / Gemini API anahtarı
- (İsteğe bağlı) Firebase projesi

### Kurulum

```bash
cd meybi
npm install
cp .env.example .env
# .env içindeki VITE_API_BASE değerini gerekirse düzenle
npm run dev
```

Tarayıcıda: http://localhost:5173

**API olmadan da çalışır.** AI Worker’a ulaşılamazsa yerel *fallback* ders planı gösterilir ve kullanıcıya açıkça bildirilir.

---

## 2. Telefonda nasıl test ederim?

1. Bilgisayarınız ve telefon aynı Wi-Fi ağında olsun.
2. `npm run dev -- --host` ile sunucuyu başlatın.
3. Terminalde görünen yerel IP adresini (örn. `http://192.168.1.xx:5173`) telefonda açın.
4. Chrome / Safari’de “Ana ekrana ekle” ile PWA olarak deneyebilirsiniz.

Canlıya aldıktan sonra (Cloudflare Pages) herhangi bir telefondan doğrudan domain üzerinden test edilir.

---

## 3. Firebase nasıl yapılandırılır?

1. [Firebase Console](https://console.firebase.google.com) → yeni proje.
2. **Authentication** → Sign-in method → **Google**’ı etkinleştir.
3. **Firestore** oluştur (production veya test mode; kuralları hemen güncelleyin).
4. Web uygulaması ekle → yapılandırma değerlerini kopyala.
5. `.env` dosyasına `VITE_FIREBASE_*` alanlarını yaz.
6. `firestore.rules` dosyasındaki kuralları Firebase’e yükle.
7. **Authorized domains** listesine `localhost` ve yayın domain’inizi ekle.

> **Not:** MVP’de Auth UI henüz aktif değildir (Settings’te “yakında” görünür). İlerleme localStorage’da tutulur. Auth bağlandığında `useProgress` Firestore’a taşınabilir.

---

## 4. Yapay zekâ API’si nasıl bağlanır?

API anahtarı **asla** tarayıcıya veya Git’e konmaz. Cloudflare Worker üzerinden proxy edilir.

### Adımlar

1. [Google AI Studio](https://aistudio.google.com) veya Google Cloud’dan Gemini API anahtarı alın.
2. Önerilen model (ücretsiz / düşük maliyet): `gemini-3.5-flash-lite` veya `gemini-3.6-flash` / `gemini-3.8-flash`.
3. Worker’ı yapılandırın:

```bash
cd functions
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
# İsteğe bağlı:
# npx wrangler secret put GEMINI_MODEL   # örn. gemini-3.8-flash
npx wrangler deploy
```

4. Deploy sonrası Worker URL’ini alın (örn. `https://meybi-ai.xxx.workers.dev`).
5. Frontend `.env`:

```
VITE_API_BASE=https://meybi-ai.xxx.workers.dev
```

6. Geliştirmede Vite proxy zaten `/api` → `localhost:8787` yönlendirir. Ayrı terminalde:

```bash
npm run worker:dev
```

### Ücretsiz limitler

Gemini free tier **çok kısıtlıdır** (modele göre günde onlarca istek).  
Güncel limitleri [Google AI Studio](https://aistudio.google.com) proje sayfanızdan ve resmi [fiyatlandırma](https://ai.google.dev/gemini-api/docs/pricing) sayfasından kontrol edin.  
**Ücretsiz / sınırsız kullanım garanti edilmez.**

---

## 5. Seslendirme nasıl etkinleştirilir?

Varsayılan: **Web Speech API** (tarayıcı / cihaz sesi).

- Türkçe ses varsa otomatik seçilir.
- Ders ekranında “Sesli oku”, duraklat, devam, durdur ve hız seçimi vardır.
- Servis kullanılamasa bile yazılı anlatım çalışmaya devam eder.

Harici TTS (Google Cloud Text-to-Speech vb.) eklemek için Worker’a yeni bir endpoint eklenebilir; şu an yoktur.

---

## 6. Site nasıl yayınlanır?

### Cloudflare Pages (önerilen)

1. GitHub’a push edin (API anahtarı olmadığından emin olun).
2. Cloudflare Dashboard → Pages → Create → Git deposunu bağla.
3. Build ayarları:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_BASE=https://meybi-ai.xxx.workers.dev`
4. Deploy.

Worker’ı da aynı hesapta deploy ettiyseniz CORS için `ALLOWED_ORIGIN` secret’ını Pages domain’inize ayarlayın.

### Alternatif

Vercel, Netlify veya herhangi bir static host + ayrı Worker/Functions.

---

## 7. Ücretsiz kullanım limitleri nereden kontrol edilir?

| Servis | Nereden bakılır |
|--------|------------------|
| Gemini API | AI Studio → proje → Rate limits / Usage |
| Cloudflare Workers | Dashboard → Workers → Metrics (ücretsiz tier günlük limitleri) |
| Cloudflare Pages | Dashboard → Pages |
| Firebase | Console → Usage |

Resmi Gemini fiyatlandırma: https://ai.google.dev/gemini-api/docs/pricing

---

## 8. Hatalar nasıl giderilir?

| Belirti | Olası neden | Çözüm |
|---------|-------------|--------|
| “Örnek içerik (AI bağlantısı yok)” | Worker çalışmıyor veya anahtar yok | `wrangler secret put`, deploy, `VITE_API_BASE` kontrol |
| 429 | Rate limit | Biraz bekleyin; Worker limitini veya Gemini kotasını kontrol edin |
| CORS hatası | Origin izinli değil | Worker `ALLOWED_ORIGIN` |
| Ses çıkmıyor | Tarayıcı / OS sesi | Chrome’da tr-TR sesi yükleyin; mobil sessiz mod kapalı olsun |
| PWA yüklenmiyor | HTTPS gerekir | Canlı domain veya localhost |

Tarayıcı konsolu (F12) ve Worker logları (`wrangler tail`) en iyi teşhis kaynaklarıdır.

---

## Proje yapısı

```
meybi/
├── public/
│   ├── icons/
│   └── (manifest VitePWA ile üretilir)
├── src/
│   ├── components/     # BottomNav, DigitalBoard
│   ├── data/           # Müfredat örnekleri
│   ├── hooks/          # Theme, Progress
│   ├── pages/          # Home, Lesson, Progress, Settings
│   ├── services/       # ai.ts, tts.ts
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── functions/          # Cloudflare Worker (AI proxy)
│   ├── src/index.ts
│   └── wrangler.toml
├── firestore.rules
├── .env.example
├── package.json
├── vite.config.ts
└── README.md
```

---

## Çalışmayan / dış kurulum gerektiren özellikler (açık liste)

1. **Gerçek Gemini yanıtı** — Worker deploy + `GEMINI_API_KEY` gerekir. Yoksa fallback kullanılır.
2. **Firebase Auth (Google giriş)** — UI iskeleti var, bağlantı yapılmamış.
3. **Firestore ilerleme senkronu** — Şu an localStorage.
4. **Kitaplı mod / PDF analizi** — UI’da seçenek var; metin çıkarma ve bağlama tam değil.
5. **Gelişmiş dijital tahta** (serbest çizim, undo) — Sadece konu bazlı SVG.
6. **Harici Türkçe TTS servisi** — Yalnızca Web Speech API.
7. **Tam MEB müfredatı** — Yalnızca seçilmiş örnek konular.
8. **Kullanıcı başına kalıcı kota / harcama paneli** — Basit IP rate limit var.
9. **Android APK** — PWA olarak kurulabilir; native APK üretilmemiştir.

---

## Test kontrol listesi

- [ ] `npm install && npm run dev` hatasız açılıyor
- [ ] Ana sayfada sınıf → ders → konu seçilip derse gidiliyor
- [ ] AI yokken fallback ders planı ve uyarı görünüyor
- [ ] Çoktan seçmeli soru cevaplanıyor, geri bildirim çıkıyor
- [ ] Sesli oku (destekleyen tarayıcıda) çalışıyor
- [ ] Tema (açık/koyu) değişiyor
- [ ] İlerleme sayfası kaydı gösteriyor
- [ ] Mobil genişlikte yatay kaydırma yok
- [ ] Offline banner görünüyor (ağ kesildiğinde)
- [ ] Worker health: `GET /health` → `{ ok: true }`

---

## Lisans ve kullanım

Eğitim amaçlı örnek projedir.  
Öğrenci verisi toplarken KVKK / çocuk mahremiyetine dikkat edin.  
Telifli kitap PDF’lerini izinsiz dağıtmayın; yalnızca öğrencinin yüklediği ve izin verdiği dosyalar işlenmelidir.

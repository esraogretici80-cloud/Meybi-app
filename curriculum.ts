/**
 * MEYBI Müfredat Verisi (MVP)
 * Sadece seçilmiş kaliteli konular — tüm müfredat hazır DEĞİLDİR.
 * Resmi MEB müfredatına birebir uyum iddiası yoktur; örnek yapılandırılmış içeriktir.
 */

export interface Topic {
  id: string
  title: string
  unit: string
  goals: string[]
  prerequisites?: string[]
}

export interface Subject {
  id: string
  name: string
  icon: string
  topics: Record<number, Topic[]> // grade -> topics
}

export const GRADES = [5, 6, 7, 8] as const

export const SUBJECTS: Subject[] = [
  {
    id: 'matematik',
    name: 'Matematik',
    icon: '📐',
    topics: {
      5: [
        {
          id: 'mat5-kesirler',
          title: 'Kesirler',
          unit: 'Sayılar ve İşlemler',
          goals: [
            'Kesirleri modelleyerek gösterir',
            'Basit kesirleri karşılaştırır',
            'Kesirlerle toplama ve çıkarma yapar'
          ]
        },
        {
          id: 'mat5-geometri-acil',
          title: 'Açılar',
          unit: 'Geometri',
          goals: ['Açıları tanır ve ölçer', 'Komşu ve dik açıları ayırt eder']
        }
      ],
      6: [
        {
          id: 'mat6-oran-oranti',
          title: 'Oran ve Orantı',
          unit: 'Sayılar ve İşlemler',
          goals: ['Oran kavramını açıklar', 'Orantı problemlerini çözer']
        },
        {
          id: 'mat6-cebir',
          title: 'Cebirsel İfadeler',
          unit: 'Cebir',
          goals: ['Cebirsel ifadeleri tanır', 'Basit denklemleri çözer']
        }
      ],
      7: [
        {
          id: 'mat7-rasyonel',
          title: 'Rasyonel Sayılar',
          unit: 'Sayılar ve İşlemler',
          goals: ['Rasyonel sayıları tanır', 'Rasyonel sayılarla işlem yapar']
        },
        {
          id: 'mat7-denklem',
          title: 'Birinci Dereceden Denklemler',
          unit: 'Cebir',
          goals: ['Denklem kurar ve çözer', 'Problemleri denklemle modeller']
        }
      ],
      8: [
        {
          id: 'mat8-karekok',
          title: 'Kareköklü İfadeler',
          unit: 'Sayılar ve İşlemler',
          goals: ['Karekök kavramını açıklar', 'Basit kareköklü ifadeleri sadeleştirir']
        },
        {
          id: 'mat8-olasilik',
          title: 'Olasılık',
          unit: 'Veri ve Olasılık',
          goals: ['Olasılık hesaplar', 'Deneysel ve teorik olasılığı ayırt eder']
        }
      ]
    }
  },
  {
    id: 'fen',
    name: 'Fen Bilimleri',
    icon: '🔬',
    topics: {
      5: [
        {
          id: 'fen5-gunes-dunya-ay',
          title: 'Güneş, Dünya ve Ay',
          unit: 'Dünya ve Evren',
          goals: [
            'Güneş-Dünya-Ay konumlarını açıklar',
            'Gece-gündüz oluşumunu açıklar',
            'Ay’ın evrelerini tanır'
          ]
        },
        {
          id: 'fen5-kuvvet',
          title: 'Kuvvetin Ölçülmesi',
          unit: 'Fiziksel Olaylar',
          goals: ['Kuvveti tanır', 'Dinamometre kullanımını açıklar']
        }
      ],
      6: [
        {
          id: 'fen6-sistemler',
          title: 'Destek ve Hareket Sistemi',
          unit: 'Canlılar ve Yaşam',
          goals: ['İskelet ve kas sistemini açıklar', 'Eklem türlerini ayırt eder']
        },
        {
          id: 'fen6-elektrik',
          title: 'İletken ve Yalıtkan Maddeler',
          unit: 'Fiziksel Olaylar',
          goals: ['İletken ve yalıtkanları ayırt eder', 'Basit devre kurar']
        }
      ],
      7: [
        {
          id: 'fen7-hucre',
          title: 'Hücre ve Organeller',
          unit: 'Canlılar ve Yaşam',
          goals: ['Hücre organellerini tanır', 'Bitki ve hayvan hücresini karşılaştırır']
        },
        {
          id: 'fen7-kuvvet-enerji',
          title: 'Kuvvet, İş ve Enerji İlişkisi',
          unit: 'Fiziksel Olaylar',
          goals: ['İş ve enerji ilişkisini açıklar', 'Enerji dönüşümlerini örnekler']
        }
      ],
      8: [
        {
          id: 'fen8-periyodik',
          title: 'Periyodik Sistem',
          unit: 'Madde ve Değişim',
          goals: ['Periyodik tabloyu okur', 'Element gruplarını tanır']
        },
        {
          id: 'fen8-dna',
          title: 'DNA ve Genetik Kod',
          unit: 'Canlılar ve Yaşam',
          goals: ['DNA yapısını açıklar', 'Kalıtımın temel kavramlarını bilir']
        }
      ]
    }
  },
  {
    id: 'turkce',
    name: 'Türkçe',
    icon: '📖',
    topics: {
      5: [
        {
          id: 'tur5-cumle-ogeleri',
          title: 'Cümle Öğeleri',
          unit: 'Dil Bilgisi',
          goals: ['Özne, yüklem, nesne, yer-zaman belirtecini bulur']
        }
      ],
      6: [
        {
          id: 'tur6-fiilimsiler',
          title: 'Fiilimsiler',
          unit: 'Dil Bilgisi',
          goals: ['İsim-fiil, sıfat-fiil, zarf-fiili ayırt eder']
        }
      ],
      7: [
        {
          id: 'tur7-anlam',
          title: 'Sözcükte Anlam',
          unit: 'Anlam Bilgisi',
          goals: ['Gerçek, mecaz, terim anlamı ayırt eder']
        }
      ],
      8: [
        {
          id: 'tur8-cumle-cesitleri',
          title: 'Cümle Çeşitleri',
          unit: 'Dil Bilgisi',
          goals: ['Basit, birleşik, sıralı, bağlı cümleleri ayırt eder']
        }
      ]
    }
  },
  {
    id: 'sosyal',
    name: 'Sosyal Bilgiler',
    icon: '🌍',
    topics: {
      5: [
        {
          id: 'sos5-harita',
          title: 'Harita Bilgisi',
          unit: 'İnsanlar, Yerler ve Çevreler',
          goals: ['Harita unsurlarını tanır', 'Yön bulmayı açıklar']
        }
      ],
      6: [
        {
          id: 'sos6-ipek-yolu',
          title: 'İpek Yolu',
          unit: 'Küresel Bağlantılar',
          goals: ['İpek Yolu’nun önemini açıklar']
        }
      ],
      7: [
        {
          id: 'sos7-osmanli',
          title: 'Osmanlı Devleti’nin Kuruluşu',
          unit: 'Türk Tarihine Yolculuk',
          goals: ['Kuruluş dönemini ve önemli olayları açıklar']
        }
      ],
      8: [
        {
          id: 'sos8-milli-mucadele',
          title: 'Millî Mücadele',
          unit: 'Millî Uyanış',
          goals: ['Millî Mücadele sürecini ana hatlarıyla açıklar']
        }
      ]
    }
  }
]

export function getTopics(grade: number, subjectId: string): Topic[] {
  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return []
  return subject.topics[grade] || []
}

export function getTopic(grade: number, subjectId: string, topicId: string): Topic | undefined {
  return getTopics(grade, subjectId).find(t => t.id === topicId)
}

export function getSubjectName(id: string): string {
  return SUBJECTS.find(s => s.id === id)?.name || id
}

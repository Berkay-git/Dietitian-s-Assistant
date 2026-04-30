interface ExchangeEntry {
  netGrams?: number;
  rawGrams?: number;
  cookedGrams?: number;
  grossGrams?: number;
  measure: string;
  ratio: number;
}

type ExchangeCategory = Record<string, ExchangeEntry>;

export const EXCHANGE_MAP: Record<string, ExchangeCategory> = {
  "Süt, Yoğurt": {
    "Süt": { netGrams: 200, measure: "su bardağı", ratio: 1 },
    "Yoğurt": { netGrams: 150, measure: "su bardağı (4 tepeleme yemek kaşığı)", ratio: 0.75 },
    "Ev yoğurdu": { netGrams: 200, measure: "su bardağı", ratio: 1 },
    "Ayran": { netGrams: 300, measure: "su bardağı", ratio: 1.5 },
    "Kefir": { netGrams: 200, measure: "su bardağı", ratio: 1 },
  },

  "Et, Peynir, Yumurta": {
    "Kuşbaşı": { rawGrams: 30, cookedGrams: 20, measure: "orta boyutta", ratio: 3 },
    "Kıyma": { rawGrams: 30, cookedGrams: 20, measure: "yemek kaşığı", ratio: 1 },
    "Köfte": { rawGrams: 40, cookedGrams: 30, measure: "küçük yumurta boyutunda", ratio: 1 },
    "Biftek": { rawGrams: 30, cookedGrams: 20, measure: "avuç içi kadar", ratio: 1 },
    "Tavuk göğüs fileto": { rawGrams: 30, cookedGrams: 20, measure: "küçük boy", ratio: 0.25 },
    "Tavuk baget, kemiksiz": { rawGrams: 30, cookedGrams: 20, measure: "küçük boy", ratio: 1 },
    "Hindi eti (derisiz), kemiksiz": { rawGrams: 30, cookedGrams: 20, measure: "parmak boyutunda", ratio: 3 },
    "Levrek": { grossGrams: 55, netGrams: 30, measure: "küçük boy", ratio: 0.2 },
    "Alabalık": { grossGrams: 45, netGrams: 30, measure: "orta boy", ratio: 0.166 },
    "Çipura": { grossGrams: 60, netGrams: 30, measure: "küçük boy", ratio: 0.25 },
    "Somon": { grossGrams: 40, netGrams: 30, measure: "parmak boyutunda", ratio: 2 },
    "İstavrit": { grossGrams: 60, netGrams: 30, measure: "küçük boy", ratio: 4 },
    "Mezgit": { grossGrams: 100, netGrams: 40, measure: "orta boy", ratio: 3 },
    "Lüfer": { grossGrams: 40, netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Sazan": { grossGrams: 55, netGrams: 40, measure: "parmak boyutunda", ratio: 2 },
    "Hamsi": { grossGrams: 45, netGrams: 30, measure: "orta boy", ratio: 5 },
    "Yumurta(tavuk)": { grossGrams: 55, netGrams: 50, measure: "küçük boy", ratio: 1 },
    "Yumurta(bıldırcın)": { grossGrams: 75, netGrams: 50, measure: "adet", ratio: 5 },
    "Beyaz peynir(inek), tam yağlı": { netGrams: 40, measure: "parmak boyutunda", ratio: 2 },
    "Koyun peyniri, tam yağlı": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Keçi peyniri": { netGrams: 40, measure: "parmak boyutunda", ratio: 2 },
    "Kaşar peyniri (taze/eski)": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Lor peyniri": { netGrams: 50, measure: "tepeleme yemek kaşığı", ratio: 3 },
    "Çökelek": { netGrams: 25, measure: "yemek kaşığı", ratio: 2 },
    "Ezine peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Tulum peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Dil peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Süzme peynir": { netGrams: 40, measure: "parmak boyutunda", ratio: 2 },
    "Krem peynir": { netGrams: 45, measure: "tepeleme yemek kaşığı", ratio: 1 },
    "Hellim peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Örgü peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Çeçil peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Cheddar peyniri": { netGrams: 30, measure: "yarım parmak boyutunda", ratio: 3 },
    "Gravyer peyniri": { netGrams: 20, measure: "yarım parmak boyutunda", ratio: 2 },
  },

  "Ekmek, Tahıl, Kurubaklagil": {
    "Beyaz, buğday": { netGrams: 25, measure: "ince dilim", ratio: 1 },
    "Mısır ekmeği": { netGrams: 25, measure: "ince dilim", ratio: 1 },
    "Çavdar/Yulaf/Tam buğday/Kepekli": { netGrams: 30, measure: "ince dilim", ratio: 1 },
    "Bazlama": { netGrams: 30, measure: "orta boy", ratio: 0.2 },
    "Lavaş": { netGrams: 30, measure: "küçük boy", ratio: 1 },
    "Hamburger ekmeği (küçük)": { netGrams: 25, measure: "adet", ratio: 0.5 },
    "Sandviç ekmeği (küçük)": { netGrams: 25, measure: "adet", ratio: 0.33 },
    "Un (buğday/mısır)": { rawGrams: 20, measure: "silme yemek kaşığı (çiğ)", ratio: 3 },
    "Pirinç pilavı": { rawGrams: 20, measure: "tepeleme yemek kaşığı (pişmiş)", ratio: 2 },
    "Bulgur pilavı": { rawGrams: 20, measure: "tepeleme yemek kaşığı (pişmiş)", ratio: 3 },
    "Makarna": { rawGrams: 20, measure: "tepeleme yemek kaşığı (pişmiş)", ratio: 3 },
    "Erişte": { rawGrams: 20, measure: "tepeleme yemek kaşığı (pişmiş)", ratio: 3 },
    "Yarma (aşurelik buğday)": { rawGrams: 25, measure: "tepeleme yemek kaşığı (pişmiş)", ratio: 3 },
    "Mercimek çorbası": { rawGrams: 25, measure: "küçük kase", ratio: 1 },
    "Şehriye, pirinç, tarhana, un çorbası": { rawGrams: 20, measure: "küçük kase", ratio: 1 },
    "Nohut": { rawGrams: 25, measure: "tepeleme yemek kaşığı", ratio: 3 },
    "Kuru fasulye": { rawGrams: 25, measure: "tepeleme yemek kaşığı", ratio: 3 },
    "Barbunya": { rawGrams: 25, measure: "tepeleme yemek kaşığı", ratio: 3 },
    "Mercimek(yeşil-kırmızı)": { rawGrams: 25, measure: "tepeleme yemek kaşığı", ratio: 2 },
    "Kuru bakla": { rawGrams: 30, measure: "tepeleme yemek kaşığı", ratio: 4 },
    "Kuru börülce": { rawGrams: 35, measure: "tepeleme yemek kaşığı", ratio: 2 },
    "Patates": { netGrams: 100, measure: "küçük boy", ratio: 1 },
    "Bezelye (iç)": { netGrams: 125, measure: "yemek kaşığı (çiğ)", ratio: 4 },
    "Kestane": { netGrams: 40, measure: "orta boy", ratio: 4 },
    "Koçan mısır": { netGrams: 90, measure: "küçük boy (bütün)", ratio: 1 },
    "Patlamış mısır (yağsız)": { netGrams: 25, measure: "su bardağı", ratio: 3 },
    "Leblebi (sarı/beyaz)": { netGrams: 25, measure: "çay bardağı", ratio: 0.5 },
    "Bisküvi (tuzlu, diyet)": { netGrams: 25, measure: "adet", ratio: 4 },
    "İrmik": { netGrams: 20, measure: "yemek kaşığı", ratio: 2 },
    "Tahıl/mısır gevreği(sade)": { netGrams: 20, measure: "yemek kaşığı", ratio: 3 },
    "Yulaf ezmesi": { netGrams: 25, measure: "yemek kaşığı", ratio: 2 },
    "Böreklik yufka": { netGrams: 25, measure: "adet", ratio: 0.166 },
    "Galeta": { netGrams: 20, measure: "büyük boy", ratio: 1.5 },
  },

  "Meyve": {
    "Ahududu": { grossGrams: 200, netGrams: 200, measure: "orta boy", ratio: 35 },
    "Ananas": { grossGrams: 300, netGrams: 160, measure: "parmak kalınlığında dilim", ratio: 1 },
    "Armut": { grossGrams: 140, netGrams: 125, measure: "küçük boy", ratio: 1 },
    "Ayva": { grossGrams: 140, netGrams: 110, measure: "büyük boy", ratio: 0.5 },
    "Babutsa (Kaktüs meyvesi)": { grossGrams: 250, netGrams: 160, measure: "orta boy", ratio: 2 },
    "Böğürtlen": { grossGrams: 210, netGrams: 210, measure: "orta boy", ratio: 35 },
    "Çilek": { grossGrams: 305, netGrams: 300, measure: "orta boy", ratio: 18 },
    "Dut": { grossGrams: 115, netGrams: 115, measure: "su bardağı karışık boy", ratio: 0.75 },
    "Elma": { grossGrams: 130, netGrams: 120, measure: "orta boy", ratio: 1 },
    "Erik, mürdüm": { grossGrams: 115, netGrams: 110, measure: "orta boy", ratio: 3 },
    "Erik, yeşil": { grossGrams: 140, netGrams: 130, measure: "orta boy", ratio: 7 },
    "Greyfurt": { grossGrams: 230, netGrams: 175, measure: "orta boy", ratio: 1 },
    "İncir": { grossGrams: 120, netGrams: 110, measure: "küçük boy", ratio: 2 },
    "Karayemiş": { grossGrams: 110, netGrams: 100, measure: "orta boy", ratio: 23 },
    "Karpuz": { grossGrams: 330, netGrams: 220, measure: "orta boyun yarısı (1/8 dilimden)", ratio: 0.5 },
    "Kavun": { grossGrams: 315, netGrams: 170, measure: "küçük boy (1/8 dilim)", ratio: 1 },
    "Kayısı": { grossGrams: 190, netGrams: 175, measure: "orta boy", ratio: 7 },
    "Kiraz": { grossGrams: 120, netGrams: 110, measure: "büyük boy", ratio: 11 },
    "Kivi": { grossGrams: 125, netGrams: 110, measure: "küçük boy", ratio: 2 },
    "Kızılcık": { grossGrams: 200, netGrams: 100, measure: "su bardağı", ratio: 1 },
    "Limon": { grossGrams: 250, netGrams: 200, measure: "büyük boy", ratio: 2 },
    "Mandalina": { grossGrams: 175, netGrams: 140, measure: "orta boy", ratio: 2 },
    "Mango": { grossGrams: 145, netGrams: 120, measure: "büyük boy", ratio: 0.33 },
    "Muz": { grossGrams: 140, netGrams: 85, measure: "küçük boy", ratio: 1 },
    "Nar": { grossGrams: 250, netGrams: 160, measure: "orta boy", ratio: 1 },
    "Portakal": { grossGrams: 180, netGrams: 140, measure: "orta boy", ratio: 1 },
    "Şeftali": { grossGrams: 220, netGrams: 185, measure: "orta boy", ratio: 1 },
    "Üzüm": { grossGrams: 100, netGrams: 100, measure: "karışık boy", ratio: 25 },
    "Vişne": { grossGrams: 150, netGrams: 125, measure: "karışık boy", ratio: 35 },
    "Trabzon hurması": { grossGrams: 120, netGrams: 100, measure: "küçük boy", ratio: 1 },
    "Yaban mersini": { grossGrams: 175, netGrams: 175, measure: "su bardağı", ratio: 1.5 },
    "Yeni dünya": { grossGrams: 160, netGrams: 120, measure: "orta boy", ratio: 7 },
    "Kuru erik": { grossGrams: 25, netGrams: 25, measure: "orta boy", ratio: 3 },
    "Kuru incir": { grossGrams: 25, netGrams: 25, measure: "küçük boy", ratio: 2 },
    "Kuru kayısı": { grossGrams: 25, netGrams: 25, measure: "küçük boy", ratio: 4 },
    "Kuru üzüm": { grossGrams: 20, netGrams: 20, measure: "yemek kaşığı (tepeleme)", ratio: 1 },
    "Kuru hurma": { grossGrams: 25, netGrams: 25, measure: "orta boy", ratio: 3 },
    "Kuru dut": { grossGrams: 20, netGrams: 20, measure: "yemek kaşığı (tepeleme)", ratio: 2 },
  },

  "Sebze": {
    "Kırmızı turp": { grossGrams: 170, netGrams: 150, measure: "orta boy (çiğ)", ratio: 1 },
    "Siyah turp": { grossGrams: 115, netGrams: 100, measure: "büyük boy (çiğ)", ratio: 1 },
    "Salatalık/acur": { grossGrams: 250, netGrams: 200, measure: "orta boy (çiğ)", ratio: 2 },
    "Domates": { grossGrams: 230, netGrams: 200, measure: "büyük boy (çiğ)", ratio: 1 },
    "Kuru soğan": { grossGrams: 85, netGrams: 75, measure: "orta boy (çiğ)", ratio: 0.5 },
    "Yeşil soğan": { grossGrams: 140, netGrams: 125, measure: "orta boy (çiğ)", ratio: 6 },
    "Yeşil sivri biber": { grossGrams: 145, netGrams: 125, measure: "büyük boy (çiğ)", ratio: 8 },
    "Dolmalık biber": { grossGrams: 165, netGrams: 150, measure: "büyük boy (çiğ)", ratio: 3 },
    "Çarliston Biber": { grossGrams: 190, netGrams: 175, measure: "büyük boy (çiğ)", ratio: 5 },
    "Asma yaprağı": { grossGrams: 35, netGrams: 35, measure: "büyük boy (çiğ)", ratio: 8 },
    "Kara lahana": { grossGrams: 60, netGrams: 60, measure: "yaprak orta boy (çiğ)", ratio: 2 },
    "Beyaz Lahana": { grossGrams: 150, netGrams: 150, measure: "su bardağı doğranmış (çiğ)", ratio: 3 },
    "Kırmızı lahana": { grossGrams: 80, netGrams: 80, measure: "su bardağı doğranmış (çiğ)", ratio: 1 },
    "Brüksel lahanası": { grossGrams: 125, netGrams: 125, measure: "büyük boy (çiğ)", ratio: 5 },
    "Pırasa": { grossGrams: 120, netGrams: 100, measure: "orta boy (çiğ)", ratio: 1 },
    "Taze kabak": { grossGrams: 265, netGrams: 250, measure: "büyük boy (çiğ)", ratio: 1 },
    "Bal kabağı (kabuksuz)": { grossGrams: 75, netGrams: 75, measure: "orta boy kare dilim (çiğ)", ratio: 1 },
    "Kereviz": { grossGrams: 170, netGrams: 100, measure: "orta boy (çiğ)", ratio: 0.5 },
    "Havuç": { grossGrams: 135, netGrams: 100, measure: "küçük boy (çiğ)", ratio: 2 },
    "Pancar kırmızı": { grossGrams: 90, netGrams: 75, measure: "küçük boy (çiğ)", ratio: 0.75 },
    "Şalgam": { grossGrams: 170, netGrams: 150, measure: "büyük boy (çiğ)", ratio: 1 },
    "Patlıcan": { grossGrams: 250, netGrams: 200, measure: "büyük boy (çiğ)", ratio: 1 },
    "Taze fasulye": { grossGrams: 85, netGrams: 85, measure: "orta boy (çiğ)", ratio: 6 },
    "Bamya": { grossGrams: 95, netGrams: 80, measure: "büyük boy (çiğ)", ratio: 30 },
    "Karnabahar": { grossGrams: 150, netGrams: 150, measure: "orta boy çiçek (çiğ)", ratio: 3 },
    "Pazı": { grossGrams: 200, netGrams: 200, measure: "yaprak orta boy (çiğ)", ratio: 13 },
    "Ebegümeci": { grossGrams: 100, netGrams: 100, measure: "su bardağı doğranmış (çiğ)", ratio: 5 },
    "Mantar (kültür)": { grossGrams: 225, netGrams: 225, measure: "orta boy (çiğ)", ratio: 8 },
    "Yer elması": { grossGrams: 190, netGrams: 150, measure: "orta boy (çiğ)", ratio: 2 },
    "Taze Börülce": { grossGrams: 100, netGrams: 100, measure: "orta boy (çiğ)", ratio: 8 },
    "Brokoli": { grossGrams: 125, netGrams: 125, measure: "karışık boy çiçek (çiğ)", ratio: 7 },
    "Taze bakla": { grossGrams: 160, netGrams: 150, measure: "büyük boy (çiğ)", ratio: 16 },
    "Enginar (çanak)": { grossGrams: 225, netGrams: 225, measure: "büyük boy (çiğ)", ratio: 2 },
    "Semizotu": { grossGrams: 340, netGrams: 300, measure: "küçük bağ (çiğ)", ratio: 1 },
    "Ispanak": { grossGrams: 225, netGrams: 200, measure: "orta bağ (çiğ)", ratio: 1 },
    "Kuru biber": { grossGrams: 15, netGrams: 15, measure: "orta boy (çiğ)", ratio: 5 },
    "Kuru patlıcan": { grossGrams: 20, netGrams: 20, measure: "orta boy (çiğ)", ratio: 6 },
    "Kuru bamya": { grossGrams: 25, netGrams: 25, measure: "yemek kaşığı (çiğ)", ratio: 3 },
  },

  "Yağ": {
    "Sıvı yağ": { netGrams: 5, measure: "tatlı kaşığı", ratio: 1 },
    "Zeytin (Siyah/Yeşil)": { grossGrams: 40, netGrams: 35, measure: "orta boy", ratio: 10 },
    "Avokado": { grossGrams: 55, netGrams: 40, measure: "küçük boy", ratio: 0.25 },
  },

  "Yağlı Tohumlar": {
    "Ceviz": { grossGrams: 20, netGrams: 10, measure: "bütün orta boy", ratio: 2 },
    "Badem": { grossGrams: 20, netGrams: 10, measure: "orta boy", ratio: 10 },
    "Fındık": { grossGrams: 20, netGrams: 10, measure: "orta boy", ratio: 8 },
    "Antep fıstığı": { grossGrams: 20, netGrams: 10, measure: "orta boy", ratio: 15 },
    "Kaju Fıstığı": { grossGrams: 10, netGrams: 10, measure: "orta boy", ratio: 7 },
    "Yer fıstığı": { grossGrams: 10, netGrams: 10, measure: "orta boy", ratio: 13 },
    "Ay çekirdeği": { grossGrams: 20, netGrams: 10, measure: "yemek kaşığı", ratio: 3 },
    "Kabak çekirdeği": { grossGrams: 15, netGrams: 10, measure: "yemek kaşığı", ratio: 2 },
  },
};

// ── Synonyms: DB names often differ from exchange names ──
const SYNONYMS: Record<string, string> = {
  'piliç': 'tavuk',
  'pilic': 'tavuk',
  'pilav': 'pirinç pilavı',
  'yogurt': 'yoğurt',
  'sut': 'süt',
  'peynir': 'beyaz peynir',
  'yumurta': 'yumurta(tavuk)',
  'ekmek': 'beyaz, buğday',
};

// Words to strip — they add description but don't help matching
const NOISE = new Set([
  'eti', 'derisiz', 'kemiksiz', 'tam', 'yağlı', 'yarım', 'az',
  'taze', 'çiğ', 'pişmiş', 'haşlanmış', 'ızgara', 'fırında',
  'küçük', 'orta', 'büyük', 'boy', 'adet', 'dilim',
  'ile', 've', 'bir', 'yarı', 'sade', 'doğal',
]);

// Flat lookup: item name -> { entry, keywords }
interface IndexedEntry {
  entry: ExchangeEntry;
  keywords: string[];
  original: string;
}

const _index: IndexedEntry[] = [];
for (const category of Object.values(EXCHANGE_MAP)) {
  for (const [name, entry] of Object.entries(category)) {
    _index.push({
      entry,
      keywords: _tokenize(name),
      original: name.toLowerCase(),
    });
  }
}

function _normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[(),\/\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _tokenize(s: string): string[] {
  return _normalize(s)
    .split(' ')
    .filter(w => w.length > 1 && !NOISE.has(w));
}

function _applySynonyms(tokens: string[]): string[] {
  return tokens.map(t => SYNONYMS[t] ?? t);
}

// Find the best matching entry for a given item name
function _findEntry(itemName: string): ExchangeEntry | null {
  const normalized = _normalize(itemName);

  // 1. Exact match
  const exact = _index.find(e => e.original === normalized);
  if (exact) return exact.entry;

  // 2. Fuzzy keyword match
  const inputTokens = _applySynonyms(_tokenize(itemName));
  if (inputTokens.length === 0) return null;

  let bestScore = 0;
  let bestEntry: ExchangeEntry | null = null;

  for (const candidate of _index) {
    const candidateTokens = candidate.keywords;

    // Count how many input tokens appear in (or partially match) the candidate
    let matches = 0;
    for (const inputWord of inputTokens) {
      for (const candWord of candidateTokens) {
        // Full word match or one contains the other (handles "göğüs" matching "göğüs fileto")
        if (inputWord === candWord || candWord.includes(inputWord) || inputWord.includes(candWord)) {
          matches++;
          break;
        }
      }
    }

    if (matches === 0) continue;

    // Score = matched keywords / max(input length, candidate length)
    // Rewards high overlap, penalizes big mismatches
    const score = matches / Math.max(inputTokens.length, candidateTokens.length);

    if (score > bestScore) {
      bestScore = score;
      bestEntry = candidate.entry;
    }
  }

  // Require at least 40% keyword overlap to consider it a match
  return bestScore >= 0.4 ? bestEntry : null;
}

/**
 * Convert a gram-based portion string (e.g. "100g") into an exchange description.
 * Uses fuzzy keyword matching + synonyms to find the closest ExchangeMap entry.
 *
 * Example: gramsToExchange("Piliç eti, göğüs, derisiz", "60g") => "0.5 küçük boy"
 *          gramsToExchange("Elma", "120g") => "1 orta boy"
 *          gramsToExchange("UnknownFood", "50g") => "50g"
 */
export function gramsToExchange(itemName: string, portion: string): string {
  const grams = parseFloat(portion.replace('g', ''));
  if (isNaN(grams)) return portion;

  const entry = _findEntry(itemName);
  if (!entry) return portion;

  // Determine the base gram value for 1 exchange
  const baseGrams = entry.netGrams ?? entry.rawGrams ?? entry.cookedGrams ?? entry.grossGrams;
  if (!baseGrams || baseGrams === 0) return portion;

  // How many "exchanges" does this portion represent?
  const exchanges = grams / baseGrams;

  // Total count = exchanges * ratio (ratio = how many pieces/units per 1 exchange)
  const count = exchanges * entry.ratio;

  // Format the count nicely
  const rounded = Math.round(count * 10) / 10; // 1 decimal
  const display = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);

  return `${display} ${entry.measure}`;
}

/**
 * Get exchange info for an item (measure name + grams per unit).
 * Returns null if no match found — caller should fall back to grams.
 *
 * Example: getExchangeInfo("Tavuk göğüs fileto")
 *   => { measure: "küçük boy", gramsPerUnit: 120 }  (rawGrams 30, ratio 0.25 → 30/0.25=120g per 1 unit)
 */
export function getExchangeInfo(itemName: string): { measure: string; gramsPerUnit: number } | null {
  const entry = _findEntry(itemName);
  if (!entry) return null;

  const baseGrams = entry.netGrams ?? entry.rawGrams ?? entry.cookedGrams ?? entry.grossGrams;
  if (!baseGrams || baseGrams === 0 || entry.ratio === 0) return null;

  // gramsPerUnit = how many grams is 1 "measure" unit
  const gramsPerUnit = baseGrams / entry.ratio;

  return { measure: entry.measure, gramsPerUnit };
}
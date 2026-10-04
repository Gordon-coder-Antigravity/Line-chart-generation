/**
 * Comprehensive Knowledge Base mapping academic publisher cities and affiliations to countries.
 * Handles Web of Science formats (e.g., "PHILADELPHIA", "LONDON: ELSEVIER", "BEIJING, PEOPLES R CHINA", "HOBOKEN, NJ").
 */

// Normalized Country standard names
export const STANDARD_COUNTRIES = [
  'Global',
  'USA',
  'China',
  'Australia',
  'United Kingdom',
  'Germany',
  'Netherlands',
  'Switzerland',
  'Japan',
  'France',
  'Canada',
  'Italy',
  'Spain',
  'South Korea',
  'India',
  'Sweden',
  'Belgium',
  'Austria',
  'Denmark',
  'Norway',
  'Finland',
  'Singapore',
  'New Zealand',
  'Poland',
  'Brazil',
  'Russia',
  'Ireland',
  'South Africa',
  'Mexico',
  'Israel',
  'Portugal',
  'Czech Republic',
  'Greece',
  'Turkey',
  'Hungary',
  'Taiwan',
] as const;

// Common dictionary of publisher cities to country
const CITY_TO_COUNTRY_MAP: Record<string, string> = {
  // United States
  'new york': 'USA',
  'philadelphia': 'USA',
  'boston': 'USA',
  'san diego': 'USA',
  'chicago': 'USA',
  'washington': 'USA',
  'hoboken': 'USA',
  'thousand oaks': 'USA',
  'baltimore': 'USA',
  'waltham': 'USA',
  'san francisco': 'USA',
  'los angeles': 'USA',
  'cambridge ma': 'USA',
  'st louis': 'USA',
  'saint louis': 'USA',
  'princeton': 'USA',
  'indianapolis': 'USA',
  'atlanta': 'USA',
  'dallas': 'USA',
  'houston': 'USA',
  'minneapolis': 'USA',
  'austin': 'USA',
  'seattle': 'USA',
  'berkeley': 'USA',
  'durham': 'USA',
  'chapel hill': 'USA',
  'pittsburgh': 'USA',
  'denver': 'USA',
  'columbus': 'USA',
  'ann arbor': 'USA',
  'madison': 'USA',
  'new haven': 'USA',
  'providence': 'USA',
  'palo alto': 'USA',
  'norwell': 'USA',
  'malden': 'USA',
  'upper saddle river': 'USA',
  'boca raton': 'USA',
  'orlando': 'USA',
  'miami': 'USA',
  'san jose': 'USA',
  'santa barbara': 'USA',
  'cary': 'USA',
  'rockville': 'USA',
  'bethesda': 'USA',
  'springfield': 'USA',
  'piscataway': 'USA',

  // United Kingdom
  'london': 'United Kingdom',
  'oxford': 'United Kingdom',
  'cambridge': 'United Kingdom',
  'bristol': 'United Kingdom',
  'edinburgh': 'United Kingdom',
  'abingdon': 'United Kingdom',
  'chichester': 'United Kingdom',
  'cheltenham': 'United Kingdom',
  'lancaster': 'United Kingdom',
  'glasgow': 'United Kingdom',
  'manchester': 'United Kingdom',
  'birmingham': 'United Kingdom',
  'leeds': 'United Kingdom',
  'sheffield': 'United Kingdom',
  'cardiff': 'United Kingdom',
  'belfast': 'United Kingdom',
  'southampton': 'United Kingdom',
  'nottingham': 'United Kingdom',
  'reading': 'United Kingdom',
  'exeter': 'United Kingdom',
  'york': 'United Kingdom',
  'bath': 'United Kingdom',
  'milton keynes': 'United Kingdom',
  'basingstoke': 'United Kingdom',

  // China
  'beijing': 'China',
  'shanghai': 'China',
  'guangzhou': 'China',
  'wuhan': 'China',
  'nanjing': 'China',
  'hangzhou': 'China',
  'shenzhen': 'China',
  'tianjin': 'China',
  'chengdu': 'China',
  'xian': 'China',
  "xi'an": 'China',
  'chongqing': 'China',
  'hong kong': 'China',
  'macau': 'China',
  'taipei': 'Taiwan',
  'hsinchu': 'Taiwan',
  'taichung': 'Taiwan',
  'suzhou': 'China',
  'hefei': 'China',
  'dalian': 'China',
  'qingdao': 'China',
  'xiamen': 'China',
  'changsha': 'China',
  'jinan': 'China',
  'harbin': 'China',
  'kunming': 'China',

  // Australia
  'melbourne': 'Australia',
  'sydney': 'Australia',
  'brisbane': 'Australia',
  'canberra': 'Australia',
  'perth': 'Australia',
  'adelaide': 'Australia',
  'hobart': 'Australia',
  'darwin': 'Australia',
  'wollongong': 'Australia',
  'newcastle': 'Australia',
  'geelong': 'Australia',
  'cairns': 'Australia',
  'clayton': 'Australia',
  'hawthorn': 'Australia',
  'parkville': 'Australia',
  'carlton': 'Australia',

  // Netherlands
  'amsterdam': 'Netherlands',
  'dordrecht': 'Netherlands',
  'leiden': 'Netherlands',
  'utrecht': 'Netherlands',
  'rotterdam': 'Netherlands',
  'the hague': 'Netherlands',
  'den haag': 'Netherlands',
  'wageningen': 'Netherlands',
  'groningen': 'Netherlands',
  'maastricht': 'Netherlands',
  'eindhoven': 'Netherlands',
  'delft': 'Netherlands',
  'enschede': 'Netherlands',
  'nijmegen': 'Netherlands',

  // Germany
  'heidelberg': 'Germany',
  'berlin': 'Germany',
  'weinheim': 'Germany',
  'munich': 'Germany',
  'münchen': 'Germany',
  'frankfurt': 'Germany',
  'frankfurt am main': 'Germany',
  'stuttgart': 'Germany',
  'göttingen': 'Germany',
  'gottingen': 'Germany',
  'wiesbaden': 'Germany',
  'hamburg': 'Germany',
  'cologne': 'Germany',
  'köln': 'Germany',
  'leipzig': 'Germany',
  'dresden': 'Germany',
  'freiburg': 'Germany',
  'tübingen': 'Germany',
  'tubingen': 'Germany',
  'bonn': 'Germany',
  'düsseldorf': 'Germany',
  'dusseldorf': 'Germany',
  'karlsruhe': 'Germany',
  'nuremberg': 'Germany',
  'nürnberg': 'Germany',
  'jena': 'Germany',
  'erlangen': 'Germany',

  // Switzerland
  'basel': 'Switzerland',
  'cham': 'Switzerland',
  'zurich': 'Switzerland',
  'zürich': 'Switzerland',
  'lausanne': 'Switzerland',
  'geneva': 'Switzerland',
  'genève': 'Switzerland',
  'bern': 'Switzerland',
  'lugano': 'Switzerland',
  'neuchâtel': 'Switzerland',
  'st gallen': 'Switzerland',

  // Japan
  'tokyo': 'Japan',
  'kyoto': 'Japan',
  'osaka': 'Japan',
  'nagoya': 'Japan',
  'fukuoka': 'Japan',
  'sapporo': 'Japan',
  'sendai': 'Japan',
  'kobe': 'Japan',
  'yokohama': 'Japan',
  'tsukuba': 'Japan',
  'hiroshima': 'Japan',

  // France
  'paris': 'France',
  'lyon': 'France',
  'marseille': 'France',
  'toulouse': 'France',
  'strasbourg': 'France',
  'bordeaux': 'France',
  'montpellier': 'France',
  'lille': 'France',
  'rennes': 'France',
  'grenoble': 'France',
  'nice': 'France',

  // Canada
  'toronto': 'Canada',
  'ottawa': 'Canada',
  'montreal': 'Canada',
  'montréal': 'Canada',
  'vancouver': 'Canada',
  'calgary': 'Canada',
  'edmonton': 'Canada',
  'quebec': 'Canada',
  'waterloo': 'Canada',
  'halifax': 'Canada',
  'winnipeg': 'Canada',

  // South Korea
  'seoul': 'South Korea',
  'daejeon': 'South Korea',
  'busan': 'South Korea',
  'incheon': 'South Korea',
  'daegu': 'South Korea',
  'gwangju': 'South Korea',
  'suwon': 'South Korea',

  // India
  'new delhi': 'India',
  'delhi': 'India',
  'mumbai': 'India',
  'bengaluru': 'India',
  'bangalore': 'India',
  'chennai': 'India',
  'kolkata': 'India',
  'hyderabad': 'India',
  'pune': 'India',
  'ahmedabad': 'India',

  // Italy
  'rome': 'Italy',
  'roma': 'Italy',
  'milan': 'Italy',
  'milano': 'Italy',
  'florence': 'Italy',
  'firenze': 'Italy',
  'bologna': 'Italy',
  'naples': 'Italy',
  'napoli': 'Italy',
  'turin': 'Italy',
  'torino': 'Italy',
  'padua': 'Italy',
  'padova': 'Italy',
  'venice': 'Italy',
  'pisa': 'Italy',
  'genoa': 'Italy',

  // Spain
  'madrid': 'Spain',
  'barcelona': 'Spain',
  'valencia': 'Spain',
  'seville': 'Spain',
  'sevilla': 'Spain',
  'zaragoza': 'Spain',
  'granada': 'Spain',
  'salamanca': 'Spain',
  'bilbao': 'Spain',

  // Sweden
  'stockholm': 'Sweden',
  'uppsala': 'Sweden',
  'lund': 'Sweden',
  'gothenburg': 'Sweden',
  'göteborg': 'Sweden',
  'linköping': 'Sweden',

  // Norway
  'oslo': 'Norway',
  'bergen': 'Norway',
  'trondheim': 'Norway',
  'tromsø': 'Norway',

  // Denmark
  'copenhagen': 'Denmark',
  'københavn': 'Denmark',
  'aarhus': 'Denmark',
  'odense': 'Denmark',

  // Finland
  'helsinki': 'Finland',
  'espoo': 'Finland',
  'tampere': 'Finland',
  'turku': 'Finland',

  // Austria
  'vienna': 'Austria',
  'wien': 'Austria',
  'graz': 'Austria',
  'innsbruck': 'Austria',
  'salzburg': 'Austria',
  'linz': 'Austria',

  // Belgium
  'brussels': 'Belgium',
  'bruxelles': 'Belgium',
  'leuven': 'Belgium',
  'ghent': 'Belgium',
  'gent': 'Belgium',
  'antwerp': 'Belgium',
  'antwerpen': 'Belgium',
  'liège': 'Belgium',
  'louvain': 'Belgium',

  // Poland
  'warsaw': 'Poland',
  'warszawa': 'Poland',
  'krakow': 'Poland',
  'kraków': 'Poland',
  'wroclaw': 'Poland',
  'wrocław': 'Poland',
  'poznan': 'Poland',
  'gdansk': 'Poland',

  // Brazil
  'sao paulo': 'Brazil',
  'são paulo': 'Brazil',
  'rio de janeiro': 'Brazil',
  'brasilia': 'Brazil',
  'brasília': 'Brazil',
  'belo horizonte': 'Brazil',
  'porto alegre': 'Brazil',
  'campinas': 'Brazil',

  // Russia
  'moscow': 'Russia',
  'saint petersburg': 'Russia',
  'st petersburg': 'Russia',
  'novosibirsk': 'Russia',

  // Singapore
  'singapore': 'Singapore',

  // New Zealand
  'auckland': 'New Zealand',
  'wellington': 'New Zealand',
  'christchurch': 'New Zealand',
  'dunedin': 'New Zealand',

  // Ireland
  'dublin': 'Ireland',
  'cork': 'Ireland',
  'galway': 'Ireland',

  // South Africa
  'cape town': 'South Africa',
  'johannesburg': 'South Africa',
  'pretoria': 'South Africa',
  'durban': 'South Africa',

  // Mexico
  'mexico city': 'Mexico',
  'ciudad de mexico': 'Mexico',
  'guadalajara': 'Mexico',
  'monterrey': 'Mexico',

  // Others
  'tel aviv': 'Israel',
  'jerusalem': 'Israel',
  'lisbon': 'Portugal',
  'porto': 'Portugal',
  'prague': 'Czech Republic',
  'praha': 'Czech Republic',
  'athens': 'Greece',
  'istanbul': 'Turkey',
  'ankara': 'Turkey',
  'budapest': 'Hungary',
};

// US State abbreviations & state names
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// Country synonym/alias resolver
const COUNTRY_SYNONYMS: Record<string, string> = {
  'usa': 'USA',
  'united states': 'USA',
  'united states of america': 'USA',
  'u.s.a.': 'USA',
  'us': 'USA',
  'u.s.': 'USA',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'england': 'United Kingdom',
  'great britain': 'United Kingdom',
  'scotland': 'United Kingdom',
  'wales': 'United Kingdom',
  'northern ireland': 'United Kingdom',
  'peoples r china': 'China',
  "people's republic of china": 'China',
  'pr china': 'China',
  'p.r. china': 'China',
  'mainland china': 'China',
  'china': 'China',
  'australia': 'Australia',
  'the netherlands': 'Netherlands',
  'netherlands': 'Netherlands',
  'holland': 'Netherlands',
  'germany': 'Germany',
  'deutschland': 'Germany',
  'federal republic of germany': 'Germany',
  'switzerland': 'Switzerland',
  'swiss': 'Switzerland',
  'japan': 'Japan',
  'france': 'France',
  'canada': 'Canada',
  'south korea': 'South Korea',
  'korea': 'South Korea',
  'republic of korea': 'South Korea',
  'india': 'India',
  'italy': 'Italy',
  'italia': 'Italy',
  'spain': 'Spain',
  'españa': 'Spain',
  'sweden': 'Sweden',
  'sverige': 'Sweden',
  'denmark': 'Denmark',
  'danmark': 'Denmark',
  'norway': 'Norway',
  'norge': 'Norway',
  'finland': 'Finland',
  'suomi': 'Finland',
  'austria': 'Austria',
  'österreich': 'Austria',
  'oesterreich': 'Austria',
  'belgium': 'Belgium',
  'belgique': 'Belgium',
  'poland': 'Poland',
  'polska': 'Poland',
  'brazil': 'Brazil',
  'brasil': 'Brazil',
  'russia': 'Russia',
  'russian federation': 'Russia',
  'singapore': 'Singapore',
  'new zealand': 'New Zealand',
  'ireland': 'Ireland',
  'south africa': 'South Africa',
  'mexico': 'Mexico',
  'méxico': 'Mexico',
  'taiwan': 'Taiwan',
  'taiwan, roc': 'Taiwan',
  'r.o.c.': 'Taiwan',
};

// Local storage key for persistent user customizations
const STORAGE_KEY = 'wos_city_country_overrides';

export function getCustomCityOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read city overrides from localStorage', e);
    return {};
  }
}

export function saveCustomCityOverride(city: string, country: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomCityOverrides();
    const cleanCity = city.trim().toLowerCase();
    if (country) {
      current[cleanCity] = country;
    } else {
      delete current[cleanCity];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save city override', e);
  }
}

export function clearCustomCityOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear city overrides', e);
  }
}

/**
 * Resolve a raw publisher city/address string to a standardized Country.
 * e.g., "PHILADELPHIA", "LONDON: NATURE PUB GROUP", "DORDRECHT, NETHERLANDS", "MELBOURNE, VIC", "HOBOKEN, NJ"
 */
export function resolveCityToCountry(
  rawCity: string,
  userOverrides?: Record<string, string>
): { country: string; status: 'verified' | 'inferred' | 'unmapped' } {
  if (!rawCity || typeof rawCity !== 'string') {
    return { country: 'Unknown / Unmapped', status: 'unmapped' };
  }

  const cleanRaw = rawCity.trim();
  const lower = cleanRaw.toLowerCase();

  // 1. Check user overrides first
  const overrides = userOverrides || getCustomCityOverrides();
  if (overrides[lower]) {
    return { country: overrides[lower], status: 'verified' };
  }

  // 2. Direct dictionary match on the whole string
  if (CITY_TO_COUNTRY_MAP[lower]) {
    return { country: CITY_TO_COUNTRY_MAP[lower], status: 'verified' };
  }

  // 3. Remove publisher name suffix if format is "CITY: PUBLISHER" or "PUBLISHER: CITY"
  let sanitized = lower;
  if (sanitized.includes(':')) {
    const parts = sanitized.split(':');
    const firstPart = parts[0].trim();
    if (CITY_TO_COUNTRY_MAP[firstPart]) {
      return { country: CITY_TO_COUNTRY_MAP[firstPart], status: 'verified' };
    }
    const secondPart = parts[1].trim();
    if (CITY_TO_COUNTRY_MAP[secondPart]) {
      return { country: CITY_TO_COUNTRY_MAP[secondPart], status: 'verified' };
    }
    sanitized = firstPart;
  }

  // 4. Split by commas/semicolons/parentheses (e.g. "HOBOKEN, NJ, USA", "OXFORD, OXFORDSHIRE, ENGLAND")
  const tokens = sanitized
    .split(/[,;\(\)\/\-]/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Check if any token matches an explicit country synonym
  for (const token of tokens) {
    if (COUNTRY_SYNONYMS[token]) {
      return { country: COUNTRY_SYNONYMS[token], status: 'verified' };
    }
  }

  // Check if any token is a known publisher city
  for (const token of tokens) {
    if (CITY_TO_COUNTRY_MAP[token]) {
      return { country: CITY_TO_COUNTRY_MAP[token], status: 'verified' };
    }
  }

  // 5. Check for US State abbreviation tokens (e.g. "PHILADELPHIA PA", "NEW YORK NY")
  const upperRaw = rawCity.toUpperCase();
  for (const st of US_STATES) {
    const regex = new RegExp(`\\b${st}\\b`);
    if (regex.test(upperRaw)) {
      return { country: 'USA', status: 'inferred' };
    }
  }

  // 6. Substring scan of known cities in case of compound string
  for (const [knownCity, country] of Object.entries(CITY_TO_COUNTRY_MAP)) {
    const wordRegex = new RegExp(`\\b${knownCity}\\b`, 'i');
    if (wordRegex.test(lower)) {
      return { country, status: 'inferred' };
    }
  }

  // 7. Substring scan of known country names
  for (const [countryKey, stdCountry] of Object.entries(COUNTRY_SYNONYMS)) {
    const wordRegex = new RegExp(`\\b${countryKey}\\b`, 'i');
    if (wordRegex.test(lower)) {
      return { country: stdCountry, status: 'inferred' };
    }
  }

  return { country: 'Other / Unmapped', status: 'unmapped' };
}

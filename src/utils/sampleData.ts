import { ProcessedRecord } from '../types/bibliometrics';

export const SAMPLE_TARGET_YEARLY_COUNTS: Record<string, Record<number, number>> = {
  'USA': {
    2011: 572, 2012: 671, 2013: 715, 2014: 825, 2015: 776,
    2016: 887, 2017: 855, 2018: 946, 2019: 900, 2020: 1047
  },
  'China': {
    2011: 62, 2012: 102, 2013: 133, 2014: 167, 2015: 217,
    2016: 230, 2017: 271, 2018: 270, 2019: 349, 2020: 445
  },
  'Australia': {
    2011: 88, 2012: 90, 2013: 130, 2014: 144, 2015: 122,
    2016: 154, 2017: 171, 2018: 181, 2019: 172, 2020: 222
  },
  'United Kingdom': {
    2011: 380, 2012: 420, 2013: 490, 2014: 450, 2015: 480,
    2016: 510, 2017: 520, 2018: 505, 2019: 530, 2020: 590
  },
  'Germany': {
    2011: 180, 2012: 210, 2013: 250, 2014: 240, 2015: 280,
    2016: 270, 2017: 300, 2018: 310, 2019: 330, 2020: 360
  },
  'Netherlands': {
    2011: 150, 2012: 180, 2013: 220, 2014: 225, 2015: 265,
    2016: 290, 2017: 295, 2018: 310, 2019: 330, 2020: 360
  }
};

// Generate realistic individual publication records matching the exact bibliometric study profile
export function generateSampleWOSRecords(): ProcessedRecord[] {
  const records: ProcessedRecord[] = [];
  const years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];

  const cityPoolByCountry: Record<string, string[]> = {
    'USA': ['PHILADELPHIA', 'NEW YORK', 'BOSTON', 'HOBOKEN', 'CHICAGO', 'SAN DIEGO', 'THOUSAND OAKS'],
    'China': ['BEIJING', 'SHANGHAI', 'WUHAN', 'GUANGZHOU', 'NANJING', 'HANGZHOU'],
    'Australia': ['MELBOURNE', 'SYDNEY', 'BRISBANE', 'CANBERRA', 'PERTH'],
    'United Kingdom': ['LONDON', 'OXFORD', 'CAMBRIDGE', 'BRISTOL', 'EDINBURGH'],
    'Germany': ['HEIDELBERG', 'BERLIN', 'WEINHEIM', 'STUTTGART'],
    'Netherlands': ['DORDRECHT', 'AMSTERDAM', 'LEIDEN', 'UTRECHT']
  };

  const journals = [
    'Journal of Clinical Oncology',
    'Nature Medicine',
    'The Lancet Global Health',
    'Scientific Reports',
    'Frontiers in Oncology',
    'BMC Public Health',
    'Biomaterials',
    'International Journal of Surgery',
    'Acta Biomaterialia',
    'Journal of Biomedical Science'
  ];

  const topics = [
    'Bibliometric analysis of trends and frontiers',
    'Global landscape and evolutionary patterns in clinical research',
    'Systematic review and geospatial mapping of scientific outputs',
    'Emerging paradigms and international co-authorship networks',
    'Translational breakthroughs and thematic shifts in biotechnology',
    'Quantitative evaluation of research productivity and citations'
  ];

  let idCounter = 1;

  for (const [country, yearMap] of Object.entries(SAMPLE_TARGET_YEARLY_COUNTS)) {
    const cities = cityPoolByCountry[country] || ['UNKNOWN'];
    for (const year of years) {
      const count = yearMap[year] || 0;
      for (let i = 0; i < count; i++) {
        const city = cities[i % cities.length];
        const journal = journals[(idCounter + i) % journals.length];
        const topic = topics[(idCounter + i) % topics.length];

        records.push({
          id: `wos-${idCounter++}`,
          title: `${topic}: A ${country} and Global perspective (${year})`,
          year,
          originalCity: city,
          resolvedCountry: country,
          publisher: 'Academic Publishing Group',
          journal
        });
      }
    }
  }

  return records;
}

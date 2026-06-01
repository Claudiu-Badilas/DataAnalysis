// transaction.model.ts - Complete version
import { DateUtils } from 'src/app/shared/utils/date.utils';

export interface TransactionResponse {
  id: number | null;
  registrationDate: string | null;
  completionDate: string | null;
  amount: number | null;
  fee: number | null;
  currency: string | null;
  description: string | null;
  transactionType: string | null;
  provider: string | null;
  referenceId: number | null;
}

export enum TransactionCategory {
  MOBILE_BILL = 'mobile_bill',
  // Food & Dining
  SUPERMARKET = 'supermarket',
  RESTAURANT_FASTFOOD = 'restaurant_fastfood',
  CAFE_BAKERY = 'cafe_bakery',
  DELIVERY = 'delivery',

  // Transportation
  GAS_STATION = 'gas_station',
  TRANSPORT = 'transport',
  PARKING_TOLLS = 'parking_tolls',

  // Home & Utilities
  UTILITIES = 'utilities',
  RENT = 'rent',
  HOME_MAINTENANCE = 'home_maintenance',

  // Shopping
  SHOPPING = 'shopping',
  CLOTHING_ACCESSORIES = 'clothing_accessories',
  ELECTRONICS = 'electronics',
  HOME_IMPROVEMENT = 'home_improvement',
  SPORTS_OUTDOOR = 'sports_outdoor',

  // Health
  PHARMACY = 'pharmacy',
  HEALTHCARE = 'healthcare',
  GYM_FITNESS = 'gym_fitness',

  // Entertainment
  ENTERTAINMENT = 'entertainment',
  ONLINE_GAMING = 'online_gaming',
  SUBSCRIPTION = 'subscription',

  // Financial
  SALARY = 'salary',
  RECEIVED = 'received',
  TRANSFER = 'transfer',
  INTERNAL_TRANSFER = 'internal_transfer',
  REFUNDS = 'refunds',
  BANK_FEES = 'bank_fees',
  ATM_WITHDRAWAL = 'atm_withdrawal',

  // Lifestyle
  TRAVEL_ACCOMMODATION = 'travel_accommodation',
  EDUCATION = 'education',
  INSURANCE = 'insurance',
  PERSONAL_CARE = 'personal_care',
  GIFTS = 'gifts',
  PET_CARE = 'pet_care',

  // Other
  TAXES_FINES = 'taxes_fines',
  DONATIONS = 'donations',
  INVESTMENTS = 'investments',
  OTHER = 'other',
}

export class TransactionDomain {
  id: number | null;
  registrationDate: Date | null;
  completionDate: Date | null;
  amount: number | null;
  fee: number | null;
  currency: string | null;
  description: string | null;
  transactionType: string | null;
  provider: string | null;
  referenceId: number | null;

  serviceProvider: string;
  merchantName: string;
  ignored: boolean;
  category: TransactionCategory;
  categoryLabel: string;

  constructor(res: any) {
    Object.assign(this, res);

    this.registrationDate = DateUtils.fromSplittedStringToJsDate(
      res.registrationDate,
    );
    this.completionDate = DateUtils.fromSplittedStringToJsDate(
      res.completionDate,
    );

    // Extract merchant name from description
    const descParts = res.description?.split('|') || [];
    this.serviceProvider = descParts[0]?.trim() || '';

    // Extract merchant from various patterns
    this.merchantName = this.extractMerchantName(res.description || '');

    this.ignored = [
      'Transfer intre conturile proprii',
      'WWW.ORANGE.RO CONTUL-MEU',
    ].some((x) => this.description?.includes(x));

    this.category = TransactionCategorizer.categorize(this);
    this.categoryLabel = TransactionCategorizer.getCategoryLabel(this.category);
  }

  private extractMerchantName(description: string): string {
    // Try to extract from common patterns
    const patterns = [
      /^([A-Z\s\.]+)\s+\|/, // MERCHANT NAME | rest
      /^([A-Z\s\.]+)\s+/, // MERCHANT NAME rest
      /\|([A-Z\s\.]+)\s+\|/, // | MERCHANT NAME |
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // For OPIB/OPINS transactions
    if (description.includes('OPIB/1') || description.includes('OPINS/1')) {
      const parts = description.split('|');
      if (parts.length > 1) return parts[1]?.trim() || description;
    }

    return description.substring(0, 50);
  }
}

export class TransactionCategorizer {
  private static readonly rules: CategoryRule[] = [
    // ============ INCOME & RECEIVED ============
    {
      keywords: [
        'SALARIU',
        'BONUS',
        'INDEMNIZATIE',
        'CHELT DEPL',
        'DECONT',
        'virare salariu',
      ],
      category: TransactionCategory.SALARY,
      amountRange: { min: 0 },
    },
    {
      keywords: ['OPIB/1', 'OPINS', 'OPH/1'],
      category: TransactionCategory.RECEIVED,
      amountRange: { min: 0 },
      descriptionContains: [
        'Transfer intre',
        'Facturi',
        'Pizza',
        'cadou',
        'decont',
        'virare',
        'chirie',
        'diurne',
      ],
    },
    {
      keywords: ['STORNO', 'RETURN', 'REFUND', 'RAMBURS', 'returnare'],
      category: TransactionCategory.REFUNDS,
      amountRange: { min: 0 },
    },

    // ============ SUPERMARKETS (all grocery stores) ============
    {
      keywords: [
        'LIDL',
        'KAUFLAND',
        'CARREFOUR',
        'PENNY',
        'PROFI',
        'Auchan',
        'MEGAIMAGE',
        'CITY MARKET',
        'DM DROGERIE',
        'MARKET',
        'SUPERMARKET',
        'FRUCTE',
        'LEGUME',
        'CARN',
        'MACELARIE',
        'LA DOI PASI',
        'SF. ANDREI',
        'TINERVIS GROUP BUCURESTI',
        'DAROXTEO SRL Galati',
      ],
      category: TransactionCategory.SUPERMARKET,
      excludeKeywords: ['CINEMA', 'RESTAURANT', 'PIZZA', 'BURGER'],
    },

    // ============ GAS STATIONS ============
    {
      keywords: [
        'OMV',
        'MOL',
        'ROMPETROL',
        'LUKOIL',
        'PETROL',
        'BENZINA',
        'CARBURANT',
      ],
      category: TransactionCategory.GAS_STATION,
    },

    // ============ UTILITIES ============
    {
      keywords: [
        'ENGIE',
        'Pago',
        'Pago*Engie',
        'Pago*Electrica',
        'Pago*Digi',
        'Pago*Orange',
        'RCS RDS',
        'APA CANAL',
        'Pago*Apa Canal',
        'ELECTRICA',
        'GAZ',
        'ENERGIE',
        'factura gaz',
        'factura electrica',
        'factura apa',
      ],
      category: TransactionCategory.UTILITIES,
    },

    // ============ MOBILE & TELECOM ============
    {
      keywords: [
        'WWW.ORANGE.RO',
        'Orange Money',
        'TELEKOM',
        'VODAFONE',
        'reincarcare',
        'credit telefon',
        'contul-m',
      ],
      category: TransactionCategory.MOBILE_BILL,
    },

    // ============ RESTAURANTS & FAST FOOD ============
    {
      keywords: [
        'KFC',
        'MCDONALD',
        'BURGER KING',
        'PIZZA',
        'TACO',
        'KUNG FU',
        'CHOPSTIX',
        'NOODLE',
        'MESOPOTAMIA',
        'GRILL',
        'RESTAURANT',
        'DONUT',
        'FRYDAY',
        'PEP&PEPPER',
        'WONDER',
        'PASSAGE FOOD',
        'KAPTAN',
        'SALAD',
        'PASTA',
        'SOUP',
        'LA MORUN',
        'IONUT RESTAURANTE',
        'GELATO',
        'ICE CREAM',
        'FOOD',
        'MCD',
        'ionut restaurante',
      ],
      category: TransactionCategory.RESTAURANT_FASTFOOD,
    },

    // ============ CAFE & BAKERY ============
    {
      keywords: [
        'CAFE',
        'COFFEE',
        '5 TO GO',
        'STARBUCKS',
        'BAKERY',
        'PATISERIE',
        'COFETARIE',
        'DONUT',
        'MR DONUT',
        'CREMIAL',
        'LAVORATOR',
        'FIVE TO GO',
        'To Go',
        'COFETARIA',
      ],
      category: TransactionCategory.CAFE_BAKERY,
    },

    // ============ DELIVERY SERVICES ============
    {
      keywords: [
        'Glovo',
        'Wolt',
        'TAZZ',
        'Foodpanda',
        'Bolt Food',
        'TAZZ.RO',
        'tazz.ro',
        'glovo',
        'wolt',
        'union',
        'FREDDYCAMPUS',
        'FABRICA DE DISTRACTII GALATI',
      ],
      category: TransactionCategory.DELIVERY,
    },

    // ============ PHARMACY ============
    {
      keywords: [
        'FARMACIE',
        'CATENA',
        'MYOSOTIS',
        'DONA',
        'S.I.E.P.C.O.F.A.R.',
        'MEDIMFARM',
        'CLINICA SANTE',
        'SIEPCOFAR',
        'PHARMACY',
        'MEDICAMENTE',
        'FARMACEUTICA',
        'ELISAFARM',
        'MEDICALVET',
      ],
      category: TransactionCategory.PHARMACY,
    },

    // ============ HEALTHCARE SERVICES ============
    {
      keywords: [
        'medlife',
        'MED LIFE',
        'CONSULT',
        'medical',
        'dental',
        'CLINICA',
        'Spital',
        'FIZIOACTIV',
        'DOCTOR',
        'MEDIC',
        'ANALIZE',
        'CONSULTATIE',
        'ARISTOMED',
        'PADMD',
        'ortopedie',
        'neurologie',
        'HIPERDIA',
      ],
      category: TransactionCategory.HEALTHCARE,
    },

    // ============ GYM & FITNESS ============
    {
      keywords: [
        'GYM',
        'FITNESS',
        'THE ONE GYM',
        'STAY FIT',
        'SALA',
        'ANTRENAMENT',
        'ABONAMENT SALA',
      ],
      category: TransactionCategory.GYM_FITNESS,
    },

    // ============ CLOTHING & ACCESSORIES ============
    {
      keywords: [
        'H&M',
        'PULL & BEAR',
        'BERSHKA',
        'ZARA',
        'CROPP',
        'LC WAIKIKI',
        'NEW YORKER',
        'RESERVED',
        'SINSAY',
        'C&A',
        'STRADIVARIUS',
        'H&M RO',
        'PULL BEAR',
        'LC WAIKIKI',
      ],
      category: TransactionCategory.CLOTHING_ACCESSORIES,
    },

    // ============ ELECTRONICS ============
    {
      keywords: [
        'ALTEX',
        'FLANCO',
        'MEDIA GALAXY',
        'TECH',
        'LAPTOP',
        'PHONE',
        'telefon',
        'tableta',
        'calculator',
        'componente',
      ],
      category: TransactionCategory.ELECTRONICS,
    },

    // ============ HOME IMPROVEMENT ============
    {
      keywords: [
        'DEDEMAN',
        'JYSK',
        'HORNBACH',
        'Brico',
        'MOBILA',
        'DECOR',
        'mobila',
        'decoratiuni',
        'unelte',
        'scule',
        'PRAVALIE',
        'LA CHIFLA',
      ],
      category: TransactionCategory.HOME_IMPROVEMENT,
    },

    // ============ SPORTS & OUTDOOR ============
    {
      keywords: [
        'DECATHLON',
        'INTERSPORT',
        'SPORT',
        'OUTDOOR',
        'HIKING',
        'CAMPING',
        'FITNESS',
        'EQUIPAMENT SPORTIV',
      ],
      category: TransactionCategory.SPORTS_OUTDOOR,
    },

    // ============ SHOPPING (general) ============
    {
      keywords: [
        'EMAG',
        'SHOPPING',
        'MAGAZIN',
        'STORE',
        'ALTE',
        'Cumparaturi',
        'shopping',
        'XIN NEW FASHION',
        'China Shopping Mall',
        'Galati Shopping City',
        'MFM SHOPPING',
        'SHOPPING CITY',
        'PEPCO',
        'Trendyol',
      ],
      category: TransactionCategory.SHOPPING,
      excludeKeywords: ['CINEMA', 'RESTAURANT', 'PIZZA', 'GROCERY', 'MARKET'],
    },

    // ============ ONLINE GAMING ============
    {
      keywords: [
        'STEAM',
        'G2A.COM',
        'GAMING',
        'GAME',
        'PLAYSTATION',
        'XBOX',
        'STEAMGAMES',
        'Battle.net',
        'EPIC GAMES',
        'ORIGIN',
        'UBISOFT',
      ],
      category: TransactionCategory.ONLINE_GAMING,
    },

    // ============ ENTERTAINMENT ============
    {
      keywords: [
        'CINEMA CITY',
        'cinemacity',
        'MOVIE',
        'CONCERT',
        'THEATRE',
        'TEATRU',
        'FILM',
        'CINEMA',
        'EVENTBOOK',
        'MUSEUM',
      ],
      category: TransactionCategory.ENTERTAINMENT,
    },

    // ============ SUBSCRIPTIONS ============
    {
      keywords: [
        'NETFLIX',
        'DISNEY PLUS',
        'Google One',
        'Google Payment',
        'Apple',
        'Prime Video',
        'GOOGLE PLAY',
        'Google YouTube',
        'YOUTUBE',
        'Spotify',
        'HBO',
        'Disney+',
      ],
      category: TransactionCategory.SUBSCRIPTION,
    },

    // ============ TRANSPORT ============
    {
      keywords: [
        'TRANSURB',
        'CFR',
        'RATBV',
        'UBER',
        'BOLT',
        'TAXI',
        'Transport',
        'AUTOBUZ',
        'TRAMVAI',
        'METROU',
        'TRANSFEROVIAR',
        'SNTFC',
        'bilet tren',
        'bilet autobuz',
        'STB SA',
        'PAYPOINT SERVICES SRL BUCURESTI',
        'PTP ONLINE BUCURESTI',
      ],
      category: TransactionCategory.TRANSPORT,
    },

    // ============ PARKING & TOLLS ============
    {
      keywords: ['PARKING', 'PARCARE', 'TOLL', 'POD', 'taxa pod', 'vigneta'],
      category: TransactionCategory.PARKING_TOLLS,
    },

    // ============ TRAVEL & ACCOMMODATION ============
    {
      keywords: [
        'BOOKING.COM',
        'HOTEL',
        'CAZARE',
        'AIRBNB',
        'ACCOMMODATION',
        'FLIGHT',
        'ZBOR',
        'AVION',
        'VACANTA',
        'SEJOUR',
        'HOSTEL',
        'Pensiune',
        'Motel',
      ],
      category: TransactionCategory.TRAVEL_ACCOMMODATION,
    },

    // ============ EDUCATION ============
    {
      keywords: [
        'UNIVERSITATEA',
        'CURS',
        'COURSE',
        'SCUOLA',
        'SCHOOL',
        'EDUCATION',
        'TAX SCOLAR',
        'UNIVERSITY',
        'FACULTATE',
        'LICENTA',
        'MASTER',
        'SCOALA',
        'GRADINITA',
      ],
      category: TransactionCategory.EDUCATION,
    },

    // ============ RENT ============
    {
      keywords: ['CHIRIE', 'RENT', 'APARTMENT', 'GARSONIERA', 'LOUIER'],
      category: TransactionCategory.RENT,
    },

    // ============ PERSONAL CARE ============
    {
      keywords: [
        'SALON',
        'HAIRCUT',
        'FRIZER',
        'MANICURE',
        'PEDICURE',
        'BEAUTY',
        'SPA',
        'cosmetica',
        'parfum',
        'TABAC',
        'tigari',
        'vaping',
      ],
      category: TransactionCategory.PERSONAL_CARE,
    },

    // ============ ATM WITHDRAWALS ============
    {
      keywords: [
        'ATM',
        'RETRAGERE',
        'WITHDRAWAL',
        'BANCOMAT',
        'NCR',
        'ATM OMNIA',
        'ATM BTRA',
        'ATM ALPHA',
        'ATM MAGNUS',
        'ATM1018',
        'NCR06224',
        'CEC BANK GALATI',
        'BRD GALATI',
        'BANCOMAT GALATI',
        'ATM GALATI',
      ],
      category: TransactionCategory.ATM_WITHDRAWAL,
    },

    // ============ BANK FEES ============
    {
      keywords: [
        'COMMISION',
        'FEE',
        'TAXA ADMIN',
        'BANK FEE',
        'comision',
        'taxa lunar',
      ],
      category: TransactionCategory.BANK_FEES,
    },

    // ============ INSURANCE ============
    {
      keywords: [
        'ASIGURARE',
        'INSURANCE',
        'POLITA',
        'RCA',
        'CASCO',
        'sanatate',
      ],
      category: TransactionCategory.INSURANCE,
    },

    // ============ PET CARE ============
    {
      keywords: [
        'PET',
        'VETERINAR',
        'ANIMAL',
        'DOG',
        'CAT',
        'PET SHOP',
        'hrana caini',
        'veterinary',
      ],
      category: TransactionCategory.PET_CARE,
    },

    // ============ GIFTS ============
    {
      keywords: ['CADOU', 'GIFT', 'PRESENT', 'BOUQUET', 'FLOWERS', 'flori'],
      category: TransactionCategory.GIFTS,
    },

    // ============ TAXES & FINES ============
    {
      keywords: [
        'TAXE',
        'IMPozit',
        'FINE',
        'AMENDA',
        'TAX',
        'PENALTY',
        'impozit',
        'taxe locale',
        'primaria',
      ],
      category: TransactionCategory.TAXES_FINES,
    },

    // ============ DONATIONS ============
    {
      keywords: ['DONATIE', 'DONATION', 'CHARITY', 'ONG', 'sponsorizare'],
      category: TransactionCategory.DONATIONS,
    },

    // ============ INVESTMENTS ============
    {
      keywords: [
        'INVESTITIE',
        'STOCKS',
        'ACTIUNI',
        'FOND',
        'INVESTMENT',
        'trading',
      ],
      category: TransactionCategory.INVESTMENTS,
    },

    // ============ TRANSFERS ============
    {
      keywords: ['OPIB/1', 'OPINS/1', 'transfer bancar', 'plata catre'],
      category: TransactionCategory.TRANSFER,
      descriptionContains: [
        'Plata catre alta banca',
        'transfer',
        'rata',
        'credit',
      ],
      amountRange: { max: 0 },
    },

    // ============ INTERNAL TRANSFERS ============
    {
      keywords: [
        'Transfer intre conturile proprii',
        'Transfer in cont',
        'virare salariu',
        'virare chirii',
        'virare',
        'depunere economii',
        'Revolut',
      ],
      category: TransactionCategory.INTERNAL_TRANSFER,
    },
  ];

  static categorize(transaction: TransactionDomain): TransactionCategory {
    // If transaction is ignored
    if (transaction.ignored) {
      return TransactionCategory.OTHER;
    }

    const description = transaction.description?.toLowerCase() || '';
    const serviceProvider = transaction.serviceProvider?.toLowerCase() || '';
    const amount = transaction.amount || 0;
    const absAmount = Math.abs(amount);

    // RECEIVED MONEY (positive amounts)
    if (amount > 0) {
      // Salary detection
      if (
        description.includes('salariu') ||
        description.includes('solda') ||
        (description.includes('oph/1') && description.includes('salariu'))
      ) {
        return TransactionCategory.SALARY;
      }

      // Refunds
      if (
        description.includes('storno') ||
        description.includes('return') ||
        description.includes('ramburs')
      ) {
        return TransactionCategory.REFUNDS;
      }

      // Received money
      if (
        description.includes('opib/1') ||
        description.includes('opins') ||
        description.includes('oph/1')
      ) {
        return TransactionCategory.RECEIVED;
      }
    }

    // Check each rule for expenses (negative amounts)
    if (amount < 0) {
      for (const rule of this.rules) {
        // Skip income-related rules
        if (
          rule.category === TransactionCategory.SALARY ||
          rule.category === TransactionCategory.RECEIVED
        ) {
          continue;
        }

        // Check exclude keywords
        if (rule.excludeKeywords) {
          let excluded = false;
          for (const exclude of rule.excludeKeywords) {
            if (description.includes(exclude.toLowerCase())) {
              excluded = true;
              break;
            }
          }
          if (excluded) continue;
        }

        // Check keywords
        let matchFound = false;
        for (const keyword of rule.keywords) {
          const lowerKeyword = keyword.toLowerCase();
          if (
            description.includes(lowerKeyword) ||
            serviceProvider.includes(lowerKeyword)
          ) {
            matchFound = true;
            break;
          }
        }

        if (!matchFound) continue;

        // Check descriptionContains if specified
        if (rule.descriptionContains) {
          let containsMatch = false;
          for (const pattern of rule.descriptionContains) {
            if (description.includes(pattern.toLowerCase())) {
              containsMatch = true;
              break;
            }
          }
          if (!containsMatch) continue;
        }

        // Check amount range if specified
        if (rule.amountRange) {
          if (
            rule.amountRange.min !== undefined &&
            absAmount < rule.amountRange.min
          )
            continue;
          if (
            rule.amountRange.max !== undefined &&
            absAmount > rule.amountRange.max
          )
            continue;
        }

        return rule.category;
      }
    }

    // Default
    return TransactionCategory.OTHER;
  }

  static getCategoryLabel(category: TransactionCategory): string {
    const labels: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: 'Supermarket',
      [TransactionCategory.RESTAURANT_FASTFOOD]: 'Restaurants',
      [TransactionCategory.CAFE_BAKERY]: 'Cafe & Bakery',
      [TransactionCategory.DELIVERY]: 'Food Delivery',
      [TransactionCategory.GAS_STATION]: 'Fuel',
      [TransactionCategory.TRANSPORT]: 'Transport',
      [TransactionCategory.PARKING_TOLLS]: 'Parking & Tolls',
      [TransactionCategory.UTILITIES]: 'Utilities',
      [TransactionCategory.MOBILE_BILL]: 'Mobile Bill',
      [TransactionCategory.RENT]: 'Rent',
      [TransactionCategory.HOME_MAINTENANCE]: 'Home Maintenance',
      [TransactionCategory.SHOPPING]: 'Shopping',
      [TransactionCategory.CLOTHING_ACCESSORIES]: 'Clothing',
      [TransactionCategory.ELECTRONICS]: 'Electronics',
      [TransactionCategory.HOME_IMPROVEMENT]: 'Home Improvement',
      [TransactionCategory.SPORTS_OUTDOOR]: 'Sports & Outdoor',
      [TransactionCategory.PHARMACY]: 'Pharmacy',
      [TransactionCategory.HEALTHCARE]: 'Healthcare',
      [TransactionCategory.GYM_FITNESS]: 'Gym & Fitness',
      [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
      [TransactionCategory.ONLINE_GAMING]: 'Online Gaming',
      [TransactionCategory.SUBSCRIPTION]: 'Subscriptions',
      [TransactionCategory.SALARY]: 'Salary',
      [TransactionCategory.RECEIVED]: 'Money Received',
      [TransactionCategory.TRANSFER]: 'Bank Transfer',
      [TransactionCategory.INTERNAL_TRANSFER]: 'Internal Transfer',
      [TransactionCategory.REFUNDS]: 'Refunds',
      [TransactionCategory.BANK_FEES]: 'Bank Fees',
      [TransactionCategory.ATM_WITHDRAWAL]: 'ATM Withdrawal',
      [TransactionCategory.TRAVEL_ACCOMMODATION]: 'Travel & Accommodation',
      [TransactionCategory.EDUCATION]: 'Education',
      [TransactionCategory.INSURANCE]: 'Insurance',
      [TransactionCategory.PERSONAL_CARE]: 'Personal Care',
      [TransactionCategory.GIFTS]: 'Gifts',
      [TransactionCategory.PET_CARE]: 'Pet Care',
      [TransactionCategory.TAXES_FINES]: 'Taxes & Fines',
      [TransactionCategory.DONATIONS]: 'Donations',
      [TransactionCategory.INVESTMENTS]: 'Investments',
      [TransactionCategory.OTHER]: 'Other',
    };
    return labels[category] || 'Other';
  }

  static getCategoryColor(category: TransactionCategory): string {
    const colors: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: '#4CAF50',
      [TransactionCategory.RESTAURANT_FASTFOOD]: '#FF9800',
      [TransactionCategory.CAFE_BAKERY]: '#FFB74D',
      [TransactionCategory.DELIVERY]: '#FF5722',
      [TransactionCategory.GAS_STATION]: '#2196F3',
      [TransactionCategory.TRANSPORT]: '#795548',
      [TransactionCategory.PARKING_TOLLS]: '#5D4037',
      [TransactionCategory.UTILITIES]: '#9C27B0',
      [TransactionCategory.RENT]: '#8D6E63',
      [TransactionCategory.HOME_MAINTENANCE]: '#6D4C41',
      [TransactionCategory.HOME_IMPROVEMENT]: '#8D6E63',
      [TransactionCategory.SHOPPING]: '#E91E63',
      [TransactionCategory.CLOTHING_ACCESSORIES]: '#EC407A',
      [TransactionCategory.ELECTRONICS]: '#26C6DA',
      [TransactionCategory.SPORTS_OUTDOOR]: '#66BB6A',
      [TransactionCategory.PHARMACY]: '#00BCD4',
      [TransactionCategory.HEALTHCARE]: '#FF4081',
      [TransactionCategory.GYM_FITNESS]: '#7C4DFF',
      [TransactionCategory.ENTERTAINMENT]: '#FFC107',
      [TransactionCategory.ONLINE_GAMING]: '#7C4DFF',
      [TransactionCategory.SUBSCRIPTION]: '#009688',
      [TransactionCategory.SALARY]: '#8BC34A',
      [TransactionCategory.RECEIVED]: '#CDDC39',
      [TransactionCategory.TRANSFER]: '#607D8B',
      [TransactionCategory.INTERNAL_TRANSFER]: '#BDBDBD',
      [TransactionCategory.REFUNDS]: '#4DB6AC',
      [TransactionCategory.BANK_FEES]: '#BDBDBD',
      [TransactionCategory.ATM_WITHDRAWAL]: '#EF5350',
      [TransactionCategory.MOBILE_BILL]: '#3F51B5',
      [TransactionCategory.TRAVEL_ACCOMMODATION]: '#FF6F00',
      [TransactionCategory.EDUCATION]: '#66BB6A',
      [TransactionCategory.INSURANCE]: '#42A5F5',
      [TransactionCategory.PERSONAL_CARE]: '#FFA726',
      [TransactionCategory.GIFTS]: '#EC407A',
      [TransactionCategory.PET_CARE]: '#A1887F',
      [TransactionCategory.TAXES_FINES]: '#F44336',
      [TransactionCategory.DONATIONS]: '#AB47BC',
      [TransactionCategory.INVESTMENTS]: '#26A69A',
      [TransactionCategory.OTHER]: '#9E9E9E',
    };
    return colors[category] || '#9E9E9E';
  }
}

interface CategoryRule {
  keywords: string[];
  category: TransactionCategory;
  descriptionContains?: string[];
  amountRange?: { min?: number; max?: number };
  excludeKeywords?: string[];
}

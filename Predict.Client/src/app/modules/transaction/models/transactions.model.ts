import { DateUtils } from 'src/app/shared/utils/date.utils';

export enum TransactionCategory {
  SUPERMARKET = 'supermarket',
  RESTAURANT_FASTFOOD = 'restaurant_fastfood',
  DELIVERY = 'delivery',
  GAS_STATION = 'gas_station',
  UTILITIES = 'utilities',
  SHOPPING = 'shopping',
  PHARMACY = 'pharmacy',
  SALARY = 'salary',
  TRANSFER = 'transfer',
  TRANSPORT = 'transport',
  MOBILE_BILL = 'mobile_bill',
  SUBSCRIPTION = 'subscription',
  HEALTHCARE = 'healthcare',
  ENTERTAINMENT = 'entertainment',
  OTHER = 'other',
  RECEIVED = 'received',
  INTERNAL_TRANSFER = 'internal_transfer',
}

export interface CategoryRule {
  keywords: string[];
  category: TransactionCategory;
  descriptionContains?: string[];
  amountRange?: { min?: number; max?: number };
}

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
  ignored: boolean;
  category: TransactionCategory;
  categoryLabel: string;

  constructor(res: TransactionResponse) {
    Object.assign(this, res);

    this.registrationDate = DateUtils.fromSplittedStringToJsDate(
      res.registrationDate,
    );
    this.completionDate = DateUtils.fromSplittedStringToJsDate(
      res.completionDate,
    );

    this.serviceProvider = res.description?.split('|')[0] ?? null;
    this.ignored = [
      'Transfer intre conturile proprii',
      'WWW.ORANGE.RO CONTUL-MEU',
    ].some((x) => this.description.includes(x));

    this.category = TransactionCategorizer.categorize(this);
    this.categoryLabel = TransactionCategorizer.getCategoryLabel(this.category);
  }
}

class TransactionCategorizer {
  private static readonly rules: CategoryRule[] = [
    // SALARIES & RECEIVED MONEY
    {
      keywords: ['SALARIU', 'BONUS', 'INDEMNIZATIE', 'CHELT DEPL', 'DECONT'],
      category: TransactionCategory.SALARY,
      descriptionContains: ['OPH/1/23024602'],
    },
    {
      keywords: ['OPIB/1', 'OPINS'],
      category: TransactionCategory.RECEIVED,
      amountRange: { min: 0 },
      descriptionContains: ['Transfer intre', 'Facturi', 'Pizza', 'cadou'],
    },

    // SUPERMARKETS
    {
      keywords: [
        'LIDL',
        'KAUFLAND',
        'CARREFOUR',
        'PENNY',
        'PROFI',
        'Auchan',
        'MEGAIMAGE',
      ],
      category: TransactionCategory.SUPERMARKET,
    },

    // GAS STATIONS
    {
      keywords: ['OMV', 'MOL', 'ROMPETROL', 'LUKOIL', 'PETROL'],
      category: TransactionCategory.GAS_STATION,
    },

    // UTILITIES
    {
      keywords: [
        'ENGIE',
        'Pago*Engie',
        'Pago*Electrica',
        'Pago*Digi',
        'Pago*Orange',
        'RCS RDS',
      ],
      category: TransactionCategory.UTILITIES,
    },

    // MOBILE BILLS
    {
      keywords: ['WWW.ORANGE.RO', 'Orange Money'],
      category: TransactionCategory.MOBILE_BILL,
    },

    // SUBSCRIPTIONS
    {
      keywords: [
        'NETFLIX',
        'DISNEY PLUS',
        'Google One',
        'Google Payment',
        'Apple',
        'Prime Video',
      ],
      category: TransactionCategory.SUBSCRIPTION,
    },

    // RESTAURANTS & FAST FOOD
    {
      keywords: [
        'KFC',
        'MCDONALD',
        'BURGER KING',
        'PIZZA',
        'TACO',
        'STARBUCKS',
        'FOOD',
      ],
      category: TransactionCategory.RESTAURANT_FASTFOOD,
    },

    // DELIVERY SERVICES
    {
      keywords: ['Glovo', 'Wolt', 'TAZZ', 'Foodpanda', 'Bolt Food'],
      category: TransactionCategory.DELIVERY,
    },

    // PHARMACIES
    {
      keywords: [
        'FARMACIE',
        'CATENA',
        'MYOSOTIS',
        'DONA',
        'S.I.E.P.C.O.F.A.R.',
        'MEDIMFARM',
        'CLINICA SANTE',
      ],
      category: TransactionCategory.PHARMACY,
    },

    // SHOPPING
    {
      keywords: [
        'H&M',
        'PULL & BEAR',
        'BERSHKA',
        'ZARA',
        'CROPP',
        'LC WAIKIKI',
        'NEW YORKER',
        'PEPCO',
        'DECATHLON',
        'INTERSPORT',
        'DEDEMAN',
        'JYSK',
        'EMAG',
        'ALTEX',
        'Trendyol',
        'G2A.COM',
        'STEAM',
        'BOOKING.COM',
      ],
      category: TransactionCategory.SHOPPING,
    },

    // TRANSPORT
    {
      keywords: [
        'TRANSURB',
        'CFR',
        'RATBV',
        'UBER',
        'BOLT',
        'taxi',
        'Transport',
      ],
      category: TransactionCategory.TRANSPORT,
    },

    // ENTERTAINMENT
    {
      keywords: ['CINEMA CITY', 'cinemacity', 'MOVIE', 'CONCERT', 'THEATRE'],
      category: TransactionCategory.ENTERTAINMENT,
    },

    // HEALTHCARE
    {
      keywords: [
        'medlife',
        'CONSULT',
        'medical',
        'dental',
        'CLINICA',
        'Spital',
        'FIZIOACTIV',
      ],
      category: TransactionCategory.HEALTHCARE,
    },

    // INTERNAL TRANSFERS
    {
      keywords: ['Transfer intre conturile proprii', 'Transfer in cont'],
      category: TransactionCategory.INTERNAL_TRANSFER,
    },

    // TRANSFERS (external)
    {
      keywords: ['OPIB/1', 'OPINS/1'],
      category: TransactionCategory.TRANSFER,
      descriptionContains: ['Plata catre alta banca', 'transfer', 'rata'],
    },
  ];

  static categorize(transaction: TransactionDomain): TransactionCategory {
    // If transaction is ignored, return other
    if (transaction.ignored) {
      return TransactionCategory.OTHER;
    }

    // For received amounts that are positive
    if (transaction.amount && transaction.amount > 0) {
      if (transaction.description?.toLowerCase().includes('salariu')) {
        return TransactionCategory.SALARY;
      }
      if (
        transaction.description?.toLowerCase().includes('opib/1') ||
        transaction.description?.toLowerCase().includes('opins')
      ) {
        return TransactionCategory.RECEIVED;
      }
    }

    const description = transaction.description?.toLowerCase() || '';
    const serviceProvider = transaction.serviceProvider?.toLowerCase() || '';

    // Check each rule
    for (const rule of this.rules) {
      // Check amount range if specified
      if (rule.amountRange) {
        if (
          rule.amountRange.min !== undefined &&
          (transaction.amount || 0) < rule.amountRange.min
        )
          continue;
        if (
          rule.amountRange.max !== undefined &&
          (transaction.amount || 0) > rule.amountRange.max
        )
          continue;
      }

      // Check description contains patterns
      let keywordMatch = false;
      for (const keyword of rule.keywords) {
        if (
          description.includes(keyword.toLowerCase()) ||
          serviceProvider.includes(keyword.toLowerCase())
        ) {
          keywordMatch = true;
          break;
        }
      }

      if (!keywordMatch) continue;

      // Check additional description contains if specified
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

      return rule.category;
    }

    return TransactionCategory.OTHER;
  }

  static getCategoryLabel(category: TransactionCategory): string {
    const labels: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: 'Supermarket / Grocery',
      [TransactionCategory.RESTAURANT_FASTFOOD]: 'Restaurant / Fast Food',
      [TransactionCategory.DELIVERY]: 'Food Delivery',
      [TransactionCategory.GAS_STATION]: 'Gas Station',
      [TransactionCategory.UTILITIES]: 'Utilities',
      [TransactionCategory.SHOPPING]: 'Shopping',
      [TransactionCategory.PHARMACY]: 'Pharmacy',
      [TransactionCategory.SALARY]: 'Salary / Bonus',
      [TransactionCategory.TRANSFER]: 'Bank Transfer',
      [TransactionCategory.TRANSPORT]: 'Transport',
      [TransactionCategory.MOBILE_BILL]: 'Mobile Bill',
      [TransactionCategory.SUBSCRIPTION]: 'Subscription',
      [TransactionCategory.HEALTHCARE]: 'Healthcare',
      [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
      [TransactionCategory.OTHER]: 'Other',
      [TransactionCategory.RECEIVED]: 'Money Received',
      [TransactionCategory.INTERNAL_TRANSFER]: 'Internal Transfer',
    };
    return labels[category] || 'Other';
  }
}

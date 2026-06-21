import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  effect,
} from '@angular/core';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ReceiptsProductDomain } from '../../models/receipts-products.model';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ProductPriceTrendChartUtils } from '../../utils/products-price-trend.chart.util';

interface GroupedProduct {
  id: number;
  name: string;
  provider: string;
  count: number;
  totalQuantity: number;
  totalRevenue: number;
  avgPrice: number;
  latestDate: Date | null;
  dates: Date[];
  percentageOfTotalQuantity: number;
  percentageOfTotalRevenue: number;
}

interface PeriodGroup {
  id: string;
  title: string;
  year: number;
  monthIndex?: number;
  totalRevenue: number;
  totalQuantity: number;
  uniqueProducts: number;
  transactionCount: number;
  products: ReceiptsProductDomain[];
  multiple: GroupedProduct[];
  isExpanded: boolean;
  month?: string;
}

interface Receipt {
  id: string;
  receiptId: string;
  date: Date;
  totalPrice: number;
  totalQuantity: number;
  totalDiscount?: number;
  products: ReceiptsProductDomain[];
  provider: string;
  providerIcon: string;
  providerColor: string;
}

@Component({
  selector: 'p-most-common-products',
  imports: [
    CommonModule,
    NumberFormatPipe,
    ToggleButtonComponent,
    HighchartWrapperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './most-common-products.component.html',
  styleUrl: './most-common-products.component.scss',
})
export class MostCommonProductsComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  receipts = input<ReceiptsProductDomain[]>([]);

  // Chart cache for performance optimization
  private chartCache = new Map<string, any>();
  private chartLoading = new Map<string, boolean>();
  private chartLoaded = new Map<string, boolean>();

  viewMode = signal<'all' | 'monthly' | 'yearly' | 'receipts'>('monthly');
  expandedPeriodId = signal<string | null>(null);
  expandedReceiptId = signal<string | null>(null);

  // Modal state
  isModalOpen = signal<boolean>(false);
  selectedProduct = signal<GroupedProduct | null>(null);
  private modalChartOptions = signal<any>(null);

  // Provider mapping based on product name patterns
  private readonly providerMap = new Map<
    string,
    { name: string; icon: string; color: string }
  >([
    [
      'LIDL',
      {
        name: 'LIDL',
        icon: 'L',
        color: `linear-gradient(
          135deg,
          #0050AA 0%,
          #0050AA 50%,
          #ffc107 100%
        )`,
      },
    ],
    [
      'CARREFOUR',
      {
        name: 'CARREFOUR',
        icon: 'C',
        color: `linear-gradient(
          135deg,
          #1e3a8a 0%,
          #3b82f6 50%,
          #dc2626 100%
        )`,
      },
    ],
    [
      'KAUFLAND',
      {
        name: 'KAUFLAND',
        icon: 'K',
        color: `linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)`,
      },
    ],
  ]);

  // Effect to clear cache when receipts change
  constructor() {
    effect(() => {
      // Trigger when receipts change
      const currentReceipts = this.receipts();
      if (currentReceipts) {
        // Clear caches when data changes
        this.chartCache.clear();
        this.chartLoading.clear();
        this.chartLoaded.clear();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['receipts']) {
      // Clear all caches when input changes
      this.chartCache.clear();
      this.chartLoading.clear();
      this.chartLoaded.clear();
      this.cdr.markForCheck();
    }
  }

  hasPriceTrendChart(productName: string): any {
    return this.receipts().filter((r) => r.name === productName)?.length > 1;
  }

  // Optimized chart loading with caching
  getPriceTrendChartOptimized(productName: string): any {
    // Check if we already have the chart in cache
    if (this.chartCache.has(productName)) {
      return this.chartCache.get(productName);
    }

    // Check if chart is currently loading
    if (this.chartLoading.get(productName)) {
      return null;
    }

    // Mark as loading
    this.chartLoading.set(productName, true);

    // Use requestIdleCallback or setTimeout for non-blocking loading
    const loadChart = () => {
      try {
        const options = ProductPriceTrendChartUtils.getChart(
          this.receipts()?.filter((p) => p.name === productName) ?? [],
        );
        this.chartCache.set(productName, options);
        this.chartLoaded.set(productName, true);
        this.chartLoading.set(productName, false);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading chart for product:', productName, error);
        this.chartLoading.set(productName, false);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadChart, { timeout: 1000 });
    } else {
      setTimeout(loadChart, 50);
    }

    return null;
  }

  // Legacy method for compatibility (can be removed if not used elsewhere)
  getPriceTrentChart(productName: string) {
    return this.getPriceTrendChartOptimized(productName);
  }

  // Open modal for product
  openProductModal(product: GroupedProduct) {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
    // Pre-load chart data
    this.getModalChartOptions();
    this.cdr.markForCheck();
  }

  // Open modal from receipt product
  openProductModalFromReceipt(
    product: ReceiptsProductDomain,
    receipt: Receipt,
  ) {
    // Create a GroupedProduct from the receipt product
    const groupedProduct: GroupedProduct = {
      id: product.id,
      name: product.name,
      provider: product.provider,
      count: 1,
      totalQuantity: product.quantity ?? 0,
      totalRevenue: (product.price ?? 0) * (product.quantity ?? 0),
      avgPrice: product.price ?? 0,
      latestDate: product.purchasedDate ?? null,
      dates: [product.purchasedDate ?? new Date()],
      percentageOfTotalQuantity: 0,
      percentageOfTotalRevenue: 0,
    };
    this.openProductModal(groupedProduct);
  }

  // Get modal chart options
  getModalChartOptions(): any {
    const product = this.selectedProduct();
    if (!product) return null;

    if (this.modalChartOptions()) {
      return this.modalChartOptions();
    }

    // Get all receipts for this product
    const productReceipts = this.receipts().filter(
      (p) => p.name === product.name,
    );

    if (productReceipts.length <= 1) return null;

    const options = ProductPriceTrendChartUtils.getChart(productReceipts);
    this.modalChartOptions.set(options);
    return options;
  }

  // Close modal
  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    this.modalChartOptions.set(null);
  }

  onToggle(value: string) {
    if (value === 'All') {
      this.viewMode.set('all');
    } else if (value === 'Monthly') {
      this.viewMode.set('monthly');
    } else if (value === 'Yearly') {
      this.viewMode.set('yearly');
    } else if (value === 'Receipts') {
      this.viewMode.set('receipts');
    }
    this.expandedPeriodId.set(null);
    this.expandedReceiptId.set(null);
  }

  getSelectedViewLabel(): string {
    if (this.viewMode() === 'all') return 'All';
    if (this.viewMode() === 'monthly') return 'Monthly';
    if (this.viewMode() === 'yearly') return 'Yearly';
    return 'Receipts';
  }

  togglePeriod(periodId: string) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === periodId) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(periodId);
    }
  }

  toggleReceipt(receiptId: string) {
    const currentExpanded = this.expandedReceiptId();
    if (currentExpanded === receiptId) {
      this.expandedReceiptId.set(null);
    } else {
      this.expandedReceiptId.set(receiptId);
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month} ${date.getFullYear()}`;
  }

  getProviderFromProduct(provider: string): {
    name: string;
    icon: string;
    color: string;
  } {
    const upperName = provider.toUpperCase();
    for (const [key, value] of this.providerMap.entries()) {
      if (upperName.includes(key)) {
        return value;
      }
    }
    // Default for unknown providers
    return {
      name: 'STORE',
      icon: upperName.charAt(0) || 'S',
      color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    };
  }

  getProviderInitial(provider: string): string {
    return this.getProviderFromProduct(provider).icon;
  }

  getProviderGradient(provider: string): string {
    return this.getProviderFromProduct(provider).color;
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    }
    return [];
  });

  receiptGroups = computed((): Receipt[] => {
    if (this.viewMode() !== 'receipts') return [];

    const products = this.receipts();
    if (!products?.length) return [];

    const receiptMap = new Map<string, ReceiptsProductDomain[]>();

    for (const product of products) {
      const receiptKey =
        (product as any).receiptId ||
        product.purchasedDate?.getTime()?.toString() ||
        'unknown';

      if (!receiptMap.has(receiptKey)) {
        receiptMap.set(receiptKey, []);
      }
      receiptMap.get(receiptKey)!.push(product);
    }

    const receipts: Receipt[] = [];

    for (const [key, receiptProducts] of receiptMap.entries()) {
      const receiptDate = receiptProducts[0]?.purchasedDate || new Date();
      const totalPrice = receiptProducts.reduce(
        (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
        0,
      );
      const totalQuantity = receiptProducts.reduce(
        (sum, p) => sum + (p.quantity ?? 0),
        0,
      );

      // Determine provider from first product
      const firstProduct = receiptProducts[0];
      const provider = this.getProviderFromProduct(
        firstProduct?.provider || '',
      );

      receipts.push({
        id: `receipt-${key}`,
        receiptId: key,
        date: receiptDate,
        totalPrice,
        totalQuantity,
        products: receiptProducts,
        provider: provider.name,
        providerIcon: provider.icon,
        providerColor: provider.color,
      });
    }

    return receipts.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  getAllGroupedProducts = computed((): GroupedProduct[] => {
    if (this.viewMode() !== 'all') return [];

    const products = this.receipts();
    if (!products?.length) return [];

    const grouped = this.groupProducts(products);

    const totalRevenue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );

    return grouped
      .map((g) => ({
        ...g,
        percentageOfTotalRevenue:
          totalRevenue > 0 ? (g.totalRevenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  });

  private groupedByMonth = computed((): PeriodGroup[] => {
    const products = this.receipts();
    if (!products?.length) return [];

    const map = new Map<string, ReceiptsProductDomain[]>();
    for (const product of products) {
      const date = product.purchasedDate;
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(product);
    }

    return Array.from(map.entries())
      .map(([key, products]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const month = new Date(year, monthIndex).toLocaleString('default', {
          month: 'short',
        });
        const id = `month-${year}-${monthIndex}`;

        const processedData = this.processProducts(products);

        return {
          id,
          title: `${month} ${year}`,
          year,
          monthIndex,
          month,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private groupedByYear = computed((): PeriodGroup[] => {
    const products = this.receipts();
    if (!products?.length) return [];

    const map = new Map<number, ReceiptsProductDomain[]>();
    for (const product of products) {
      const date = product.purchasedDate;
      if (!date) continue;
      const year = date.getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(product);
    }

    return Array.from(map.entries())
      .map(([year, products]) => {
        const id = `year-${year}`;
        const processedData = this.processProducts(products);

        return {
          id,
          title: `${year}`,
          year,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => b.year - a.year);
  });

  private processProducts(products: ReceiptsProductDomain[]) {
    const grouped = this.groupProducts(products);

    const totalRevenue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );

    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.quantity ?? 0),
      0,
    );
    const uniqueProducts = new Set(products.map((p) => p.id)).size;

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfTotalRevenue:
        totalRevenue > 0 ? (g.totalRevenue / totalRevenue) * 100 : 0,
    }));

    const sortedGroups = groupsWithPercentages.sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    return {
      totalRevenue,
      totalQuantity,
      uniqueProducts,
      transactionCount: products.length,
      multiple: sortedGroups,
      products,
    };
  }

  totalRevenue = computed(() => {
    return this.receipts().reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );
  });

  totalItemsSold = computed(() => {
    return this.receipts().reduce((sum, p) => sum + (p.quantity ?? 0), 0);
  });

  uniqueProductsCount = computed(() => {
    return new Set(this.receipts().map((p) => p.id)).size;
  });

  averagePrice = computed(() => {
    const products = this.receipts();
    if (products.length === 0) return 0;
    const total = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
    return total / products.length;
  });

  private groupProducts(products: ReceiptsProductDomain[]): GroupedProduct[] {
    const map = new Map<number, GroupedProduct>();

    for (const product of products) {
      const id = product.id;
      const date = product.purchasedDate;

      if (!map.has(id)) {
        map.set(id, {
          id: product.id,
          name: product.name,
          provider: product.provider,
          count: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          avgPrice: 0,
          latestDate: null,
          dates: [],
          percentageOfTotalQuantity: 0,
          percentageOfTotalRevenue: 0,
        });
      }

      const g = map.get(id)!;
      g.count++;
      g.totalQuantity += product.quantity ?? 0;
      g.totalRevenue += (product.price ?? 0) * (product.quantity ?? 0);
      g.avgPrice = g.totalRevenue / g.totalQuantity;

      if (date) {
        g.dates.push(date);
        if (!g.latestDate || date > g.latestDate) {
          g.latestDate = date;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.totalRevenue !== a.totalRevenue
        ? b.totalRevenue - a.totalRevenue
        : b.totalQuantity - a.totalQuantity,
    );
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import Highcharts from 'highcharts';

export const tooltipPositioner: Highcharts.TooltipPositionerCallbackFunction =
  function (
    this: Highcharts.Tooltip,
    labelWidth: number,
    labelHeight: number,
    point: Highcharts.Point,
  ): { x: number; y: number } {
    const chart = this.chart;
    const chartWidth = chart.plotWidth;
    const chartLeft = chart.plotLeft;

    let x = Math.max(
      0,
      Math.min(
        point.plotX + chartLeft - labelWidth / 2,
        chartLeft + chartWidth - labelWidth,
      ),
    );
    let y = chart.plotTop + 10;

    return { x: x, y: y };
  };

@Component({
  selector: 'p-highcharts-wrapper',
  template: `<div class="card">
    <ng-content select="[p-highcharts-wrapper-content]"></ng-content>
    <div class="chart-container" style="width: 100%; height: 100%"></div>
  </div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighchartWrapperComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input({ required: true }) chartOptions: Highcharts.Options;
  private chart: Highcharts.Chart | undefined;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && changes['chartOptions']) {
      this.updateChart();
    } else if (this.chartOptions) {
      this.createChart();
    }
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const container = this.el.nativeElement.querySelector('.chart-container');
    if (!container || this.chart) return;

    const options: Highcharts.Options = {
      ...this.chartOptions,
      credits: { enabled: false },
      tooltip: {
        ...this.chartOptions.tooltip,
        positioner: tooltipPositioner,
      },
    };

    this.chart = Highcharts.chart(container, options);
  }

  private updateChart(): void {
    if (this.chart && this.chartOptions) {
      const updatedOptions: Highcharts.Options = {
        ...this.chartOptions,
        tooltip: {
          ...this.chartOptions.tooltip,
          positioner: tooltipPositioner,
        },
      };

      this.chart.update(updatedOptions);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-bid-count-chart',
  templateUrl: './bid-count-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BidCountChartComponent {
  @Input() set xAxisAuction(value: string[]) {
    this.xAxisData = value;
    this.updateChart();
  }
  @Input() set yAxisAuction(value: number[]) {
    this.yAxisData = value;
    this.updateChart();
  }
  xAxisData: string[];
  yAxisData: number[];
  @Input() timeDiff: string;
  @Input() lastInfo: number;

  last: number;

  colorScheme = {
    domain: [''],
  };

  constructor() {}

  // updates chart info upon input update
  updateChart() {
    if (this.xAxisData && this.yAxisData) {
      this.last = this.yAxisData[this.yAxisData.length - 1];
    }
  }
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bids-chart',
  templateUrl: './bids-chart.component.html',
})
export class BidsChartComponent {
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

  // update label for proper currency format
  axisFormat(val) {
    return '$' + val;
  }

  constructor() {}

  // updates chart info upon input update
  updateChart() {
    if (this.xAxisData && this.yAxisData) {
      this.last = this.yAxisData[this.yAxisData.length - 1];
    }
  }
}

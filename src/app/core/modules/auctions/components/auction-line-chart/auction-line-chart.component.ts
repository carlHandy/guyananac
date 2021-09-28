import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-auction-line-chart',
  templateUrl: './auction-line-chart.component.html',
})
export class AuctionLineChartComponent implements OnInit {
  @Input() xAxisValues: string[];
  @Input() yAxisValues: number[];
  @Input() set xAxisAuction(value: string[]) {
    this.xAxisValues = value;
    this.updateChart();
  }
  @Input() set yAxisAuction(value: number[]) {
    this.yAxisValues = value;
    this.updateChart();
  }
  @Input() color: string;
  @Input() formatting: any = null;

  results: any[] = [];

  colorScheme = {
    domain: ['#56DB98'],
  };

  ticks: string[];

  constructor(private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.colorScheme.domain = [this.color];
  }

  // update chart data upon updated inputs, builds all data needed for each auction charts
  updateChart() {
    if (this.xAxisValues && this.yAxisValues) {
      const res: { name: string; value: number }[] = [];
      const localTicks: string[] = [];
      for (let index = 0; index < this.xAxisValues.length; index++) {
        const formatedName = this.datePipe.transform(
          this.xAxisValues[index],
          'MM/dd, hh a'
        );
        res.push({
          name: formatedName,
          value: this.yAxisValues[index],
        });

        if (index % 5 === 0) {
          localTicks.push(formatedName);
        }
      }

      this.ticks = [...localTicks];

      this.results = [
        {
          name: '',
          series: res,
        },
      ];
    }
  }
}

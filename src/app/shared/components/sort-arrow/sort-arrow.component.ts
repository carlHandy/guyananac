import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-sort-arrow',
  templateUrl: './sort-arrow.component.html',
  styles: [
    `
      .arrow {
        color: var(--color-grey) !important;
      }

      .arrow:hover {
        color: var(--color-accent) !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortArrowComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

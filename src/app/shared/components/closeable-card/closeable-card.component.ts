import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-closeable-card',
  templateUrl: './closeable-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseableCardComponent {
  show = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) {}

  // toggles the card display
  toggleView() {
    this.show = !this.show;
  }
}

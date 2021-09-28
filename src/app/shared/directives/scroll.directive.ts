import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appScroll]',
})
export class ScrollDirective {
  @Output() bottomReached = new EventEmitter<boolean>();

  constructor(public el: ElementRef) {}

  // emits event on scroll status for a scrollable component
  @HostListener('scroll', ['$event'])
  onScroll(e: Event) {
    const target = e.target as HTMLElement;
    const top = target.scrollTop;
    const height = this.el.nativeElement.scrollHeight;
    const offset = this.el.nativeElement.offsetHeight;

    if (top > height - offset - 1) {
      this.bottomReached.emit(true);
    }
  }
}

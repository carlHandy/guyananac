import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loader-box',
  templateUrl: './loader-box.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderBoxComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}

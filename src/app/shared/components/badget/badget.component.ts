import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-badget',
  templateUrl: './badget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgetComponent implements OnInit {
  @Input() color: string = '';

  constructor() {}

  ngOnInit(): void {}
}

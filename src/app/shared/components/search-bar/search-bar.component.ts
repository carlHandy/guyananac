import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Output('onSearch')
  onSearchOutput: EventEmitter<string> = new EventEmitter<string>();

  // emits event when user have typed something on the input
  onSearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    const searchValue = filterValue.trim().toLowerCase();
    this.onSearchOutput.next(searchValue);
    return;
  }
}

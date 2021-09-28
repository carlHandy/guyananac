import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-editable-image',
  templateUrl: './editable-image.component.html',
  styleUrls: ['./editable-image.component.scss'],
})
export class EditableImageComponent {
  @Input() set imageUrl(value: string | null | undefined) {
    this.buildUrl(value);
  }
  @Input() square = false;
  @Input() basePath = 'assets/images/empty.jpg';
  _url: string = ``;
  constructor() {}

  // build url for editable image background
  buildUrl(url: string) {
    if (!url) {
      this._url = `URL("${this.basePath}")`;
    } else {
      this._url = `URL("${url}")`;
    }
  }
}

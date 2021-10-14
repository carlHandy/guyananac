import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import * as FullStory from '@fullstory/browser';

@Component({
  selector: 'app-root',
  template: `
    <ngx-spinner template="<img src='assets/images/logo.svg' />" color="#fff"
      ><p style="color: white">
        Generating report, please wait...
      </p></ngx-spinner
    >
    <div style="max-width: 1920px">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  currentApplicationVersion = environment.appVersion;

  constructor(private meta: Meta) {
    FullStory.init({orgId: '15RXMA'});
    this.meta.addTag({
      name: 'version',
      content: `v${this.currentApplicationVersion}`,
    });
  }
}

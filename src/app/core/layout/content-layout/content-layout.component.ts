import { Component, Renderer2, Inject, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationsService } from '@shared/services/notifications.service';
import { environment } from 'src/environments/environment';
import { AuctionFiltersService } from '../../../shared/services/auction-filters.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styles: [
    `
      .sidenav-container {
        height: 100%;
        background-color: #f4f3ef;
      }

      .sidenav {
        width: 100%;
        max-width: 260px;
      }

      .sidenav .mat-toolbar {
        background: inherit;
      }

      .mat-toolbar.mat-primary {
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .mat-icon {
        color: #f6ebb8;
      }
    `,
  ],
})
export class ContentLayoutComponent implements OnInit, OnDestroy {
  currentApplicationVersion = environment.appVersion;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private notificationService: NotificationsService,
    private auctionFiltersService: AuctionFiltersService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.notificationService.getNotifications();
  }

  ngOnDestroy(): void {
    this.hideZendesk();
  }

  ngOnInit(): void {
    this.createZendesk();

    setTimeout(() => {
      this.prefillZendesk();
      this.showZendesk();
    }, 1000);
  }

  // injects zendesk script for creating the pop up
  createZendesk() {
    let script = this._renderer2.createElement('script');
    script.id = `ze-snippet`;
    script.src = environment.zendeskUrl;

    this._renderer2.appendChild(this._document.head, script);
  }

  // prefills zendesk form
  prefillZendesk() {
    const seller = this.authService.baseSeller;

    const name = `${seller.firstName} ${seller.lastName}`;
    const email = seller.email;
    const phone = seller.phone;

    let prefill = this._renderer2.createElement('script');
    prefill.type = `text/javascript`;
    prefill.text = `
  zE('webWidget', 'prefill', {
    name: {
      value: '${name}',
      readOnly: true // optional
    },
    email: {
      value: '${email}',
      readOnly: true // optional
    },
    phone: {
      value: '${phone}',
      readOnly: true // optional
    }
  });
  `;

    this._renderer2.appendChild(this._document.body, prefill);
  }

  // makes button and dialog visible
  showZendesk() {
    let show = this._renderer2.createElement('script');
    show.type = `text/javascript`;
    show.text = `
  zE('webWidget', 'show');
  `;

    this._renderer2.appendChild(this._document.body, show);
  }

  // makes button and dialog invisible
  hideZendesk() {
    let hide = this._renderer2.createElement('script');
    hide.type = `text/javascript`;
    hide.text = `
    zE('webWidget', 'hide');
    `;

    this._renderer2.appendChild(this._document.body, hide);
  }

  // signs the user out
  signOut() {
    this.authService.logout();
  }

  // notifies when bottom of scrollable section is reached, this is used for auction pagination
  bottomReached() {
    this.auctionFiltersService.loadPage();
  }
}

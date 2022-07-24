import { Component, Inject, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';
import { environment } from 'src/environments/environment';
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
export class ContentLayoutComponent implements OnInit {
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
    @Inject(DOCUMENT) private _document: Document
  ) {
  }

  ngOnInit(): void {
  }

  // signs the user out
  signOut() {
    this.authService.logout();
  }
}

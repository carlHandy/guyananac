import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Router } from '@angular/router';

// rxjs
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

// services
import { AuthService } from '../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // can activate route angular interface
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAccount();
  }

  // can load module angular interface
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.checkAccount();
  }

  // checks if user and seller are present in the auth state
  private checkAccount(): Observable<boolean> {
    return this.authService.seller.pipe(
      switchMap((seller) => {
        if (!seller) {
          return this.authService.user.pipe(
            map((user) => {
              if (user) {
                // USER FOUND - SELLER NOT FOUND
                this.router.navigateByUrl('/auth/sign-up/details');
              } else {
                // USER NOT FOUND - SELLER NOT FOUND
                this.router.navigateByUrl('/auth/sign-in');
              }
              return false;
            })
          );
        } else {
          return this.authService.user.pipe(
            map((user) => {
              if (user) {
                if (
                  user.providerData[0].providerId === 'password' &&
                  !user.emailVerified
                ) {
                  // USER FOUND - SELLER FOUND - EMAIL NOT VALIDATED
                  this.authService.logoutNoRedirect();

                  this.router.navigateByUrl('/auth/sign-in');
                  return false;
                } else {
                  // USER FOUND - SELLER FOUND - EMAIL VALIDATED
                  return true;
                }
              } else {
                // USER NOT FOUND - SELLER FOUND'
                this.router.navigateByUrl('/auth/sign-in');
                return false;
              }
            })
          );
        }
      }),
      map((result: boolean) => {
        return result;
      })
    );
  }
}

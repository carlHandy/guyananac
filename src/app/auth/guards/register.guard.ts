import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

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

  // checks whenever the athlete is present in auth state
  private checkAccount(): Observable<boolean> {
    return this.authService.athlete.pipe(
      switchMap((seller) => {
        if (seller) {
          this.router.navigateByUrl('/auctions');
          return of(false);
        } else {
          return this.authService.user.pipe(
            map((user) => {
              if (user) {
                return true;
              } else {
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

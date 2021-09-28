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
import { Observable } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate, CanLoad {
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

  // checks whenever the user is already authenticated
  private checkAccount(): Observable<boolean> {
    return this.authService.seller.pipe(
      map((seller) => {
        if (seller) {
          this.router.navigateByUrl('/auctions');
          return false;
        } else {
          return true;
        }
      })
    );
  }
}

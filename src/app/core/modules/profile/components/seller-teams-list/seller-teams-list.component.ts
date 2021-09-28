import { Component, ChangeDetectionStrategy } from '@angular/core';

// rxjs
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// services
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-seller-teams-list',
  templateUrl: './seller-teams-list.component.html',
})
export class SellerTeamsListComponent {
  teamsIds$: Observable<string[]>;

  constructor(private authService: AuthService) {
    this.teamsIds$ = this.authService.seller.pipe(
      filter((s) => s != null),
      map((seller) => seller.teamIds ?? [])
    );
  }

  // used for ngfor optimization
  identify(_, item) {
    return item;
  }
}

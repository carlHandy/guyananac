import { Component, OnInit } from '@angular/core';

// services
import { AuthService } from '../../../shared/services/auth.service';

// rxjs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// models
import { NotificationPreferences } from '@shared/models/notification-preferences';
import { NotificationTypeEnum } from '@shared/enums/notification-type.enum';
import { SellerService } from '../../../shared/services/seller.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent implements OnInit {
  notificationPreferences$: Observable<NotificationPreferences>;
  constructor(
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    // getting preferences from the user
    this.notificationPreferences$ = this.authService.seller.pipe(
      map((seller) => {
        if (!seller.notificationPref) {
          return {
            important: false,
            info: false,
          };
        } else {
          return {
            important: seller.notificationPref.important,
            info: seller.notificationPref.info,
          };
        }
      })
    );
  }

  // preferences was toggle, update is handle for the given preference type
  onChange(value: boolean, type: NotificationTypeEnum) {
    switch (type) {
      case NotificationTypeEnum.Important:
        this.sellerService.updateSellerPreferences(value, 'important');
        break;

      case NotificationTypeEnum.Informational:
        this.sellerService.updateSellerPreferences(value, 'info');

        break;
    }
  }
}

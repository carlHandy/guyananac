import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// services
import { AuthService } from '../../../shared/services/auth.service';

// models
import { ProfileImage } from '../../modules/profile/models/view-models/profile-image.view-model';
import { SellerService } from '../../../shared/services/seller.service';
import { Seller } from '@shared/models/seller.model';
import { NotificationsService } from '../../../shared/services/notifications.service';

@Component({
  selector: 'app-user-notifications',
  templateUrl: './user-notifications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserNotificationsComponent implements OnInit {
  totalNotifications$: Observable<number>;
  profileImage$: Observable<ProfileImage>;
  seller$: Observable<Seller>;

  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.seller$ = this.authService.seller$;
    this.profileImage$ = this.sellerService.getImageURI();
    this.totalNotifications$ =
      this.notificationService.getNotificationsUnread();
  }

  // builds the proper initial of a given seller
  getInitials(seller: Seller) {
    let initials = '';

    if (seller.firstName) {
      initials += seller.firstName[0].toUpperCase();
    }

    if (seller.lastName) {
      initials += seller.lastName[0].toUpperCase();
    }

    return initials ? initials : 'N/A';
  }
}

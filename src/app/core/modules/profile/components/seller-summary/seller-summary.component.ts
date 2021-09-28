import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// models
import { AddressCountryEnum } from '@shared/enums/address-country.enum';

// components
import { UpdateProfileImageDialog } from '../update-profile-image/update-profile-image.dialog';

// rxjs
import { Observable } from 'rxjs';

// models
import { ProfileImage } from '../../models/view-models/profile-image.view-model';

// services
import { SellerService } from '@shared/services/seller.service';
import { Seller } from '@shared/models/seller.model';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-seller-summary',
  templateUrl: './seller-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSummaryComponent implements OnInit {
  countryEnum = AddressCountryEnum;
  profileImage$: Observable<ProfileImage>;
  seller$: Observable<Seller>;
  constructor(
    private dialog: MatDialog,
    public sellerService: SellerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileImage$ = this.sellerService.getImageURI();
    this.seller$ = this.authService.seller;
  }

  // open profile image dialog for updating seller image
  openProfileImageDialog() {
    const dialogRef = this.dialog.open(UpdateProfileImageDialog, {
      data: {
        base: 'sellerImages',
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.url) {
        this.sellerService.updateImageURI(data.url);
      }
      if (data && data.removeImage) {
        this.sellerService.updateImageURI('');
      }
    });
  }
}

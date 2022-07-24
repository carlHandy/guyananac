import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// models
import { AddressCountry } from '@shared/enums/address-country.enum';

// components
import { UpdateProfileImageDialog } from '../update-profile-image/update-profile-image.dialog';

// rxjs
import { Observable } from 'rxjs';

// models
import { ProfileImage } from '../../models/view-models/profile-image.view-model';

// services
import { AthleteService } from '@shared/services/athlete.service';
import { Athlete } from '@shared/models/athlete.model';
import { AuthService } from '@shared/services/auth.service';

@Component({
  selector: 'app-athlete-summary',
  templateUrl: './athlete-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthleteSummaryComponent implements OnInit {
  countryEnum = AddressCountry;
  profileImage$: Observable<ProfileImage>;
  athlete$: Observable<Athlete>;
  constructor(
    private dialog: MatDialog,
    public athleteService: AthleteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileImage$ = this.athleteService.getImageURI();
    this.athlete$ = this.authService.athlete;
  }

  // open profile image dialog for updating seller image
  openProfileImageDialog() {
    const dialogRef = this.dialog.open(UpdateProfileImageDialog, {
      data: {
        base: 'athleteImages',
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.url) {
        this.athleteService.updateImageURI(data.url);
      }
      if (data && data.removeImage) {
        this.athleteService.updateImageURI('');
      }
    });
  }
}

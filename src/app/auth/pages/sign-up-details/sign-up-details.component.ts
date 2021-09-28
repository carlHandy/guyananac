import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// material
import { MatSnackBar } from '@angular/material/snack-bar';

// models
import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { Seller } from '@shared/models/seller.model';

// services
import { AuthService } from '@shared/services/auth.service';
import { SellerService } from '@shared/services/seller.service';

// utils
import { TeamsService } from '@shared/services/teams.service';
import { createBaseSeller } from '@shared/utils/seller';
import { TimeZonesService } from '@shared/services/time-zones.service';
import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';

@Component({
  templateUrl: './sign-up-details.component.html',
  styles: [
    `
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 700px;
        }
      }
      .content-box {
        min-height: calc(100vh - 224px);
      }
    `,
  ],
})
export class SignUpDetailsComponent implements OnInit {
  accountForm: FormGroup;
  countryEnum = AddressCountryEnum;
  requesting: boolean = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private sellerService: SellerService,
    private teamsService: TeamsService,
    private timeZonesService: TimeZonesService
  ) {
    this.accountForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {}

  // finished the sign up method with seller details
  completeAccount() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.requesting = true;

    // base user
    const baseUser = this.authService.baseUser;
    const { firstName, lastName, country } = this.accountForm.value;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let sellerTimeZone = this.timeZonesService.defaultTimeZoneValue;
    if (this.timeZonesService.containsTimeZone(userTimeZone)) {
      sellerTimeZone = userTimeZone;
    }

    const newSeller = createBaseSeller(
      baseUser,
      firstName,
      lastName,
      country,
      sellerTimeZone
    );

    this.sellerService
      .createSeller(newSeller)
      .then(() => {
        if (baseUser.providerData[0].providerId === 'password') {
          this.router.navigateByUrl('/auth/register-success');
        } else {
          this.router.navigateByUrl('/auctions');
        }
        // here i am assuming the user has not verified email
      })
      .catch((error) => {
        this.snackBar.open(error.message, null, { duration: 5000 });
        this.requesting = false;
      });
  }
}

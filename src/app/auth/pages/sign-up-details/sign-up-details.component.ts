import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// material
import { MatSnackBar } from '@angular/material/snack-bar';

// models
import { AddressCountry} from '@shared/enums/address-country.enum';
import { Athlete } from '@shared/models/athlete.model';
import { createBaseAthlete } from '@shared/utils/athlete';

// services
import { AuthService } from '@shared/services/auth.service';
import { AthleteService } from '@shared/services/athlete.service';

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
  requesting: boolean = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private athleteService: AthleteService,
    private authService: AuthService,
  ) {
    this.accountForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      isNationalAthlete: new FormControl(null, [Validators.required]),
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
    const { firstName, lastName, isNationalAthlete } = this.accountForm.value;
  

    const newAthlete = createBaseAthlete(
      baseUser,
      firstName,
      lastName,
      isNationalAthlete,
    );

    this.athleteService
      .createAthlete(newAthlete)
      .then(() => {
          this.router.navigateByUrl('/dashbord');
        // here i am assuming the user has not verified email
      })
      .catch((error) => {
        this.snackBar.open(error.message, null, { duration: 5000 });
        this.requesting = false;
      });
  }
}

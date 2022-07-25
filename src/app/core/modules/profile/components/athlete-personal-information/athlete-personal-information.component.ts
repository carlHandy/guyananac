import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// models
import { AddressCountry } from '@shared/enums/address-country.enum';
import { Athlete } from '@shared/models/athlete.model';
import { Address } from '@shared/models/address.model';

// services
import { AthleteService } from '@shared/services/athlete.service';
import { AuthService } from '@shared/services/auth.service';

// rxjs
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-athlete-personal-information',
  templateUrl: './athlete-personal-information.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AthletePersonalInformationComponent implements OnInit {
  athleteCountry: AddressCountry;
  athleteAddress: Address;
  sub: Subscription;
  personaInformation: FormGroup;
  addressForm: FormGroup;
  editMode = false;
  athlete: Athlete;
  loading = false;

  constructor(
    private authService: AuthService,
    private athleteService: AthleteService,
    private snackBar: MatSnackBar
  ) {
    this.personaInformation = new FormGroup({
      firstName: new FormControl('', [
        Validators.maxLength(256),
        Validators.required,
      ]),
      lastName: new FormControl('', [
        Validators.maxLength(256),
        Validators.required,
      ]),
      phone: new FormControl(''),
    });

    this.addressForm = new FormGroup({
      street: new FormControl('', [
        Validators.maxLength(256),
        Validators.required,
      ]),
      city: new FormControl('', [
        Validators.maxLength(256),
        Validators.required,
      ]),
      region: new FormControl('', [
        Validators.maxLength(256),
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.sub = this.authService.athlete.subscribe((athlete) => {
      if (athlete) {
        this.athlete = athlete;
        this.athleteAddress = athlete.address;
        this.fillForm();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // filling personal info form with athlete information
  fillForm() {
    this.personaInformation.get('firstName').setValue(this.athlete.firstName);
    this.personaInformation.get('lastName').setValue(this.athlete.lastName);
    this.personaInformation.get('phone').setValue(this.athlete.contact.phone);
    this.personaInformation.disable();
  }

  // handles the update of the information for the athlete
  updateInfo() {
    if (this.personaInformation.invalid) {
      this.personaInformation.markAllAsTouched();
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const { firstName, lastName, phone } =
      this.personaInformation.value;

    const { street, city, region } =
      this.addressForm.value;

    const formatedAddress: Address = {
      street: street ?? '',
      city: city ?? '',
      region: region ?? '',
    };

    this.athleteService
      .updatePersonalInfo(
        firstName ?? '',
        lastName ?? '',
        phone ?? '',
        formatedAddress
      )
      .then(() => {
        this.snackBar.open(`Profile updated`, null, { duration: 5000 });
        this.editMode = false;
      })
      .catch((error) => {
        this.snackBar.open(`The profile couldn't be updated`, null, {
          duration: 5000,
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // disables form inputs
  disableForm() {
    this.personaInformation.disable();
  }

  // enables form inputs
  enableForm() {
    this.personaInformation.enable();
  }
}

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
import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { ContactMethodEnum } from '@shared/enums/contact-method.enum';
import { TimeZone } from '@shared/models/time-zone.model';
import { Seller } from '@shared/models/seller.model';
import { Address } from '@shared/models/address.model';

// services
import { TimeZonesService } from '@shared/services/time-zones.service';
import { SellerService } from '@shared/services/seller.service';
import { AuthService } from '@shared/services/auth.service';

// rxjs
import { Subscription } from 'rxjs';

// components
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';

@Component({
  selector: 'app-seller-personal-information',
  templateUrl: './seller-personal-information.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerPersonalInformationComponent implements OnInit {
  timeZones: TimeZone[] = [];
  sellerCountry: AddressCountryEnum;
  sellerAddress: Address;
  contactMethod = ContactMethodEnum;
  sub: Subscription;
  personaInformation: FormGroup;
  editMode = false;
  seller: Seller;
  loading = false;
  @ViewChild(AddressFormComponent) addressForm: AddressFormComponent;

  constructor(
    private timeZonesService: TimeZonesService,
    private authService: AuthService,
    private sellerService: SellerService,
    private snackBar: MatSnackBar
  ) {
    this.timeZones = this.timeZonesService.getTimeZones();
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
      contactMethod: new FormControl(''),
      timeZone: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.sub = this.authService.seller.subscribe((seller) => {
      if (seller) {
        this.seller = seller;
        this.sellerCountry = seller.country;
        this.sellerAddress = seller.mailingAddress;
        this.fillForm();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // filling personal info form with seller information
  fillForm() {
    this.personaInformation.get('firstName').setValue(this.seller.firstName);
    this.personaInformation.get('lastName').setValue(this.seller.lastName);
    this.personaInformation.get('phone').setValue(this.seller.phone);
    this.personaInformation
      .get('contactMethod')
      .setValue(this.seller.preferredContactMethod);
    this.personaInformation.get('timeZone').setValue(this.seller.timezone);
    this.personaInformation.disable();
  }

  // handles the update of the information for the seller
  updateInfo() {
    if (this.personaInformation.invalid) {
      this.personaInformation.markAllAsTouched();
      return;
    }

    if (this.addressForm.addressFormGroup.invalid) {
      this.addressForm.addressFormGroup.markAllAsTouched();
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const { firstName, lastName, phone, contactMethod, timeZone } =
      this.personaInformation.value;

    const { address, unitSuit, cityTown, provinceState, postalCode } =
      this.addressForm.addressFormGroup.value;

    const formatedAddress: Address = {
      address: address ?? '',
      unitSuite: unitSuit ?? '',
      cityTown: cityTown ?? '',
      stateProvince: provinceState ?? '',
      postalZip: postalCode ?? '',
      country: this.sellerCountry,
    };

    this.sellerService
      .updatePersonalInfo(
        firstName ?? '',
        lastName ?? '',
        phone ?? '',
        contactMethod ?? '',
        timeZone ?? '',
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

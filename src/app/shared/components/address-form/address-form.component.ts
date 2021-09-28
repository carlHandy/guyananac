import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// models
import { FormattedAddress } from '@shared/models/formatted-address.model';
import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { ProvinceState } from '@shared/models/province-state.model';

// services
import { ProvinceStateService } from '@shared/services/province-state.service';
import { Address } from '@shared/models/address.model';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  addressFormGroup: FormGroup;
  @Input() editMode = false;
  @Input() address: Address;
  @Input() set country(value: AddressCountryEnum) {
    this.setCountry(value);
  }
  @Input() set disabled(value: boolean) {
    if (value) {
      this.addressFormGroup.disable();
    } else {
      this.addressFormGroup.enable();
    }
  }
  provinceStateLabel = '';
  postalCodeLabel = '';
  countryLimit = 'CA';
  provincesStates: ProvinceState[] = [];
  constructor(
    private provinceStateService: ProvinceStateService,
    private ngZone: NgZone
  ) {
    this.addressFormGroup = new FormGroup({
      address: new FormControl('', [
        Validators.required,
        Validators.maxLength(256),
      ]),
      unitSuit: new FormControl('', [Validators.maxLength(20)]),
      cityTown: new FormControl('', [Validators.maxLength(100)]),
      provinceState: new FormControl(''),
      postalCode: new FormControl('', [Validators.maxLength(20)]),
    });
  }

  ngOnInit(): void {
    // is addres is provided fill the form with the address data
    if (this.address) {
      this.fillAddress(this.address);
    }
  }

  // set different options for the form depending on the country
  setCountry(country: AddressCountryEnum) {
    this.addressFormGroup.get('postalCode')?.clearValidators();

    if (!country || country === AddressCountryEnum.Canada) {
      this.postalCodeLabel = 'Postal Code';
      this.provinceStateLabel = 'Province';
      this.provincesStates = this.provinceStateService.getProvinceList();
      this.countryLimit = 'CA';
      this.addressFormGroup
        .get('postalCode')
        ?.setValidators([
          Validators.pattern('^([a-zA-Z]\\d[a-zA-Z] *\\d[a-zA-Z]\\d)$'),
        ]);
    } else {
      this.postalCodeLabel = 'ZIP Code';
      this.provinceStateLabel = 'State';
      this.provincesStates = this.provinceStateService.getStateList();
      this.countryLimit = 'US';
      this.addressFormGroup
        .get('postalCode')
        ?.setValidators([Validators.pattern('^(\\d{5}(-\\d{4})?)$')]);
    }

    this.addressFormGroup.get('postalCode')?.updateValueAndValidity();
  }

  // handles google api response
  syncAutoComplete(fa: FormattedAddress) {
    // fixes form no updating properly
    this.ngZone.run(() => {
      if (fa.postalZip) {
        this.addressFormGroup.get('postalCode').patchValue(fa.postalZip);
      }
      if (fa.stateProvince) {
        this.addressFormGroup.get('provinceState').patchValue(fa.stateProvince);
      }
      if (fa.cityTown) {
        this.addressFormGroup.get('cityTown').patchValue(fa.cityTown);
      }
      if (fa.autocompletedAddress) {
        this.addressFormGroup
          .get('address')
          .patchValue(fa.autocompletedAddress.split(',')[0]);
      }
    });
  }

  // return provice states
  getProvincesStates() {
    return this.provincesStates;
  }

  // fills the form for a given address
  fillAddress(address: Address) {
    if (this.addressFormGroup) {
      this.addressFormGroup.get('address').reset();
      this.addressFormGroup
        .get('address')
        .patchValue(address.address.split(',')[0]);
      this.addressFormGroup.get('unitSuit').patchValue(address.unitSuite);
      this.addressFormGroup.get('cityTown').patchValue(address.cityTown);
      this.addressFormGroup
        .get('provinceState')
        .patchValue(address.stateProvince);
      this.addressFormGroup.get('postalCode').patchValue(address.postalZip);
    }
  }
}

/// <reference types="@types/googlemaps" />
import {
  Directive,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormattedAddress } from '@shared/models/formatted-address.model';

@Directive({
  selector: '[appGooglePlaces]',
})
export class GooglePlacesDirective {
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Input() countryCode = 'CA';
  private element: HTMLInputElement;

  constructor(private elRef: ElementRef) {
    this.element = elRef.nativeElement;
  }

  ngOnInit() {
    const autocomplete = new google.maps.places.Autocomplete(this.element);
    autocomplete.setComponentRestrictions({ country: [this.countryCode] });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // Emit the new address object for the updated place
      this.selected.emit(this.getFormattedAddress(autocomplete.getPlace()));
    });
  }

  // get formatted address from google places api
  getFormattedAddress(place: any): FormattedAddress {
    const fa: FormattedAddress = {
      autocompletedAddress: '',
      cityTown: '',
      country: '',
      stateProvince: '',
      postalZip: '',
      street: '',
      streetNumber: '',
      lat: '',
      lng: '',
    };
    if (!place) {
      return fa;
    }
    fa.autocompletedAddress = place.formatted_address;
    place.address_components.forEach((component) => {
      if (!component.types) {
        return;
      }
      component.types.forEach((type) => {
        if (type === 'route') {
          fa.street = component.long_name;
        }
        if (type === 'street_number') {
          fa.streetNumber = component.long_name;
        }
        if (type === 'locality') {
          fa.cityTown = component.long_name;
        }
        if (type === 'administrative_area_level_1') {
          fa.stateProvince = component.short_name;
        }
        if (type === 'country') {
          fa.country = component.short_name;
        }
        if (type === 'postal_code') {
          fa.postalZip = component.long_name;
        }
      });
      fa.lat = Number(place.geometry.location.lat()).toFixed(6);
      fa.lng = Number(place.geometry.location.lng()).toFixed(6);
    });
    return fa;
  }
}

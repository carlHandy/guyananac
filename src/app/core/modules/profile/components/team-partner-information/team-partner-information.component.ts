import { Address } from './../../../../../shared/models/address.model';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';

// models
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Partner } from '@shared/models/partner.model';
import { Team } from '@shared/models/team.model';

// services
import { TeamsService } from '@shared/services/teams.service';
import { AuctionsService } from '@shared/services/auctions.service';
import { AuthService } from '@shared/services/auth.service';

// utils
import { UpdateProfileImageDialog } from '../update-profile-image/update-profile-image.dialog';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-team-partner-information',
  templateUrl: './team-partner-information.component.html',
})
export class TeamPartnerInformationComponent implements OnInit {
  @Input() partnerProfile: Partner | undefined;
  @Input() team: Team;
  loading = false;
  partnerForm: FormGroup;
  editMode: false;
  amToken: string;
  auction_ids = [];
  list = '';

  @ViewChild(AddressFormComponent) addressForm: AddressFormComponent;

  constructor(
    private teamsService: TeamsService,
    private auctionsService: AuctionsService,
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.partnerForm = new FormGroup({
      companyName: new FormControl('', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      shopUrl: new FormControl('', [
        Validators.maxLength(256),
      ]),
      companyDescription: new FormControl('', [
        Validators.required,
        Validators.maxLength(5000),
      ]),
      companyHomePage: new FormControl('', [
        Validators.required,
        Validators.maxLength(256),
      ]),
    });
    this.disableForm();
  }

  ngOnInit(): void {
    if (this.partnerProfile != undefined) {
      this.fillForm();
    }
    this.get360Token();
  }

  // fills the partner information info if team is a partner
  fillForm() {
    this.partnerForm
      .get('companyName')
      .patchValue(this.partnerProfile.companyName);
    this.partnerForm.get('shopUrl').patchValue(this.partnerProfile.shopPageURL);
    this.partnerForm
      .get('companyDescription')
      .patchValue(this.partnerProfile.companyDesc);
    this.partnerForm
      .get('companyHomePage')
      .patchValue(this.partnerProfile.companyURL);
  }

  async get360Token() {
    const token = await this.authService.baseUser.getIdToken();
    return this.http.get(`${environment.cloudFunctionsBaseUrl}get360Token`, 
    {
        headers: {
          'authorization': token,
          'Content-Type': 'application/json',
        },
    })
      .subscribe(response => {
        this.amToken = response["body"].data.token;
    });
  }

  // updates partner information
  update() {
    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched();
    }

    if (this.addressForm.addressFormGroup.invalid) {
      this.addressForm.addressFormGroup.markAllAsTouched();
    }

    if (this.partnerForm.invalid || this.addressForm.addressFormGroup.invalid) {
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const { address, unitSuit, cityTown, provinceState, postalCode } =
      this.addressForm.addressFormGroup.value;

    const formatedAddress: Address = {
      address,
      unitSuite: unitSuit,
      cityTown,
      stateProvince: provinceState,
      postalZip: postalCode,
      country: this.team.teamCountry ?? AddressCountryEnum.Canada,
    };

    const { companyName, companyDescription, companyHomePage } =
      this.partnerForm.value;
    this.teamsService
      .updatePartner(
        this.team.teamId,
        companyName,
        this.partnerProfile.shopPageURL ?? '',
        companyDescription,
        companyHomePage,
        this.partnerProfile?.logoURL ?? '',
        formatedAddress
      )
      .then(() => {
        this.snackBar.open(`Partner information updated`, null, {
          duration: 5000,
        });
        this.editMode = false;
        this.disableForm();
      })
      .catch((error) => {
        this.snackBar.open(`Partner information couldn't be updated`, null, {
          duration: 5000,
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  // opens image dialog for updating team partnership image
  openPartnerImageDialog() {
    const dialogRef = this.dialog.open(UpdateProfileImageDialog, {
      data: {
        base: 'partnersImages',
      },
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data && data.url) {
        this.teamsService
          .updatePartnerImage(this.team.teamId, data.url)
          .then(() => {
            this.snackBar.open(`Partner image updated`, null, {
              duration: 5000,
            });

            const teamAuctions = this.auctionsService.getAuctionsByTeamId(this.team.teamId)
            .subscribe(data => {
              data.forEach((ele) => {
                this.auction_ids.push(ele.am_auction_id)
              });
            }); // end get team auction
            setTimeout(() =>{
              // start http request
              this.http.post('https://maxsold.maxsold.com/mapi/auctions/updatepartnerlogo', 
              {
                auction_ids: this.auction_ids,
                image_url: data.url,
                partner_url: this.team.partnerProfile.companyURL
              },       {
                headers: {
                  'token': this.amToken,
                  'Content-Type': 'application/json',
                },
              }).subscribe(response => {
                console.log(response);
              }) 
            }, 3000 ) // end timeout

          //   this.http.post('https://maxsold.maxsold.com/mapi/auctions/updatepartnerlogo', 
          //   {
          //     auction_ids: localStorage.getItem('auction_ids'),
          //     image_url: data.url,
          //     partner_url: this.team.partnerProfile.companyURL
          //   },       {
          //     headers: {
          //       'token': this.amToken,
          //       'Content-Type': 'application/json',
          //     },
          //   }).subscribe(response => {
          //      console.log('RESPONSE', response);
          //      console.log('IDS', localStorage.getItem('auction_ids'));
          //    })
          // })
          // .catch((error) => {
          //   this.snackBar.open(`Partner image couldn't be updated`, null, {
          //     duration: 5000,
          //   });
          });
      }

      if (data && data.removeImage) {
        this.teamsService.updatePartnerImage(this.team.teamId, '');
      }
    });
  }
  // disables form inputs
  disableForm() {
    this.partnerForm.disable();
  }

  // enables forms inputs
  enableForm() {
    this.partnerForm.enable();
    this.partnerForm.get('shopUrl')?.disable();
  }
}

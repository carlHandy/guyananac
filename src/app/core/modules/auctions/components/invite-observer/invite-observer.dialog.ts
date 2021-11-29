import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamsService } from '../../../../../shared/services/teams.service';
import { AuctionSellerInvitation } from '../../../../../shared/models/auction-seller-invitation';
import { AuctionObserversService } from '../../../../../shared/services/auction-observers.service';
import { SellerService } from '../../../../../shared/services/seller.service';
import { AuctionTeamInvitation } from '../../../../../shared/models/auctionTeamInvitation';
import { Auction } from '../../../../../shared/models/auction.interface';

@Component({
  selector: 'app-invite-observer',
  templateUrl: './invite-observer.dialog.html',
  styleUrls: ['../../../../../../assets/styles/input-with-labels.scss'],
})
export class InviteObserverDialog implements OnInit {
  label: string = 'Email Address';

  form: FormGroup;
  constructor(
    private teamService: TeamsService,
    @Inject(MAT_DIALOG_DATA)
    public data: { auction: Auction },
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<InviteObserverDialog>,
    private auctionObserversService: AuctionObserversService,
    private sellerService: SellerService,
  ) {
    this.form = new FormGroup({
      type: new FormControl('seller'),
      value: new FormControl('', [
        Validators.required,
        Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'),
      ]),
    });

    this.form.valueChanges.subscribe((value) => {
      if (value?.type === 'seller') {
        this.form
          .get('value')
          .setValidators([
            Validators.required,
            Validators.maxLength(256),
            Validators.pattern(
              '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'
            ),
          ]);
      } else {
        this.form.get('value').clearValidators();
      }
      this.form.updateValueAndValidity({
        emitEvent: false,
      });
    });
  }

  ngOnInit(): void {}

  // adds a new invitation for a seller or team to be observer of the auction
  async add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { type, value } = this.form.value;

    if (type === 'seller') {
      this.inviteSellerToAuction(value);
    } else if (type === 'team') {
      this.inviteTeamToAuction(parseInt(value));
    }
  }

  // handles the invite of a full team to an auctions
  async inviteTeamToAuction(teamNumber: number) {
    const snapshot = await this.teamService.getTeamByNumber(teamNumber);

    if (!(snapshot.docs.length === 1)) {
      // no seller document found for this email
      this.snackBar.open('Not team found with this number.', null, {
        duration: 5000,
      });
      return;
    }

    const team = snapshot.docs[0].data();

    if (
      this.data.auction.auctionOwnerTeam != null &&
      this.data.auction.auctionOwnerTeam === team.teamId
    ) {
      this.snackBar.open(
        `Can't invite the team, team is already the owner.`,
        null, 
        {
          duration: 5000,
        }
      );
      return;
    }

    const invitation: AuctionTeamInvitation = {
      auctionId: this.data.auction.auctionId,
      auctionTitle: this.data.auction.auctionTitle,
      teamId: team.teamId,
      teamName: team.teamName,
    };

    Promise.all([
      this.auctionObserversService.sendAuctionTeamInvitationEmails(
        this.data.auction.auctionTitle,
        team.teamName,
        team.teamAdmins ?? []
      ),
      this.auctionObserversService.addAuctionTeamInvitation(invitation),
    ])
      .then(() => {
        this.snackBar.open('Invitation sent', null, {
          duration: 5000,
        });

        this.dialogRef.close();
      })
      .catch((err) => {
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }

  // handles the invite of a seller to an auction as observer
  async inviteSellerToAuction(sellerEmail: string) {
    sellerEmail = sellerEmail.toLowerCase();

    const snapshot = await this.sellerService.getSellerByEmail(sellerEmail);
    const seller = snapshot.docs[0].data();
    const auctionId = window.location.pathname.split('/auctions/')[1];

    if (seller.auctionList.includes(auctionId)) {
      this.snackBar.open(
        `Can't invite the seller, seller is already attached to auction.`,
        null,
        {
          duration: 5000,
        }
      );
      return;
    }

    // build invitation
    const invitation: AuctionSellerInvitation = {
      auctionId: this.data.auction.auctionId,
      auctionTitle: this.data.auction.auctionTitle,
      sellerEmail: sellerEmail,
    };

    Promise.all([
      this.auctionObserversService.sendAuctionSellerInvitationEmail(
        sellerEmail,
        this.data.auction.auctionTitle
      ),
      this.auctionObserversService.addAuctionSellerInvitation(invitation),
    ])

      .then(() => {
        this.snackBar.open('Invitation sent', null, {
          duration: 5000,
        });
        this.dialogRef.close();
      })
      .catch((err) => {
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }
}

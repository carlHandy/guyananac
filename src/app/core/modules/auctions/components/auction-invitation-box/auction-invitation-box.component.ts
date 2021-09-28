import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuctionObserversService } from '../../../../../shared/services/auction-observers.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AuctionSellerInvitation } from '../../../../../shared/models/auction-seller-invitation';

@Component({
  selector: 'app-auction-invitation-box',
  templateUrl: './auction-invitation-box.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionInvitationBoxComponent {
  @Input() invitation: AuctionSellerInvitation;
  loading = false;
  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private auctionObserversService: AuctionObserversService
  ) {}

  // rejects the invitation for being a observer of the auction
  reject() {
    this.auctionObserversService
      .rejectAuctionSellerInvitation(this.invitation.invitationId)
      .then(() => {
        this.snackBar.open('Invitation declined', null, {
          duration: 5000,
        });
      })
      .catch((err) => {
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }

  // accepts the invitation and makes the user part of the auction observers
  accept() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const invitation = this.invitation;
    const seller = this.authService.baseSeller;

    this.auctionObserversService
      .acceptAuctionSellerInvitation(
        seller.sellerId,
        invitation.auctionId,
        invitation.invitationId
      )
      .then((request) => {
        request.subscribe(
          (res) => {
            this.snackBar.open(`You have been added to the auction`, null, {
              duration: 5000,
            });
          },
          (err) => {
            this.loading = false;
            this.snackBar.open(err, null, {
              duration: 5000,
            });
          }
        );
      })
      .catch((err) => {
        this.loading = false;
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuctionObserversService } from '../../../../../shared/services/auction-observers.service';
import { AuctionTeamInvitation } from '../../../../../shared/models/auctionTeamInvitation';

@Component({
  selector: 'app-auction-team-invitation-box',
  templateUrl: './auction-team-invitation-box.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionTeamInvitationBoxComponent {
  @Input() invitation: AuctionTeamInvitation;
  loading = false;
  constructor(
    private snackBar: MatSnackBar,
    private auctionObserversService: AuctionObserversService
  ) {}

  // cancels an invitation to a team to be part of observer teams
  reject() {
    this.auctionObserversService
      .rejectAuctionTeamInvitation(this.invitation.invitationId)
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

  // accepts the invitation, handles the include of the new team to the auction
  accept() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const invitation = this.invitation;

    this.auctionObserversService
      .acceptAuctionTeamInvitation(
        invitation.teamId,
        invitation.auctionId,
        invitation.invitationId
      )
      .then((request) => {
        request.subscribe(
          (res) => {
            this.snackBar.open(
              `Your team have been added to the auction`,
              null,
              {
                duration: 5000,
              }
            );
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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// services
import { AuthService } from '@shared/services/auth.service';

// models
import { Invitation } from '@shared/models/invitation.model';
import { InvitationsService } from '../../../../../shared/services/invitations.service';

@Component({
  selector: 'app-team-invitation-box',
  templateUrl: './team-invitation-box.component.html',
})
export class TeamInvitationBoxComponent implements OnInit {
  @Input() invitation: Invitation;
  loading = false;
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private invitationsService: InvitationsService
  ) {}

  ngOnInit(): void {}

  // deleted the invitation for team membership
  reject() {
    this.invitationsService
      .deleteTeamInvitation(this.invitation)
      .then(() => {
        this.snackBar.open(`Invitation has been cancelled.`, null, {
          duration: 5000,
        });
      })
      .catch((err) => {
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }

  // adds the logged user to the team that sent the invite
  async accept() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    // base seeler
    const seller = this.authService.baseSeller;
    const role = this.invitation.role;
    const team = this.invitation.team;

    this.invitationsService
      .acceptTeamInvitation(
        seller.sellerId,
        team.teamId,
        role,
        this.invitation.invitationId
      )
      .then((request) => {
        request.subscribe(
          (res) => {
            this.snackBar.open(`You have been added to the team`, null, {
              duration: 5000,
            });
          },
          (err) => {
            console.log(err);
            this.loading = false;
            this.snackBar.open(err?.error?.message ?? 'unknown error', null, {
              duration: 5000,
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);

        this.loading = false;
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }
}

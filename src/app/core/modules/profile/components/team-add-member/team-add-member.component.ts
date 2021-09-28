import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// models
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Team } from '@shared/models/team.model';
import { SellerService } from '@shared/services/seller.service';
import { TeamsService } from '@shared/services/teams.service';
import { Invitation } from '@shared/models/invitation.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationsService } from '../../../../../shared/services/invitations.service';

export interface AddMemberDialogData {
  team: Team;
}

@Component({
  selector: 'app-team-add-member',
  templateUrl: './team-add-member.component.html',
  styleUrls: ['../../../../../../assets/styles/input-with-labels.scss'],
})
export class TeamAddMemberComponent {
  inviteForm: FormGroup;
  roles = [TeamMemberRoleEnum.Admin, TeamMemberRoleEnum.Viewer];
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddMemberDialogData,
    private sellerService: SellerService,
    private teamsService: TeamsService,
    private invitationsService: InvitationsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TeamAddMemberComponent>
  ) {
    this.inviteForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(256),
        Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'),
      ]),
      role: new FormControl('', [Validators.required]),
    });
  }

  // handles the creation of the invite for a given seller
  async invite() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      this.loading = false;
      return;
    }

    let { email, role } = this.inviteForm.value;

    email = (email as string).toLowerCase();

    const data = await this.sellerService.getSellerByEmail(email);

    if (data.docs.length >= 1) {
      const seller = data.docs[0].data();
      const admins = this.data.team.teamAdmins ?? [];
      const viewers = this.data.team.teamViewers ?? [];

      if (
        admins.includes(seller.sellerId) ||
        viewers.includes(seller.sellerId)
      ) {
        // seller already in the team
        this.snackBar.open('This seller is already part of the team.', null, {
          duration: 5000,
        });
        this.loading = false;
        return;
      }
    }

    const invitations = await this.invitationsService
      .getInvitationByEmailAndTeamId(email, this.data.team.teamId)
      .toPromise();

    if (invitations.docs.length > 0) {
      this.snackBar.open('This seller has been already invited.', null, {
        duration: 5000,
      });
      this.loading = false;
      return;
    }

    const invite: Invitation = {
      team: this.data.team,
      role: role,
      sellerEmail: email,
    };

    Promise.all([
      this.invitationsService.addInvitation(invite),
      this.invitationsService.sendTeamInvitationEmail(
        email,
        this.data.team.teamName
      ),
    ])
      .then(() => {
        this.snackBar.open(`Invite sent!`, null, {
          duration: 5000,
        });
        this.dialogRef.close();
      })
      .catch((err) => {
        this.snackBar.open(err, null, {
          duration: 5000,
        });
        this.loading = false;
      });
  }
}

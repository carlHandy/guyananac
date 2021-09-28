import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

// models
import { Team } from '@shared/models/team.model';

// services
import { AuthService } from '@shared/services/auth.service';

// utils
import { SellerService } from '@shared/services/seller.service';
import { TeamsService } from '@shared/services/teams.service';

// firebase
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-team',
  templateUrl: './create-team.dialog.html',
  styleUrls: ['../../../../../../assets/styles/input-with-labels.scss'],
})
export class CreateTeamDialog {
  teamName: FormControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(50),
  ]);
  loading = false;
  constructor(
    private authService: AuthService,
    private teamsService: TeamsService,
    private sellerService: SellerService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateTeamDialog>
  ) {}

  // handles the creation of a new team
  async createTeam() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    if (this.teamName.invalid) {
      this.teamName.markAsTouched();
      this.loading = false;
      return;
    }

    const seller = this.authService.baseSeller;
    const team = new Team();

    team.teamName = this.teamName.value;
    team.isPartner = false;
    team.teamCountry = seller.country;
    team.teamMemberCount = 1;

    team.teamAdmins = [seller.sellerId];

    const teamNumber = await this.teamsService.updateIncrementValue();

    team.teamNumber = teamNumber;

    this.teamsService
      .createTeam(team)
      .then((teamRef) => {
        team.teamId = teamRef.id;

        Promise.all([
          this.teamsService.updateTeamIdField(team.teamId),
          this.sellerService.addSellerTeam(seller.sellerId, team.teamId),
        ])
          .then(() => {
            this.snackBar.open(`Team created`, null, {
              duration: 5000,
            });
            this.dialogRef.close();
          })
          .catch((err) => {
            this.snackBar.open(`The team couldn't be created properly`, null, {
              duration: 5000,
            });
            this.loading = false;
          });
      })
      .catch((err) => {
        this.snackBar.open(`The team couldn't be created`, null, {
          duration: 5000,
        });
        this.loading = false;
      });
  }
}

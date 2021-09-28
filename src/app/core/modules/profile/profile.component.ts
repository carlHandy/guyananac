import { Component } from '@angular/core';

// services
import { MatDialog } from '@angular/material/dialog';
import { CreateTeamDialog } from './components/create-team/create-team.dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [
    './profile.component.scss',
    '../../../../assets/styles/input-with-labels.scss',
  ],
})
export class ProfileComponent {
  constructor(private dialog: MatDialog) {}

  // opens the create team dialog
  openCreateTeamDialog() {
    this.dialog.open(CreateTeamDialog);
  }
}

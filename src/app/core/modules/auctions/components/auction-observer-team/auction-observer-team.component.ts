import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TeamsService } from '../../../../../shared/services/teams.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '@shared/components/confirmation/confirmation.dialog';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Team } from '../../../../../shared/models/team.model';

interface AuctionTeamMembers {
  members: string[];
  team: Team;
  admins: string[];
  viewers: string[];
}

@Component({
  selector: 'app-auction-observer-team',
  templateUrl: './auction-observer-team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionObserverTeamComponent implements OnInit {
  @Input() teamId: string;
  @Input() auctionId: string;
  @Input() canDelete: boolean = false;
  observerTeam$: Observable<AuctionTeamMembers>;

  constructor(
    private teamService: TeamsService,
    private dialog: MatDialog,
    private auctionsService: AuctionsService,
    private snackBar: MatSnackBar
  ) {}
  role = TeamMemberRoleEnum;

  ngOnInit(): void {
    if (this.teamId) {
      this.observerTeam$ = this.teamService.getTeam(this.teamId).pipe(
        filter((t) => t != null),
        map((t) => {
          const res = {
            members: [...(t.teamAdmins ?? []), ...(t.teamViewers ?? [])] ?? [],
            admins: t.teamAdmins ?? [],
            viewers: t.teamViewers ?? [],
            team: t,
          };
          return res;
        })
      );
    }
  }

  // removes a team from auction observer list
  remove(
    teamId: string,
    viewersIds: string[],
    adminIds: string[],
    teamName: string
  ) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: `The seller belongs to the team "${teamName}", if you delete this seller, all the team members will be deleted. `,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.confirm) {
        Promise.all([
          // remove teamId in observers team list
          this.auctionsService.removeAuctionTeamObserver(
            this.auctionId,
            teamId
          ),
          // remove sellers ids from auction with permission
          // remove auctions to members
          this.auctionsService.removeTeamMembersFromAuction(
            this.auctionId,
            viewersIds,
            adminIds
          ),
        ])
          .then(() => {
            this.snackBar.open(`Observers deleted`, null, {
              duration: 5000,
            });
          })
          .catch((err) => {
            this.snackBar.open(`The observer couldn't be removed`, null, {
              duration: 5000,
            });
          });
      }
    });
  }
}

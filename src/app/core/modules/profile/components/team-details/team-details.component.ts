import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// components
import { TeamAddMemberComponent } from '../team-add-member/team-add-member.component';

// models
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Team } from '@shared/models/team.model';
import { Invitation } from '@shared/models/invitation.model';

// services
import { SellerService } from '@shared/services/seller.service';
import { TeamsService } from '@shared/services/teams.service';
import { AuthService } from '@shared/services/auth.service';

// rxjs
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfirmationDialog } from '@shared/components/confirmation/confirmation.dialog';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { InvitationsService } from '@shared/services/invitations.service';

interface TeamInformation {
  isUserAnAdmin: boolean;
  userId: string;
  adminsIds: string[];
  viewersIds: string[];
  //invites: string[];
  team: Team;
}

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
})
export class TeamDetailsComponent implements OnInit {
  @Input() teamId: string;

  vm$: Observable<TeamInformation>;
  im$: Observable<Invitation[]>;
  deletingTeam = false;
  roles = TeamMemberRoleEnum;
  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private sellerService: SellerService,
    private teamsService: TeamsService,
    private snackBar: MatSnackBar,
    private auctionsService: AuctionsService,
    private inviteService: InvitationsService
  ) {}

  ngOnInit(): void {
    const seller = this.authService.baseSeller;

    if(this.teamId){
      this.im$ = this.inviteService.getAllInvitationByTeamId(this.teamId);
    }
    if (this.teamId) {
      this.vm$ = this.teamsService.getTeam(this.teamId).pipe(
        filter((t) => t != null && t != undefined),
        map((team) => {
          const vm: TeamInformation = {
            team,
            userId: seller.sellerId,
            isUserAnAdmin: false,
            adminsIds: team.teamAdmins ?? [],
            viewersIds: team.teamViewers ?? [],
          };

          if (vm.adminsIds.find((a) => a === seller.sellerId)) {
            vm.isUserAnAdmin = true;
          }

          return vm;
        })
      );
    }
  }

  // opens member dialog for adding a new member invite
  openAddMemberDialog(team: Team) {
    this.dialog.open(TeamAddMemberComponent, {
      data: {
        team: team,
      },
    });
  }

  // handles confirmation and deletion of a team
  deleteTeam(
    isAdmin: boolean,
    team: Team,
    adminsIds: string[],
    viewersIds: string[]
  ) {
    if (!isAdmin) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Are you sure you want to delete this team?',
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.confirm === true) {
        this.deletingTeam = true;
        this.teamsService.canTeamBeDeleted(team.teamId).then((request) => {
          request.subscribe((res) => {
            if (res.result === true) {
              const membersIds = [...adminsIds, ...viewersIds];
              const updates: Promise<void>[] = [];
              membersIds.forEach((id) => {
                updates.push(
                  this.sellerService.removeSellerTeam(id, team.teamId)
                );
              });
              updates.push(this.teamsService.deleteTeam(team.teamId));
              Promise.all(updates)
                .then(() => {
                  this.snackBar.open('Team deleted', null, { duration: 5000 });
                  this.deletingTeam = false;
                })
                .catch((error) => {
                  this.snackBar.open(error, null, { duration: 5000 });
                  this.deletingTeam = false;
                });
            } else {
              this.snackBar.open('Team cannot be deleted', null, {
                duration: 5000,
              });
              this.deletingTeam = false;
            }
          });
        });
      }
    });
  }

  identify(index, item) {
    return item;
  }

  deleteMember(teamId: string, sellerId: string, role: TeamMemberRoleEnum) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Are you sure you want to delete this member from the team?',
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.confirm === true) {
        this.teamsService
          .deleteTeamMember(sellerId, teamId, role)
          .then((request) => {
            request.subscribe(
              (res) => {
                this.snackBar.open('Member deleted', null, { duration: 5000 });
              },
              (err) => {
                this.snackBar.open(err, null, { duration: 5000 });
              }
            );
          })
          .catch((err) => {
            this.snackBar.open(err, null, { duration: 5000 });
          });
      }
    });
  }
}

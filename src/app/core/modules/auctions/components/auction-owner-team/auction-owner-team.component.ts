import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../../../../../shared/models/team.model';
import { TeamsService } from '../../../../../shared/services/teams.service';

@Component({
  selector: 'app-auction-owner-team',
  templateUrl: './auction-owner-team.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionOwnerTeamComponent implements OnInit {
  @Input() teamId: string;
  team$: Observable<Team>;
  constructor(private teamsService: TeamsService) {}

  ngOnInit(): void {
    this.team$ = this.teamsService.getTeam(this.teamId);
  }

  // build initials for a given team name
  getInitials(teamName: string) {
    let names = teamName.split(' ');
    let initials = '';

    if (names.length >= 1) {
      initials += names[0][0].toUpperCase();
    }

    if (names.length >= 2) {
      initials += names[1][0].toUpperCase();
    }

    return initials ? initials : 'N/A';
  }
}

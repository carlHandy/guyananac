import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Team } from './team.model';

export interface Invitation {
  team: Team;
  role: TeamMemberRoleEnum;
  date?: Date | any;
  sellerEmail: string;
  invitationId?: string;
}

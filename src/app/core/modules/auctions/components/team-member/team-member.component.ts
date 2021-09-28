import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { Seller } from '../../../../../shared/models/seller.model';

@Component({
  selector: 'app-team-member',
  templateUrl: './team-member.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMemberComponent {
  @Input() teamMember: Seller;
  @Input() role: TeamMemberRoleEnum | null = null;
  @Input() canBeDeleted: boolean = false;
  @Output() removeMember: EventEmitter<void> = new EventEmitter<void>();
  constructor() {}

  // gets member image or base path
  getImage() {
    if (!this.teamMember.profilePhotoURI) {
      return `background-image: url('assets/images/empty.jpg')`;
    } else {
      return `background-image: url('${this.teamMember.profilePhotoURI}')`;
    }
  }

  // emits an event that (x) buttons has been clicked
  remove() {
    this.removeMember.emit();
  }
}

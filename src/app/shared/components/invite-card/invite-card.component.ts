import { Component, OnInit, Input } from '@angular/core';

import { InvitationsService } from '@shared/services/invitations.service';
import { Invitation } from '@shared/models/invitation.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-invite-card',
  templateUrl: './invite-card.component.html',
  //styleUrls: ['./invite-card.component.scss']
})
export class InviteCardComponent implements OnInit {
  @Input() sellerEmail: string;
  // @Input() canBeDeleted: boolean = false;
  @Input() invitationId: Invitation;
  deleting = false;

  constructor(private invitationsService: InvitationsService) {}

  ngOnInit(): void {
  }

  remove(im: Invitation) {
    console.log(im);
    this.invitationsService.getInvitationByEmailAndTeamIdVc(im.sellerEmail, im.team.teamId)
    // this.invitationsService.deleteTeamInvitation(im);
    // this.deleting = true;
    // setTimeout(() => {
    //   this.deleting = false;
    // }, 5000);
  }
}

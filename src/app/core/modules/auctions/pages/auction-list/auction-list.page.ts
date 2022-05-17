import { Component, OnInit } from '@angular/core';
import { Invitation } from '@shared/models/invitation.model';
import { InvitationsService } from '@shared/services/invitations.service';
import { Observable } from 'rxjs';
import { AuctionObserversService } from '../../../../../shared/services/auction-observers.service';
import { AuctionSellerInvitation } from '../../../../../shared/models/auction-seller-invitation';
import { AuctionTeamInvitation } from '../../../../../shared/models/auctionTeamInvitation';
import { environment } from '../../../../../../environments/environment.prod';

@Component({
  selector: 'app-auction-list',
  templateUrl: './auction-list.page.html',
})
export class AuctionListPage implements OnInit {
  invitations$: Observable<Invitation[]>;

  auctionInvitations$: Observable<AuctionSellerInvitation[]>;

  auctionTeamInvitations$: Observable<AuctionTeamInvitation[]>;

  environment = environment.maintenance;
  constructor(
    private invitationsService: InvitationsService,
    private auctionObserversService: AuctionObserversService,
  ) {}

  ngOnInit(): void {
    this.invitations$ = this.invitationsService.getInvitations();
    this.auctionInvitations$ =
      this.auctionObserversService.getAuctionSellerInvitations();
    this.auctionTeamInvitations$ =
      this.auctionObserversService.getAuctionTeamInvitations();
  }

  identify(index, item) {
    return item;
  }
}

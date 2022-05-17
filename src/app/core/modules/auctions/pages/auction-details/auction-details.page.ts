import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// models
import { AuctionNotification } from '@shared/models/auction-notification.interface';
import { Auction } from '@shared/models/auction.interface';

// services
import { AuctionsService } from '@shared/services/auctions.service';

// utils
import { getNotificationsFromAuction } from '@shared/utils/auctions';
import { environment } from '../../../../../../environments/environment.prod';

interface AuctionDetails {
  auction: Auction;
  notifications: AuctionNotification[];
}
@Component({
  selector: 'app-auction-details',
  templateUrl: './auction-details.page.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionDetailsPage implements OnInit {
  $vm: Observable<AuctionDetails>;

  environment = environment.maintenance;

  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionsService
  ) {}

  ngOnInit(): void {
    // handling page parameters for searching and getting selected auction
    this.route.paramMap.subscribe((params) => {
      const auctionId = params.get('id');

      if (auctionId) {
        this.$vm = this.auctionService.getAuctionById(auctionId).pipe(
          map((a) => {
            return {
              auction: a,
              notifications: getNotificationsFromAuction(a.recentNotifications),
            };
          })
        );
      }
    });
  }
}

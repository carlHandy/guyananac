import { Component, OnInit, Input } from '@angular/core';
import { Auction } from '@shared/models/auction.interface';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AuctionNotification } from '../../../../../shared/models/auction-notification.interface';
import { getNotificationsFromAuction } from '@shared/utils/auctions';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAuctionNameComponent } from '../change-auction-name/change-auction-name.component';

@Component({
  selector: 'app-auction-card',
  templateUrl: './auction-card.component.html',
})
export class AuctionCardComponent implements OnInit {
  @Input() auction: Auction;
  @Input() showNotifications: boolean = false;
  @Input() allowEdit = false;
  @Input() enableTitleNavigation = false;
  notifications: AuctionNotification[] = [];
  canEditName: boolean = false;
  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.auction) {

     if(this.auction.pickupDate){
        this.auction.pickupDate = this.auction.pickupDate + (10*3600);
      }

      // if(this.auction.startDate){
      //   this.auction.startDate = this.auction.startDate + (5*3600)
      // }

      // if(this.auction.endDate){
      //   this.auction.endDate = this.auction.endDate + (5*3600)
      // }

      this.notifications = getNotificationsFromAuction(
        this.auction.recentNotifications
      );
      const sellerId = this.authService.baseSeller.sellerId;

      if (this.auction.sellerPermissionsReadWrite.includes(sellerId)) {
        this.canEditName = true;
      }
    }
  }

  // opens edit dialog for updating auction alias
  openEditDialog() {
    this.dialog.open(ChangeAuctionNameComponent, {
      data: {
        auctionId: this.auction.auctionId,
      },
    });
  }
}

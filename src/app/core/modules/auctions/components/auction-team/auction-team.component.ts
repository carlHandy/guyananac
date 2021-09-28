import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InviteObserverDialog } from '../invite-observer/invite-observer.dialog';

import { Auction } from '../../../../../shared/models/auction.interface';
import { ConfirmationDialog } from '@shared/components/confirmation/confirmation.dialog';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../../shared/services/auth.service';
import { SellerService } from '../../../../../shared/services/seller.service';
import { AuctionChangeOwnerDialog } from '../auction-change-owner/auction-change-owner.dialog';

@Component({
  selector: 'app-auction-team',
  templateUrl: './auction-team.component.html',
})
export class AuctionTeamComponent implements OnInit {
  @Input() auction: Auction;
  canDeleteObservers = false;
  constructor(
    private dialog: MatDialog,
    private auctionService: AuctionsService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    const seller = this.authService.baseSeller;

    this.canDeleteObservers = this.auction.sellerPermissionsReadWrite.includes(
      seller.sellerId
    );
  }

  // opens observer dialog to invite new sellers and teams
  openObserverDialog() {
    this.dialog.open(InviteObserverDialog, {
      data: {
        auction: this.auction,
      },
    });
  }

  // opens change owner dialog
  openChangeOwnerDialog() {
    this.dialog.open(AuctionChangeOwnerDialog, {
      data: {
        auction: this.auction,
      },
    });
  }

  // remover seller user from auction observer list
  removeSellerObserver(sellerId: string, auctionId: string) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message: 'Are you sure you want remove this seller from Observers?',
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.confirm) {
        Promise.all([
          // remove auction id in seller.auctionList
          this.sellerService.removeAuctionsFromSeller([auctionId], sellerId),
          // remove seller id from auction observer list
          this.auctionService.removeAuctionSellerObserver(auctionId, sellerId),
          // remove seller id in auctions read permission list
          this.auctionService.removeSellerFromReadOnlyList(auctionId, sellerId),
        ])
          .then(() => {
            this.snackBar.open(`Observer deleted`, null, {
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

import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../../../shared/services/auth.service';
import { TeamsService } from '../../../../../shared/services/teams.service';
import { combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auction } from '../../../../../shared/models/auction.interface';
import { AuctionOwnerService } from '../../../../../shared/services/auction-owner.service';

interface OwnerOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-auction-change-owner',
  templateUrl: './auction-change-owner.dialog.html',
  styleUrls: ['../../../../../../assets/styles/input-with-labels.scss'],
})
export class AuctionChangeOwnerDialog implements OnInit {
  newOwner: FormControl = new FormControl('me', [Validators.required]);
  options: OwnerOption[] = [];
  loading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { auction: Auction },
    private authService: AuthService,
    private teamsService: TeamsService,
    private auctionOwnerService: AuctionOwnerService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AuctionChangeOwnerDialog>
  ) {}

  ngOnInit(): void {
    const seller = this.authService.baseSeller;
    const teamsIds = seller.teamIds ?? [];
    const teams = combineLatest([
      ...(teamsIds.map((id) => {
        return this.teamsService.getTeam(id);
      }) ?? []),
    ]);

    teams
      .pipe(
        filter((ids) => ids != null && ids.length > 0),
        take(1)
      )
      .subscribe((teams) => {
        const sellerId = this.authService.baseSeller.sellerId;
        const options: OwnerOption[] = [
          {
            label: 'Me',
            value: 'me',
          },
        ];
        teams
          .filter((team) => {
            const admins = team.teamAdmins ?? [];
            if (!admins.includes(sellerId)) {
              return false;
            }
            return true;
          })
          .filter((team) => {
            const observerTeams = this.data.auction.auctionObserversTeam ?? [];
            if (observerTeams.includes(team.teamId)) {
              return false;
            }
            return true;
          })
          .forEach((t) => {
            options.push({
              label: t.teamName,
              value: t.teamId,
            });
          });
        this.options = options;
      });
  }

  // handles change owner of auction
  async change() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.newOwner.invalid) {
      this.newOwner.markAllAsTouched();
      return;
    }

    const owner = this.newOwner.value;

    const auction = this.data.auction;

    if (owner === 'me') {
      const sellerId = this.authService.baseSeller.sellerId;
      const newSellerOwnerId = sellerId;
      const auctionId = auction.auctionId;

      this.setAuctionOwnerSeller(newSellerOwnerId, auctionId);
    } else {
      // owner is a team
      const newTeamOwnerId = owner;
      const auctionId = auction.auctionId;
      const observerTeams = this.data.auction.auctionObserversTeam ?? [];
      if (observerTeams.includes(newTeamOwnerId)) {
        this.snackBar.open(
          `Can't set this team as owner, team is already an observer.`,
          null,
          {
            duration: 5000,
          }
        );
        this.loading = false;
        return;
      }

      this.setAuctionOwnerTeam(newTeamOwnerId, auctionId);
    }
  }

  // changes the ownership of an auction to a given team
  setAuctionOwnerTeam(teamId: string, auctionId: string) {
    this.auctionOwnerService
      .changeAuctionOwnerTeam(teamId, auctionId)
      .then((request) => {
        request.subscribe(
          (res) => {
            this.dialogRef.close();
            this.snackBar.open(`The team have changed`, null, {
              duration: 5000,
            });
          },
          (err) => {
            this.loading = false;
            this.snackBar.open(err, null, {
              duration: 5000,
            });
          }
        );
      })
      .catch((err) => {
        this.loading = false;
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }

  // changes the ownership of an auction to a given user (the logged user)
  setAuctionOwnerSeller(newSellerId: string, auctionId: string) {
    this.auctionOwnerService
      .changeAuctionOwnerSeller(newSellerId, auctionId)
      .then((request) => {
        request.subscribe(
          (res) => {
            this.dialogRef.close();

            this.snackBar.open(
              `You have become the owner of this auction`,
              null,
              {
                duration: 5000,
              }
            );
          },
          (err) => {
            this.loading = false;
            this.snackBar.open(err, null, {
              duration: 5000,
            });
          }
        );
      })
      .catch((err) => {
        this.loading = false;
        this.snackBar.open(err, null, {
          duration: 5000,
        });
      });
  }
}

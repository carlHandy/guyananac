import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Auction } from '@shared/models/auction.interface';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuctionFiltersService } from '../../../../../shared/services/auction-filters.service';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-auctions-table',
  templateUrl: './auctions-table.component.html',
})
export class AuctionsTableComponent implements OnInit {
  shownAuctions$: Observable<Auction[]>;
  originalAuctionList: Observable<string[]> = new Observable();
  empty = false;

  constructor(
    private auctionFiltersService: AuctionFiltersService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.originalAuctionList = this.authService.seller$.pipe(
      filter((seller) => seller != undefined && seller != null),
      map((seller) => {
        return seller.auctionList;
      })
    );

    // combines all the needed filters and auction values to build a filtered
    // auction lists
    const filteredResult = combineLatest([
      this.auctionFiltersService.textSearch$,
      this.auctionFiltersService.phaseFilter$,
      this.auctionFiltersService.yearFilter$,
      this.auctionFiltersService.auctions$,
    ]).pipe(
      map(([text, phase, year, auctions]) => {
        this.auctionFiltersService.page$.next(1);
        let filteredAuctions = auctions.filter((a) => a != undefined) ?? [];
        text = text.toLowerCase();
        if (text !== '') {
          filteredAuctions = filteredAuctions.filter((a) => {
            if (a.auctionTitle.toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            if (
              a.auctionAlias &&
              a.auctionAlias.toLowerCase().indexOf(text) >= 0
            ) {
              return true;
            }

            if (a.am_auction_id.toString().toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            if (a?.address?.address?.toLowerCase().indexOf(text) >= 0) {
              return true;
            }

            return false;
          });
        }

        if (year > 0) {
          filteredAuctions = filteredAuctions.filter(
            (a) => a.auctionYear === year
          );
        }

        if (phase !== null) {
          filteredAuctions = filteredAuctions.filter(
            (a) => a.auctionPhase === phase.value
          );
        }
        filteredAuctions.sort(this.sortAuctionByDate);
        return filteredAuctions;
      })
    );

    // displays the needed auction list from a given page number
    this.shownAuctions$ = combineLatest([
      filteredResult,
      this.auctionFiltersService.page$,
    ]).pipe(
      map(([auctions, page]) => {
        const size = auctions.length;
        const many = page * 10;
        if (many >= size) {
          this.empty = true;
        }
        return auctions.slice(0, many);
      })
    );
  }

  bottomReached() {
    this.auctionFiltersService.loadPage();
  }

  sortAuctionByDate(a: Auction, b: Auction) {
    if (a.createdDate < b.createdDate) {
      return 1;
    }
    if (a.createdDate > b.createdDate) {
      return -1;
    }

    return 0;
  }
}

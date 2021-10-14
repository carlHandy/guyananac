import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Auction } from '@shared/models/auction.interface';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuctionFiltersService } from '../../../../../shared/services/auction-filters.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import * as FullStory from '@fullstory/browser';

@Component({
  selector: 'app-auctions-table',
  templateUrl: './auctions-table.component.html',
})
export class AuctionsTableComponent implements OnInit {
  shownAuctions$: Observable<Auction[]>;
  originalAuctionList: Observable<string[]> = new Observable();
  empty = false;
  //sortIndicator: number;

  constructor(
    private auctionFiltersService: AuctionFiltersService,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.originalAuctionList = this.authService.seller$.pipe(
      filter((seller) => seller != undefined && seller != null),
      map((seller) => {
        FullStory.identify(seller.email);
        return seller.auctionList;
      })
    );

    // combines all the needed filters and auction values to build a filtered
    // auction lists
    const filteredResult = combineLatest([
      this.auctionFiltersService.textSearch$,
      this.auctionFiltersService.sortFilter$,
      this.auctionFiltersService.phaseFilter$,
      this.auctionFiltersService.yearFilter$,
      this.auctionFiltersService.monthFilter$,
      this.auctionFiltersService.auctions$,
    ]).pipe(
      map(([text,sort, phase, year,month,auctions]) => {
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

        if(month && month.value >= 0){
          filteredAuctions = filteredAuctions.filter(
            (a) => a.startDate && new Date(a.startDate * 1000).getMonth() === month.value
          );
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
        if(sort && sort.value){
          filteredAuctions = this.sortAuctionByDateWrapper(filteredAuctions, sort.value);
        }
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

  sortAuctionByDateWrapper(auctionsArray: Auction[], sortOrder: number){
    let sortIndicator: number;
    if(sortOrder === 1) sortIndicator = -1;
    else if(sortOrder === 2) sortIndicator = 1;
    var sortAuctionByDate = (a: Auction, b: Auction)=> {
      //console.log(a.startDate);
      if (a.startDate < b.startDate) {
        return sortIndicator;
      }
      if (a.startDate > b.startDate) {
        return sortIndicator * (-1);
      }

      return 0;
    }
    auctionsArray.sort(sortAuctionByDate);
    return auctionsArray;
  }

}

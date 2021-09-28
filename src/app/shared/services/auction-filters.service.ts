import { Injectable } from '@angular/core';

// models
import { PhaseItem } from 'src/app/core/modules/auctions/components/auctions-filter-bar/auctions-filter-bar.component';

// rxjs
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { Auction } from '../models/auction.interface';
import { AuthService } from './auth.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { AuctionsService } from './auctions.service';

@Injectable({
  providedIn: 'root',
})
export class AuctionFiltersService {
  yearFilter$: BehaviorSubject<number>;
  textSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  phaseFilter$: BehaviorSubject<PhaseItem | null> =
    new BehaviorSubject<PhaseItem | null>(null);
  page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  auctions$: Observable<Auction[]> = new Observable<Auction[]>();
  constructor(
    private authService: AuthService,
    private auctionService: AuctionsService
  ) {
    const topYear = new Date(Date.now()).getFullYear();
    this.yearFilter$ = new BehaviorSubject<number>(topYear);
  }

  // load next page when requested
  loadPage() {
    const actual = this.page$.value;
    this.page$.next(actual + 1);
  }

  // start loading auctions ofr the usser
  loadAuctions() {
    // getting logged user auctions
    this.auctions$ = this.authService.seller.pipe(
      filter((s) => s !== null),
      map((seller) => {
        return seller.auctionList ?? [];
      }),
      switchMap((list) => {
        if (list.length <= 0) {
          return of([]);
        }
        // generating list of observables
        const auctionsObs$ = list.map((id) => {
          return this.auctionService.getAuctionById(id);
        });

        // combinating all auctions objs
        return combineLatest([...auctionsObs$]);
      })
    );
  }
}

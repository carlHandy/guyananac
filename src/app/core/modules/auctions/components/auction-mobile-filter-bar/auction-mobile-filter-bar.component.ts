import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, map, startWith } from 'rxjs/operators';
import { AuctionFiltersService } from '../../../../../shared/services/auction-filters.service';
import { AuctionPhaseTextEnum } from '../../../../../shared/enums/auction-phase-text.enum';

interface PhaseItem {
  label: string;
  value: AuctionPhaseTextEnum | null;
  color: string;
}

@Component({
  selector: 'app-auction-mobile-filter-bar',
  templateUrl: './auction-mobile-filter-bar.component.html',
})
export class AuctionMobileFilterBarComponent implements OnInit {
  filterYears: number[] = [];
  filterPhases: PhaseItem[] = [];
  searchValue: FormControl = new FormControl('');
  constructor(public auctionFilters: AuctionFiltersService) {}

  ngOnInit(): void {
    this.auctionFilters.auctions$
      .pipe(
        filter((list) => list.length > 0),
        map((auctions) => {
          this.filterYears = [
            ...new Set(
              auctions.filter((n) => n != undefined).map((n) => n.auctionYear)
            ),
          ];
        })
      )
      .subscribe();

    // pastAuction = 'pastAuction',
    const phases: PhaseItem[] = [
      {
        label: 'Upcoming',
        value: AuctionPhaseTextEnum.upcomingAuction,
        color: 'bg-auction-upcoming',
      },
      {
        label: 'Live',
        value: AuctionPhaseTextEnum.liveAuction,
        color: 'bg-auction-live',
      },
      {
        label: 'Completed',
        value: AuctionPhaseTextEnum.auctionComplete,
        color: 'bg-auction-completed',
      },
      {
        label: 'Past',
        value: AuctionPhaseTextEnum.pastAuction,
        color: 'bg-auction-past',
      },
      {
        label: 'Closed',
        value: AuctionPhaseTextEnum.auctionClosed,
        color: 'bg-auction-closed',
      },
      {
        label: 'Future',
        value: AuctionPhaseTextEnum.futureAuction,
        color: 'bg-auction-future',
      },
      {
        label: 'Pickup Completed',
        value: AuctionPhaseTextEnum.pickupComplete,
        color: 'bg-auction-pickup-completed',
      },
      {
        label: 'Cancelled',
        value: AuctionPhaseTextEnum.auctionCancelled,
        color: 'bg-auction-cancelled',
      },
    ];

    this.filterPhases = phases;

    this.searchValue.valueChanges.pipe(startWith('')).subscribe((value) => {
      this.auctionFilters.textSearch$.next(value);
    });
  }

  // new year is selected for filter
  yearSelection(year: number) {
    this.auctionFilters.yearFilter$.next(year);
  }

  // new phase is selected for filter
  phaseSelection(phase: PhaseItem | null) {
    this.auctionFilters.phaseFilter$.next(phase);
  }

  // resets all filters for the auction
  resetFilters() {
    this.auctionFilters.textSearch$.next('');
    this.auctionFilters.phaseFilter$.next(null);
    this.auctionFilters.yearFilter$.next(-1);
    this.searchValue.setValue('', {
      emitEvent: false,
    });
  }
}

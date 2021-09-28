import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { AuctionFiltersService } from '../../../../../shared/services/auction-filters.service';
import { AuctionPhaseTextEnum } from '../../../../../shared/enums/auction-phase-text.enum';

export interface PhaseItem {
  label: string;
  value: AuctionPhaseTextEnum | null;
  color: string;
}

@Component({
  selector: 'app-auctions-filter-bar',
  templateUrl: './auctions-filter-bar.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionsFilterBarComponent implements OnInit {
  filterYears: number[] = [];
  filterPhases: PhaseItem[] = [];
  searchValue: FormControl = new FormControl('');
  constructor(public auctionFilters: AuctionFiltersService) {}

  ngOnInit(): void {
    const topYear = new Date(Date.now()).getFullYear();

    for (let year = 2009; year <= topYear; year++) {
      this.filterYears.unshift(year);
    }
    const phases: PhaseItem[] = [
      {
        label: 'Future',
        value: AuctionPhaseTextEnum.futureAuction,
        color: 'bg-auction-future',
      },
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
        label: 'Closed',
        value: AuctionPhaseTextEnum.auctionClosed,
        color: 'bg-auction-closed',
      },
      {
        label: 'Pickup Completed',
        value: AuctionPhaseTextEnum.pickupComplete,
        color: 'bg-auction-pickup-completed',
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

  // handles new selection of year filter
  yearSelection(year: number) {
    this.auctionFilters.yearFilter$.next(year);
  }

  // handles phase selection of the filter
  phaseSelection(phase: PhaseItem | null) {
    this.auctionFilters.phaseFilter$.next(phase);
  }

  // resets al filters
  resetFilters() {
    const topYear = new Date(Date.now()).getFullYear();
    this.auctionFilters.textSearch$.next('');
    this.auctionFilters.phaseFilter$.next(null);
    this.auctionFilters.yearFilter$.next(topYear);
    this.searchValue.setValue('', {
      emitEvent: false,
    });
  }
}

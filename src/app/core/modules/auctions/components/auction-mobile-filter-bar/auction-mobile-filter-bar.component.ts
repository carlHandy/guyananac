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

interface MonthItem{
  label: string;
  value: number;
}

interface SortOrderItem{
  value: number;
  label: string;
}

@Component({
  selector: 'app-auction-mobile-filter-bar',
  templateUrl: './auction-mobile-filter-bar.component.html',
})
export class AuctionMobileFilterBarComponent implements OnInit {
  filterMonths: MonthItem[] = [];
  filterYears: number[] = [];
  filterPhases: PhaseItem[] = [];
  filterSort: SortOrderItem[] = [];
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

    const months: MonthItem[] = [
      {
        label: "Jan",
        value: 0
      },
      {
        label: "Feb",
        value: 1
      },
      {
        label: "Mar",
        value: 2
      },
      {
        label: "Apr",
        value: 3
      },
      {
        label: "May",
        value: 4
      },
      {
        label: "Jun",
        value: 5
      },
      {
        label: "Jul",
        value: 6
      },
      {
        label: "Aug",
        value: 7
      },
      {
        label: "Sept",
        value: 8
      },
      {
        label: "Oct",
        value: 9
      },
      {
        label: "Nov",
        value: 10
      },
      {
        label: "Dec",
        value: 11
      }
    ];

    const sortOptions: SortOrderItem[] = [
      {
        label: 'Ascending',
        value: 1
      },
      {
        label: 'Descending',
        value: 2
      }
    ]

    this.filterSort = sortOptions;
    this.filterMonths = months;
    this.filterPhases = phases;

    this.searchValue.valueChanges.pipe(startWith('')).subscribe((value) => {
      this.auctionFilters.textSearch$.next(value);
    });
  }

  //new month is selected for filter
  monthSelection(month: MonthItem | null) {
    this.auctionFilters.monthFilter$.next(month);
  }

  // new year is selected for filter
  yearSelection(year: number) {
    this.auctionFilters.yearFilter$.next(year);
  }

  //new sort order is selected for filter
  sortSelection(sortOrder: SortOrderItem | null) {
    this.auctionFilters.sortFilter$.next(sortOrder);
  }

  // new phase is selected for filter
  phaseSelection(phase: PhaseItem | null) {
    this.auctionFilters.phaseFilter$.next(phase);
  }

  // resets all filters for the auction
  resetFilters() {
    this.auctionFilters.textSearch$.next('');
    this.auctionFilters.sortFilter$.next(null);
    this.auctionFilters.monthFilter$.next(null);
    this.auctionFilters.phaseFilter$.next(null);
    this.auctionFilters.yearFilter$.next(-1);
    this.searchValue.setValue('', {
      emitEvent: false,
    });
  }
}

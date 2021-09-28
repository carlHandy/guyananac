import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Auction } from '../../../../../shared/models/auction.interface';
import { TimeZonesService } from '../../../../../shared/services/time-zones.service';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-auction-metrics',
  templateUrl: './auction-metrics.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionMetricsComponent implements OnInit {
  @Input() set auction(auction: Auction) {
    this.updateAuctionInfo(auction);
  }

  state: string = '';
  dates: string[] = [];
  bids: number[] = [];
  bidsCount: number[] = [];
  sellThro: number[] = [];
  revenues: number[] = [];

  lastBids: number;
  lastBidsCount: number;
  lastSellThro: number;
  lastRevenue: number;
  totalViews: number;
  numberOfLots: number;

  timeDiff: string = '';

  constructor(
    private timeZoneSrv: TimeZonesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  // extracts and update auction info for metrics displays upon input updates
  updateAuctionInfo(auction: Auction) {
    if (!auction.hourlyLabel || auction.hourlyLabel === '') {
      return;
    }
    console.log(auction);

    this.totalViews = auction.lotViews;
    this.numberOfLots = auction.numberOfLots;

    const dateStrings = auction.hourlyLabel.split(',');
    const dateStringsFixed = dateStrings.map((s) => `${s}00`);

    const seller = this.authService.baseSeller;
    const timeZoneID = seller.timezone;

    this.dates = dateStringsFixed
      .map((ds) => parseInt(ds))
      .map((df) => {
        const date = new Date(df * 1000).toLocaleString('en-US', {
          timeZone: timeZoneID ?? this.timeZoneSrv.defaultTimeZoneValue,
        });
        return date;
      });
    const bidsStrings = auction.uniquebidderCountHourlyData.split(',');
    const revenueStrings = auction.revenueHourlyData.split(',');
    const bidsCountStrings = auction.bidCountHourlyData.split(',');
    const sellThroStrings = auction.sellthruHourlyData.split(',');

    this.bids = bidsStrings.map((s) => parseInt(s));
    this.lastBids = this.bids[this.bids.length - 1];

    this.bidsCount = bidsCountStrings.map((s) => parseInt(s));
    this.lastBidsCount = this.bidsCount[this.bidsCount.length - 1];

    this.revenues = revenueStrings.map((s) => parseFloat(s));
    this.lastRevenue = this.revenues[this.revenues.length - 1];

    this.sellThro = sellThroStrings.map((s) => parseFloat(s));
    this.lastSellThro = this.sellThro[this.sellThro.length - 1];

    const lastDate = parseInt(dateStringsFixed[dateStringsFixed.length - 1]);
    this.timeDiff = this.timeDiffCalc(
      new Date(lastDate * 1000),
      new Date(Date.now())
    );
  }

  // calculates the difference between now and last update from the auction
  timeDiffCalc(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = 'Updated ';
    if (days > 0) {
      difference += days === 1 ? `${days} day, ` : `${days} days, `;
    }

    difference +=
      hours === 0 || hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

    difference +=
      minutes === 0 || hours === 1
        ? `${minutes} minutes`
        : `${minutes} minutes`;

    difference += ' ago.';

    return difference;
  }
}
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  NgZone,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TimeZonesService } from '../../../../../shared/services/time-zones.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AuctionsService } from '@shared/services/auctions.service';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { Auction } from '@shared/models/auction.interface';
import axios from 'axios';


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
  auction$: Observable<Auction>;
  
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
  amToken: string;
  
  timeDiff: string = '';
  numberofWinners: any;
  id: number;
  win: string;
  noData: string;

  constructor(
    private timeZoneSrv: TimeZonesService,
    private authService: AuthService,
    private auctionService: AuctionsService,
    private _ngZone: NgZone,
    private http: HttpClient
  ) {
   

    this.win = localStorage.getItem('winner');
  }

  ngOnInit(): void {
    this._ngZone.run(() => {
     this.getWinningBidders();
     this.noData = localStorage.getItem('winner-no-data');
     this.get360Token();
  });
  }

  async get360Token() {
    const token = await this.authService.baseUser.getIdToken();
    return this.http.get(`${environment.cloudFunctionsBaseUrl}get360Token`, 
    {
        headers: {
          'authorization': token,
          'Content-Type': 'application/json',
        },
    })
      .subscribe(response => {
        this.amToken = response["body"].data.token;
    });
  }
  
  async getWinningBidders(): Promise<void> {
    const auctionId = window.location.pathname.split('/auctions/')[1];
    this.auction$ = this.auctionService.getAuctionById(auctionId);
    this.auction$.subscribe(e => {
    this.auction = e;
      let id = e.am_auction_id;
      setTimeout(async () => {
        await axios.get<any>(
          `https://maxsold.maxsold.com/mapi/auctions/bidsinfo?auction_id=${id}`, {
            headers: {
              'token': this.amToken,
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            this.numberofWinners = response.data.data.number_of_winning_bidders;
            localStorage.setItem('winners', this.numberofWinners)
          }).catch(err => {
            if(err == "TypeError: Cannot read properties of undefined (reading 'number_of_winning_bidders')") {
              console.log(err)
            }
          })
      }, 1500)
  
      });
  }

  // extracts and update auction info for metrics displays upon input updates
  updateAuctionInfo(auction: Auction) {
    if (!auction.hourlyLabel || auction.hourlyLabel === '') {
      return;
    }

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
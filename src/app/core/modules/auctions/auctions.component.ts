import { Component, OnInit } from '@angular/core';
import { AuctionFiltersService } from '../../../shared/services/auction-filters.service';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
})
export class AuctionsComponent implements OnInit {
  constructor(private auctionFiltersService: AuctionFiltersService) {}
  ngOnInit(): void {
    // loading first page
    this.auctionFiltersService.loadAuctions();
  }
}

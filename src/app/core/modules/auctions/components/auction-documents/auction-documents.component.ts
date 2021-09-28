import { Component, OnInit, Input } from '@angular/core';
import { Auction } from '@shared/models/auction.interface';
import { Document } from '@shared/models/document.model';
import { AuctionsService } from '../../../../../shared/services/auctions.service';

@Component({
  selector: 'app-auction-documents',
  templateUrl: './auction-documents.component.html',
})
export class AuctionDocumentsComponent implements OnInit {
  @Input() auction: Auction | null = null;
  constructor(private auctionsService: AuctionsService) {}

  ngOnInit(): void {}

  // downloads a given document
  downloadDocumet(doc: Document) {
    this.auctionsService.downloadDocumet(doc.downloadUrl, doc.title);
  }
}

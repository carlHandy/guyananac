import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { InvoiceDetails } from '../../../../../shared/models/invoice-details.interface';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { getInvoicesItems } from '../../utils/invoice';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-item',
  templateUrl: './invoice-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceItemComponent implements OnInit {
  @Input() invoiceDetails: InvoiceDetails;
  @Input() auctionId: string;
  items: InvoiceItem[] = [];
  constructor(
    private auctionService: AuctionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.items = getInvoicesItems(this.invoiceDetails.items).sort(
      this.sortTiemsInvoiceByLots
    );
  }

  // update the auction whenever a lot has been parked as picked up by the user
  setPickedUp(value: boolean, lotId: number, lot) {
    if (true) {
      const invoiceId = `I${this.invoiceDetails.invoiceId}`;
      const lotIdString = `L${lotId}`;
      this.auctionService
        .updateLotPickedUp(lotIdString, invoiceId, this.auctionId, lot, value)
        .then(() => {
          this.snackBar.open(`Invoice updated`, null, {
            duration: 5000,
          });
        })
        .catch((err) => {
          this.snackBar.open(err, null, {
            duration: 5000,
          });
        });
    }
  }

  // sort the invoice items by lot number
  sortTiemsInvoiceByLots(a: InvoiceItem, b: InvoiceItem) {
    if (parseInt(a.itemLotNum) < parseInt(b.itemLotNum)) {
      return -1;
    }
    if (parseInt(a.itemLotNum) > parseInt(b.itemLotNum)) {
      return 1;
    }

    return 0;
  }
}

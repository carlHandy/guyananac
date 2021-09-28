import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { AuctionInvoice } from '../../../../../shared/models/auction-invoice.model';
import { ActivatedRoute } from '@angular/router';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { Auction } from '@shared/models/auction.interface';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { getInvoices, getInvoicesItems } from '../../utils/invoice';
import { InvoiceDetails } from '@shared/models/invoice-details.interface';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { PdfService } from '../../../../../shared/services/pdf.service';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.page.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceReportPage implements OnInit {
  invoice$: Observable<AuctionInvoice>;
  auction$: Observable<Auction>;
  filter: BehaviorSubject<string> = new BehaviorSubject('');
  constructor(
    private route: ActivatedRoute,
    private auctionService: AuctionsService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    // getting route params to get correct invoice data
    this.route.paramMap.subscribe((params) => {
      const auctionId = params.get('id');
      this.auction$ = this.auctionService.getAuctionById(auctionId);

      if (auctionId) {
        this.invoice$ = combineLatest([
          this.filter.pipe(distinctUntilChanged()),
          this.auctionService.getAuctionInvoice(auctionId),
        ]).pipe(
          map(([filter, invoice]) => {
            const invoices: InvoiceDetails[] = getInvoices(invoice.invoices);
            const unPaid = invoices.filter((i) => i.invoiceBalance > 0);
            const paid = invoices.filter((i) => i.invoiceBalance === 0);

            let sortedPaid: InvoiceDetails[] = [];
            switch (filter) {
              case 'lot':
                sortedPaid = paid.sort(this.sortInvoiceByLots);
                break;
              case 'lastname':
                sortedPaid = paid.sort(this.sortInvoiceByLastName);
                break;
              case 'firstname':
                sortedPaid = paid.sort(this.sortInvoiceByFirstName);

                break;
              case 'pickup':
                sortedPaid = paid.sort(this.sortInvoiceByPickupDate);

                break;
              default:
                sortedPaid = paid;
                break;
            }

            const res = {
              ...invoice,
              parsedUnPaidInvoiceItems: unPaid,
              parsedPaidInvoiceItems: sortedPaid,
            };
            return res;
          })
        );
      }
    });
  }

  // filter change
  setFilter(filter: string) {
    this.filter.next(filter);
  }

  // sorting invoices by lots
  sortInvoiceByLots(a: InvoiceDetails, b: InvoiceDetails) {
    if (a.invoiceId < b.invoiceId) {
      return -1;
    }
    if (a.invoiceId > b.invoiceId) {
      return 1;
    }

    return 0;
  }

  // sorting invoices items by lot number
  sortTiemsInvoiceByLots(a: InvoiceItem, b: InvoiceItem) {
    if (parseInt(a.itemLotNum) < parseInt(b.itemLotNum)) {
      return -1;
    }
    if (parseInt(a.itemLotNum) > parseInt(b.itemLotNum)) {
      return 1;
    }

    return 0;
  }

  // sorting invoices by last name
  sortInvoiceByLastName(a: InvoiceDetails, b: InvoiceDetails) {
    if (a.lastName < b.lastName) {
      return -1;
    }
    if (a.lastName > b.lastName) {
      return 1;
    }

    return 0;
  }

  // sorting invoices by first name
  sortInvoiceByFirstName(a: InvoiceDetails, b: InvoiceDetails) {
    if (a.firstName < b.firstName) {
      return -1;
    }
    if (a.firstName > b.firstName) {
      return 1;
    }

    return 0;
  }

  // sorting invoices by pickup date
  sortInvoiceByPickupDate(a: InvoiceDetails, b: InvoiceDetails) {
    if (a.pickupStarttime < b.pickupStarttime) {
      return 1;
    }
    if (a.pickupStarttime > b.pickupStarttime) {
      return -1;
    }

    return 0;
  }

  // handles the download of the invoice report
  download(auctionId: string, sortOrder: string, auctionNumber: number) {
    this.pdfService.getInfoicePdf(auctionId, sortOrder, auctionNumber);
  }
}

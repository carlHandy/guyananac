import { Address } from './address.model';
import { InvoiceDetails } from './invoice-details.interface';

export interface AuctionInvoice {
  address: Address;
  am_auction_id: number;
  auctionTitle: string;
  invoices: any;
  parsedUnPaidInvoiceItems: InvoiceDetails[];
  parsedPaidInvoiceItems: InvoiceDetails[];
  invoicesCnt: number;
  issueDate: any;
  lotsCnt: number;
  unpaidInvoiceAmt: number;
  unpaidInvoiceCnt: number;
}

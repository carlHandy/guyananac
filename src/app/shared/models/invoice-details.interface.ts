import { InvoiceItem } from './invoice-item';

export interface InvoiceDetails {
  invoiceBalance: number;
  invoiceId: number;
  invoiceTot: number;
  items: InvoiceItem[];
  lastName: string;
  firstName: string;
  pickupEndtime: any;
  pickupStarttime: any;
}

import { AddressCountryEnum } from '@shared/enums/address-country.enum';
import { AuctionTypeEnum } from '@shared/enums/auction-type.enum';
import { Address } from './address.model';
import { AuctionNotification } from './auction.notification.model';
import { Contract } from './contract.model';
import { Statement } from './statement.model';

export class Auction {
  address: Address;
  invoices: string;
  invoiceDate: string;
  lotViews: number;
  numberOfLots: number;
  hourlyLabel: string;

  auctionId: string;
  am_auction_id: number;
  auctionTitle: string;
  auctionAlias: string;
  timezone: number;
  countryCode: AddressCountryEnum;

  auctionType: AuctionTypeEnum;

  startDate: any; // utc
  endDate: any; // utc
  cataloguingDate: any; // utc
  pickupDate: any; // utc
  modifyDateDate: any;
  minDate: any;
  cancelledDate: any;
  isCancelled: boolean;
  pickupDateText: string;
  auctionYear: number;
  auctionPhase: string;
  catalogLots: string;
  isAuctionDatesLocked: boolean;
  mx_auction_id: number;
  contract: Contract;
  uploadedDocs: string[];
  auctionOwnerTeam: string;
  auctionOwnerSeller: string;
  auctionObserversSeller: string[];
  auctionObserversTeam: string[];
  recentNotifications: Map<string, AuctionNotification>; // number is notificationId

  sellerPermissionsReadWrite: string[];
  sellerPermissionsReadOnly: string[];

  // Record Data
  createdDate: Date;
  modifiedDate: number;

  // line graph
  bidCountHourlyData: string;
  bidCountHourlyLabels: string[];

  // line graph
  uniquebidderCountHourlyData: string;
  uniquebidderCountHourlyLabels: string[];

  // line graph
  revenueHourlyData: string;
  revenueHourlyLabels: string[];

  // line graph
  sellthruHourlyData: string;
  sellthruHourlyLabels: string[];

  gonebyDate: Date; // utc
  contractDate: Date; // utc
  associatedTeams: string[]; // I can't remember what this is for.

  // Progress Tab
  contractUrl: string;
  settlementUrl: string;

  // Performance Tab
  // Bar Graph with 3 bars.
  uniquePageViews: number;
  totalPageViews: number;

  // just a number. No graph.
  refundRate: number;

  // Marketing: Use the single MarketingSiteList document in firebase.

  // if number is 4, enable Steps 1, 2, 3, 4. Make these card expandable. Default card 4 to open.
  // Green check mark is green for steps 1, 2, 3, 4. Green check mark is off for the rest.
  currentStep: number;

  catalogLost: number;

  statements: Map<string, Statement>;

  customDocuments: Document[];
  standardDocuments: Document[];
}

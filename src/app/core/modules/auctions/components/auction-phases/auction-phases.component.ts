import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Auction } from '@shared/models/auction.interface';
import { AuctionTypeEnum } from '@shared/enums/auction-type.enum';
import { ContractService } from '@shared/services/contract-service.service';
import { AuctionsService } from '../../../../../shared/services/auctions.service';
import { AuctionPhaseEnum } from '@shared/enums/auction-phase.enum';
import { Statement } from '../../../../../shared/models/statement.model';
import { getStatementsFromAuction } from '../../utils/invoice';

interface PhaseAuctionData {
  showContractSubmitted: boolean;
  showBuildYourAuctionCatalog: boolean;
  showPreparingAndScheduling: boolean;
  showReviewCatalog: boolean;
  showSetAuctionDates: boolean;
  showAuctionOpen: boolean;
  showAuctionClosedPickupPending: boolean;
  showPickupScheduledFor: boolean;
  showPickupScheduledForMaxSold: boolean;
  showSubmitPickupFeedback: boolean;
  showSettlementReport: boolean;

  enableContractSubmitted: boolean;
  enableBuildYourActionNotUseApp: boolean;
  enableBuildYourActionUseApp: boolean;
  enablePreparing: boolean;
  enableReviewCatalogAndSetDate: boolean;
  enableSetDates: boolean;
  enableAuctionOpen: boolean;
  enableAuctionClosedPickupPending;
  enablePickupScheduled: boolean;
  enableScheduleForMaxSold: boolean;
  enableSubmitPickupFeedback: boolean;
  enableSettlementReport: boolean;
}

@Component({
  selector: 'app-auction-phases',
  templateUrl: './auction-phases.component.html',
  styles: [
    `
      .mat-expansion-panel-header-title {
        max-width: 100% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionPhasesComponent implements OnInit {
  @Input() auction: Auction;
  auctionPhasesState: PhaseAuctionData;
  statements: Statement[] = [];
  constructor(
    private contractService: ContractService,
    private auctionService: AuctionsService
  ) {}

  ngOnInit(): void {
    this.fillAuctionPhasesState();
    this.buildStatements();
  }

  // downloads a given contract
  downloadContract(contractId: string, contractNum: string) {
    this.contractService.downloadContract(contractId, contractNum);
  }

  // download a given statement
  downloadStatement(statementId: string) {
    this.contractService.downloadStatement(statementId);
  }

  // handles the auction phase state, given an auction, and a set of rules
  // stablished for displaying a certain auction, that condition is stored
  // at auctionPhasesState
  fillAuctionPhasesState() {
    const auctionCurrentPhase = this.auctionService.getPhaseNumber(
      this.auction.auctionPhase
    );

    // always shown
    const showContractSubmitted = true;
    const showAuctionOpen = true;
    const showAuctionClosedPickupPending = true;
    const showSettlementReport = true;

    let showBuildYourAuctionCatalog = false;
    let showSetAuctionDates = false;
    let showPickupScheduledFor = false;
    let showPickupScheduledForMaxSold = false;
    let showSubmitPickupFeedback = false;

    const isSellerManaged =
      this.auction.auctionType === AuctionTypeEnum.SellerManaged;
    const isMaxsoldManaged =
      this.auction.auctionType === AuctionTypeEnum.MaxsoldManaged;
    // shown when seller managed
    if (isSellerManaged) {
      showBuildYourAuctionCatalog = true;
      showSetAuctionDates = true;
      showPickupScheduledFor = true;
      showSubmitPickupFeedback = true;
    }

    let showPreparingAndScheduling = false;
    let showReviewCatalog = false;

    // shown when maxsold
    if (isMaxsoldManaged) {
      showPreparingAndScheduling = true;
      showReviewCatalog = true;
      showPickupScheduledForMaxSold = true;
    }

    let enableContractSubmitted = false;
    let enableBuildYourActionNotUseApp = false;
    let enableBuildYourActionUseApp = false;
    let enablePreparing = false;
    let enableReviewCatalogAndSetDate = false;
    let enableSetDates = false;
    let enableAuctionOpen = false;
    let enableAuctionClosedPickupPending = false;
    let enablePickupScheduled = false;
    let enableSubmitPickupFeedback = false;
    let enableSettlementReport = false;
    let enableScheduleForMaxSold = false;

    if (auctionCurrentPhase >= AuctionPhaseEnum.futureAuction) {
      enableContractSubmitted = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.futureAuction &&
      isSellerManaged &&
      (this.auction?.contract === null ||
        this.auction?.contract?.picUploadType !== 'useApp')
    ) {
      enableBuildYourActionNotUseApp = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.futureAuction &&
      isSellerManaged &&
      this.auction?.contract?.picUploadType === 'useApp'
    ) {
      enableBuildYourActionUseApp = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.futureAuction &&
      isMaxsoldManaged
    ) {
      enablePreparing = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.futureAuction &&
      isMaxsoldManaged &&
      (this.auction.catalogLost > 0 || this.auction.numberOfLots > 0)
    ) {
      enableReviewCatalogAndSetDate = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.futureAuction &&
      isSellerManaged &&
      this.auction.isAuctionDatesLocked
    ) {
      enableSetDates = true;
    }

    if (auctionCurrentPhase >= AuctionPhaseEnum.liveAuction) {
      enableAuctionOpen = true;
    }

    if (auctionCurrentPhase >= AuctionPhaseEnum.auctionClosed) {
      enableAuctionClosedPickupPending = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.auctionClosed &&
      this.auction.invoices !== null &&
      isSellerManaged
    ) {
      enablePickupScheduled = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.pickupComplete &&
      isSellerManaged
    ) {
      enableSubmitPickupFeedback = true;
    }

    if (auctionCurrentPhase >= AuctionPhaseEnum.auctionComplete) {
      enableSettlementReport = true;
    }

    if (
      auctionCurrentPhase >= AuctionPhaseEnum.auctionClosed &&
      isMaxsoldManaged
    ) {
      enableScheduleForMaxSold = true;
    }

    this.auctionPhasesState = {
      showContractSubmitted,
      showBuildYourAuctionCatalog,
      showPreparingAndScheduling,
      showReviewCatalog,
      showSetAuctionDates,
      showAuctionOpen,
      showAuctionClosedPickupPending,
      showPickupScheduledFor,
      showSubmitPickupFeedback,
      showSettlementReport,
      enableContractSubmitted,
      enableBuildYourActionNotUseApp,
      enableBuildYourActionUseApp,
      enablePreparing,
      enableReviewCatalogAndSetDate,
      showPickupScheduledForMaxSold,
      enableSetDates,
      enableAuctionOpen,
      enableAuctionClosedPickupPending,
      enablePickupScheduled,
      enableSubmitPickupFeedback,
      enableSettlementReport,
      enableScheduleForMaxSold,
    };
  }

  // builds the correct url for checking the pickup feedback form of an auction
  buildPickupFeedbackForm() {
    let address = '';
    if (this.auction.address) {
      address = this.auction.address.address.replace('', '%20');
    }
    let link = `https://form.jotform.com/61193954251962?auctionId=${this.auction.am_auction_id}&auctionStreet84=${address}&linkTo64=https://maxsold.maxsold.com/auction/${this.auction.am_auction_id}`;
    return link;
  }

  // transforms statements map into array
  buildStatements() {
    this.statements = getStatementsFromAuction(this.auction.statements);
  }
}

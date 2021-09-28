import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuctionsRoutingModule } from './auctions-routing.module';
import { AuctionsComponent } from './auctions.component';
import { AuctionsTableComponent } from './components/auctions-table/auctions-table.component';
import { SharedModule } from '../../../shared/shared.module';
import { AuctionsFilterBarComponent } from './components/auctions-filter-bar/auctions-filter-bar.component';
import { AuctionCardComponent } from './components/auction-card/auction-card.component';
import { AuctionDetailsPage } from './pages/auction-details/auction-details.page';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InviteObserverDialog } from './components/invite-observer/invite-observer.dialog';
import { TeamMemberComponent } from './components/team-member/team-member.component';
import { InvoiceReportPage } from './pages/invoice-report/invoice-report.page';
import { AuctionTypePipe } from './utils/pipes/auction-type.pipe';
import { AuctionAddressPipe } from './utils/pipes/auction-address.pipe';
import { AuctionTeamComponent } from './components/auction-team/auction-team.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuctionMetricsComponent } from './components/auction-metrics/auction-metrics.component';
import { BidsChartComponent } from './components/auction-charts/bids-chart/bids-chart.component';
import { ViewsChartComponent } from './components/auction-charts/views-chart/views-chart.component';
import { BidCountChartComponent } from './components/auction-charts/bid-count-chart/bid-count-chart.component';
import { SellThroChartComponent } from './components/auction-charts/sell-thro-chart/sell-thro-chart.component';
import { InvoiceItemComponent } from './components/invoice-item/invoice-item.component';
import { AuctionNotificationComponent } from './components/auction-notification/auction-notification.component';
import { ActionNotificationExpansionPanelComponent } from './components/action-notification-expansion-panel/action-notification-expansion-panel.component';
import { AuctionPickUpDatePipe } from './utils/pipes/auction-pick-up-date.pipe';
import { AuctionPhasesComponent } from './components/auction-phases/auction-phases.component';
import { AuctionOwnerTeamComponent } from './components/auction-owner-team/auction-owner-team.component';
import { AuctionPhaseLabelComponent } from './components/auction-phase-label/auction-phase-label.component';
import { AuctionLineChartComponent } from './components/auction-line-chart/auction-line-chart.component';
import { TeamInvitationBoxComponent } from './components/team-invitation-box/team-invitation-box.component';
import { AuctionListPage } from './pages/auction-list/auction-list.page';
import { AuctionInvitationBoxComponent } from './components/auction-invitation-box/auction-invitation-box.component';
import { AuctionTeamInvitationBoxComponent } from './components/auction-team-invitation-box/auction-team-invitation-box.component';
import { AuctionObserverTeamComponent } from './components/auction-observer-team/auction-observer-team.component';
import { AuctionMobileFilterBarComponent } from './components/auction-mobile-filter-bar/auction-mobile-filter-bar.component';
import { ChangeAuctionNameComponent } from './components/change-auction-name/change-auction-name.component';
import { AuctionChangeOwnerDialog } from './components/auction-change-owner/auction-change-owner.dialog';
import { AuctionDocumentsComponent } from './components/auction-documents/auction-documents.component';

@NgModule({
  declarations: [
    AuctionsComponent,
    AuctionsTableComponent,
    AuctionsFilterBarComponent,
    AuctionCardComponent,
    AuctionDetailsPage,
    InviteObserverDialog,
    TeamMemberComponent,
    InvoiceReportPage,
    AuctionTypePipe,
    AuctionAddressPipe,
    AuctionTeamComponent,
    AuctionMetricsComponent,
    BidsChartComponent,
    ViewsChartComponent,
    BidCountChartComponent,
    SellThroChartComponent,
    InvoiceItemComponent,
    AuctionNotificationComponent,
    ActionNotificationExpansionPanelComponent,
    AuctionPickUpDatePipe,
    AuctionPhasesComponent,
    AuctionOwnerTeamComponent,
    AuctionPhaseLabelComponent,
    AuctionLineChartComponent,
    TeamInvitationBoxComponent,
    AuctionListPage,
    AuctionInvitationBoxComponent,
    AuctionTeamInvitationBoxComponent,
    AuctionObserverTeamComponent,
    AuctionMobileFilterBarComponent,
    ChangeAuctionNameComponent,

    AuctionChangeOwnerDialog,

    AuctionDocumentsComponent,
  ],
  imports: [
    CommonModule,
    AuctionsRoutingModule,
    SharedModule,
    NgxChartsModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe],
})
export class AuctionsModule {}

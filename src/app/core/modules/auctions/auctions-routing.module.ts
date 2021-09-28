import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { AuctionsComponent } from './auctions.component';

// pages
import { AuctionDetailsPage } from './pages/auction-details/auction-details.page';
import { InvoiceReportPage } from './pages/invoice-report/invoice-report.page';
import { AuctionListPage } from './pages/auction-list/auction-list.page';

const routes: Routes = [
  {
    path: '',
    component: AuctionsComponent,
    children: [
      {
        path: '',
        component: AuctionListPage,
      },
      {
        path: ':id',
        component: AuctionDetailsPage,
      },
      {
        path: 'invoice-report/:id',
        component: InvoiceReportPage,
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: '',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuctionsRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// pages
import { NotFoundComponent } from './pages/not-found/not-found.component';

// modules
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

// components
import { AuctionInvitationComponent } from './components/auction-invitation/auction-invitation.component';
import { EditableImageComponent } from './components/editable-image/editable-image.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { LoaderBoxComponent } from './components/loader-box/loader-box.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ConfirmationDialog } from './components/confirmation/confirmation.dialog';
import { BadgetComponent } from './components/badget/badget.component';
import { DisabledControlDirective } from './directives/disabled-control.directive';
import { SortArrowComponent } from './components/sort-arrow/sort-arrow.component';
import { CloseableCardComponent } from './components/closeable-card/closeable-card.component';
import { SellerCardComponent } from './components/seller-card/seller-card.component';
import { DateYearPipe } from './pipes/date-year.pipe';
import { GooglePlacesDirective } from './directives/google-places.directive';
import { AuctionDateShortPipe } from './pipes/auction-date-short.pipe';
import { AuctionDatePipe } from './pipes/auction-date.pipe';
import { ScrollDirective } from './directives/scroll.directive';
import { InviteCardComponent } from './components/invite-card/invite-card.component';

@NgModule({
  declarations: [
    NotFoundComponent,
    LoaderBoxComponent,
    SearchBarComponent,
    EditableImageComponent,
    ConfirmationDialog,
    AddressFormComponent,
    AuctionInvitationComponent,
    BadgetComponent,
    DisabledControlDirective,
    SortArrowComponent,
    CloseableCardComponent,
    SellerCardComponent,
    DateYearPipe,
    GooglePlacesDirective,
    AuctionDateShortPipe,
    AuctionDatePipe,
    ScrollDirective,
    InviteCardComponent,
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [
    NotFoundComponent,
    MaterialModule,
    LoaderBoxComponent,
    SearchBarComponent,
    EditableImageComponent,
    AddressFormComponent,
    AuctionInvitationComponent,
    BadgetComponent,
    DisabledControlDirective,
    SortArrowComponent,
    CloseableCardComponent,
    SellerCardComponent,
    DateYearPipe,
    AuctionDateShortPipe,
    AuctionDatePipe,
    ScrollDirective,
    InviteCardComponent,
  ],
})
export class SharedModule {}

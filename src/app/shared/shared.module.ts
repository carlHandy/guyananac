import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// pages
import { NotFoundComponent } from './pages/not-found/not-found.component';

// modules
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';

// components
import { EditableImageComponent } from './components/editable-image/editable-image.component';
// import { AddressFormComponent } from './components/address-form/address-form.component';
import { LoaderBoxComponent } from './components/loader-box/loader-box.component';
import { ConfirmationDialog } from './components/confirmation/confirmation.dialog';
import { BadgetComponent } from './components/badget/badget.component';
import { CloseableCardComponent } from './components/closeable-card/closeable-card.component';
// import { SellerCardComponent } from './components/seller-card/seller-card.component';
@NgModule({
  declarations: [
    NotFoundComponent,
    LoaderBoxComponent,
    EditableImageComponent,
    ConfirmationDialog,
    BadgetComponent,
    CloseableCardComponent,
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  exports: [
    NotFoundComponent,
    MaterialModule,
    LoaderBoxComponent,
    EditableImageComponent,
    BadgetComponent,
    CloseableCardComponent,
  ],
})
export class SharedModule {}

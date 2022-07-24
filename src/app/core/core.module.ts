import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { CoreRoutingModule } from './core-routing.module';
import { SharedModule } from '@shared/shared.module';

// components
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [ContentLayoutComponent],
  imports: [
    CommonModule,
    CoreRoutingModule,
    SharedModule,
    NgxChartsModule,
    NgxMaskModule,
  ],
})
export class CoreModule {}

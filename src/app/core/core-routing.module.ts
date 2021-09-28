import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';

const routes: Routes = [
  {
    path: '',
    component: ContentLayoutComponent,
    children: [
      {
        path: 'auctions',
        loadChildren: () =>
          import('./modules/auctions/auctions.module').then(
            (m) => m.AuctionsModule
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./modules/notifications/notifications.module').then(
            (m) => m.NotificationsModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./modules/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
      {
        path: 'preferences',
        loadChildren: () =>
          import('./modules/preferences/preferences.module').then(
            (m) => m.PreferencesModule
          ),
      },

      { path: '', redirectTo: 'auctions', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule {}

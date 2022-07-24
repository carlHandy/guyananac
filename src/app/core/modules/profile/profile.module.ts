import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';
// import { SharedModule } from '@shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';

// components
// import { SellerPersonalInformationComponent } from './components/seller-personal-information/seller-personal-information.component';
// import { TeamPartnerInformationComponent } from './components/team-partner-information/team-partner-information.component';
// import { SellerAuthInformationComponent } from './components/seller-auth-information/seller-auth-information.component';
// import { UpdateProfileImageDialog } from './components/update-profile-image/update-profile-image.dialog';
// import { SellerTeamsListComponent } from './components/seller-teams-list/seller-teams-list.component';
// import { TeamAddMemberComponent } from './components/team-add-member/team-add-member.component';
// import { SellerSummaryComponent } from './components/athlete-summary/athlete-summary.component';
// import { TeamDetailsComponent } from './components/team-details/team-details.component';
// import { CreateTeamDialog } from './components/create-team/create-team.dialog';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [
    // UpdateProfileImageDialog,
    ProfileComponent,
    // CreateTeamDialog,
    // TeamPartnerInformationComponent,
    // SellerSummaryComponent,
    // SellerPersonalInformationComponent,
    // SellerTeamsListComponent,
    // TeamAddMemberComponent,
    // TeamDetailsComponent,
  ],
  imports: [
    ProfileRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    // SharedModule,
    FormsModule,
    NgxMaskModule,
  ],
})
export class ProfileModule {}

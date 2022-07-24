import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// modules
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// components
import { AuthProvidersComponent } from './components/auth-providers/auth-providers.component';
import { AuthComponent } from './auth.component';

// pages
import { SignUpDetailsComponent } from './pages/sign-up-details/sign-up-details.component';
import { VerifyEmailPage } from './pages/verify-email/verify-email.page';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { RegisterSuccessComponent } from './pages/register-success/register-success.component';

@NgModule({
  declarations: [
    AuthComponent,
    SignInComponent,
    SignUpComponent,
    AuthProvidersComponent,
    SignUpDetailsComponent,
    VerifyEmailPage,
    RegisterSuccessComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: []

})
export class AuthModule {}

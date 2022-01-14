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
import { TroubleSignInPage } from './pages/trouble-sign-in/trouble-sign-in.page';
import { VerifyEmailPage } from './pages/verify-email/verify-email.page';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { RegisterSuccessComponent } from './pages/register-success/register-success.component';

import { environment } from 'src/environments/environment';

import {
  RECAPTCHA_SETTINGS,
  RecaptchaModule,
  RecaptchaSettings,
  RecaptchaFormsModule
} from 'ng-recaptcha';

const globalSettings: RecaptchaSettings = { siteKey: environment.recaptcha.challengeKey };

@NgModule({
  declarations: [
    AuthComponent,
    SignInComponent,
    SignUpComponent,
    AuthProvidersComponent,
    SignUpDetailsComponent,
    VerifyEmailPage,
    TroubleSignInPage,
    RegisterSuccessComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  providers: [{ provide: RECAPTCHA_SETTINGS, useValue: globalSettings }]

})
export class AuthModule {}

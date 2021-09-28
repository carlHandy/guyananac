import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// pages
import { AuthComponent } from './auth.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignUpDetailsComponent } from './pages/sign-up-details/sign-up-details.component';

// guards
import { NoAuthGuard } from './guards/no-auth.guard';
import { RegisterGuard } from './guards/register.guard';
import { VerifyEmailPage } from './pages/verify-email/verify-email.page';
import { TroubleSignInPage } from './pages/trouble-sign-in/trouble-sign-in.page';
import { RegisterSuccessComponent } from './pages/register-success/register-success.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'sign-in',
        component: SignInComponent,
        canActivate: [NoAuthGuard],
      },
      {
        path: 'trouble-sign-in',
        component: TroubleSignInPage,
        canActivate: [NoAuthGuard],
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
        canActivate: [NoAuthGuard],
      },
      {
        path: 'support',
        component: VerifyEmailPage,
      },
      {
        path: 'sign-up/details',
        component: SignUpDetailsComponent,
        canActivate: [RegisterGuard],
      },
      {
        path: 'register-success',
        component: RegisterSuccessComponent,
      },

      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

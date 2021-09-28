import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

// material
import { MatSnackBar } from '@angular/material/snack-bar';

// services
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trouble-sign-in',
  templateUrl: './trouble-sign-in.page.html',
  styleUrls: ['../../../../assets/styles/input-with-labels.scss'],
  styles: [
    `
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 700px;
        }
      }
      .content-box {
        min-height: calc(100vh - 224px);
      }
    `,
  ],
})
export class TroubleSignInPage implements OnInit {
  emailControl: FormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  errorMessage = '';
  successMessage = '';
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  // resets user password
  resetPassword() {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    const email = (this.emailControl.value as string).toLowerCase();

    this.authService.checkAuthMethod(email).then((res) => {
      if (!res.includes('password')) {
        const message = `Password change is not available for third party sign up methods.`;
        this.errorMessage = message;
        this.snackBar.open(message, null, {
          duration: 5000,
        });
      } else {
        this.sendResetPassword(this.emailControl.value);
      }
    });
  }

  // sends firebase reset password email
  sendResetPassword(email: string) {
    this.authService
      .changeUserPassword(email)
      .then(() => {
        this.snackBar.open('Reset email has been sent', null, {
          duration: 5000,
        });
        this.router.navigateByUrl('/auth');
      })
      .catch((err) => {
        this.errorMessage = err.message;
        this.snackBar.open(
          `Error sending reset email. Error: ${err.message}`,
          null,
          {
            duration: 5000,
          }
        );
      });
  }
}

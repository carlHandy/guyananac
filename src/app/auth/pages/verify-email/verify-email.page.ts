import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
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
export class VerifyEmailPage implements OnInit {
  accountEmail = '';
  actionCode = '';
  error = '';
  mode = '';

  readyForPasswordChange = false;
  passwordChanged = false;
  emailVerified = false;

  invalidActionMessage =
    'The activation code is invalid or it is expired, please request a new email.';

  passwordControl: FormControl;

  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AngularFireAuth,
    private snackBar: MatSnackBar
  ) {
    this.passwordControl = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(256),
    ]);
  }

  ngOnInit(): void {
    // handles the incoming mode and auction code
    this.activatedRoute.queryParams.subscribe((params) => {
      let mode = params.mode;
      let actionCode = params.oobCode;

      this.actionCode = actionCode;
      this.mode = mode;
      if (!mode || !actionCode) {
        this.error = 'Invalid params';
      } else {
        console.log(this.mode);
        console.log(this.actionCode);

        switch (mode) {
          case 'resetPassword':
            this.handleResetPassword(actionCode);
            break;
          case 'recoverEmail':
            this.error = 'This function is not implemented.';
            break;
          case 'verifyEmail':
            this.handleVerifyEmail(actionCode);
            break;
          default:
            console.log('default');

            this.error = '';
        }
      }
    });
  }

  // handles the password auction code for reset
  handleResetPassword(actionCode) {
    this.auth
      .verifyPasswordResetCode(actionCode)
      .then((email) => {
        this.accountEmail = email;
        this.readyForPasswordChange = true;
      })
      .catch((error) => {
        this.snackBar.open(this.invalidActionMessage, null, {
          duration: 7000,
        });
        this.error = this.invalidActionMessage;
      });
  }

  // resets the password with firebase library
  resetPassword() {
    if (this.passwordControl.invalid) {
      this.passwordControl.markAllAsTouched();
      return;
    }

    this.auth
      .confirmPasswordReset(this.actionCode, this.passwordControl.value)
      .then((resp) => {
        this.passwordChanged = true;
        this.snackBar.open(
          'Your password has been changed successfully.',
          null,
          {
            duration: 7000,
          }
        );
      })
      .catch((error) => {
        this.snackBar.open(this.invalidActionMessage, null, {
          duration: 7000,
        });
        this.error = this.invalidActionMessage;
      });
  }

  // handles email verification for the user
  handleVerifyEmail(actionCode: string) {
    this.auth
      .applyActionCode(actionCode)
      .then((resp) => {
        this.emailVerified = true;
        this.snackBar.open('Your email has been verified successfully.', null, {
          duration: 7000,
        });
      })
      .catch((error) => {
        this.snackBar.open(this.invalidActionMessage, null, {
          duration: 7000,
        });
        this.error = this.invalidActionMessage;
      });
  }
}

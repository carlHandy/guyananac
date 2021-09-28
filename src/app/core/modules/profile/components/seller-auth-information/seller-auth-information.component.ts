import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// services
import { AuthService } from '@shared/services/auth.service';
import { SellerService } from '@shared/services/seller.service';

// models
import { AuthenticationTypeEnum } from '@shared/enums/authentication-type.enum';
import { ProfileChangeEmailViewModel } from '../../models/view-models/profile-change-email.view-model';

// rxjs
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-seller-auth-information',
  templateUrl: './seller-auth-information.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerAuthInformationComponent implements OnInit {
  authType = AuthenticationTypeEnum;
  editMode = false;
  vm$: Observable<ProfileChangeEmailViewModel>;
  emailForm: FormGroup;
  environment = environment;

  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = new FormGroup({
      newEmail: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(256),
        Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'),
      ]),
    });
  }

  ngOnInit(): void {
    this.emailForm.get('newEmail').disable();

    this.vm$ = this.sellerService.getEmailSettings();
    this.vm$.subscribe((vm) => {
      if (vm) {
        this.emailForm.get('newEmail').setValue(vm.email);
      }
    });
  }

  // sends the reset password email for the logged user
  changePassword(email: string) {
    this.authService
      .changeUserPassword(email)
      .then(() => {
        this.snackBar.open('Reset email has been sent', null, {
          duration: 5000,
        });
      })
      .catch((err) => {
        () => {
          this.snackBar.open('Error sending reset email', null, {
            duration: 5000,
          });
        };
      });
  }

  // cancels the edit mode and old state is set
  cancel(email: string) {
    this.toggleEditMode();
    this.emailForm.get('newEmail').setValue(email);
  }

  // changes the user email and sends firebase corresponding actions
  changeEmail() {
    if (!environment.allowEmailChange) {
      return;
    }

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    let { newEmail } = this.emailForm.value;

    newEmail = (newEmail as string).toLowerCase();

    this.authService
      .changeUserEmail(newEmail)
      .then(() => {
        this.snackBar.open('Email has been changed', null, {
          duration: 5000,
        });
        this.sellerService
          .updateEmail(newEmail)
          .then(() => {
            this.authService.sendVerificationEmail();
            this.authService.logout();
          })
          .catch((err) => {
            this.snackBar.open(err.message, null, {
              duration: 5000,
            });
          });
      })
      .catch((err) => {
        this.snackBar.open(err.message, null, {
          duration: 5000,
        });
      });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;

    if (this.editMode) {
      if (environment.allowEmailChange) {
        this.emailForm.get('newEmail').enable();
      }
    } else {
      this.emailForm.get('newEmail').disable();
    }
  }
}

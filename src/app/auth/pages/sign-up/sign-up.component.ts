import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
// import { load } from 'recaptcha-v3';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

// services
import { AuthService } from '../../../shared/services/auth.service';
import { SellerService } from '../../../shared/services/seller.service';
import { getAuthMethod } from '../../utils/helpers';

@Component({
  templateUrl: './sign-up.component.html',
  styles: [
    `
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 750px;
        }
      }
    `,
  ],
})
export class SignUpComponent {
  signUpForm: FormGroup;
  errorMessage: string;
  requesting: boolean = false;
  showPassword = false;
  showPasswordConf = false;
  userIP: number;
  userAgent: string;
  captcha:boolean;

  public addTokenLog(message: string, token: string | null) {
    this.http.post(`https://recaptchaenterprise.googleapis.com/v1beta1/projects/maxsold-seller-portal/assessments?key=AIzaSyAwWEWCBqBWNvy796Za9VUIsJfrGRYOAAo`, {
      "event": {
        "token": token,
        "siteKey": environment.recaptcha.challengeKey,
        "expectedAction": "register",
        "userIpAddress": this.userIP,
        "userAgent": this.userAgent
      }
    }).subscribe(response => {
      if (environment.production == true) {
        return response;
      }
      console.log('captcha', response);
      return response;
    })
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private sellerservice: SellerService,
    private http: HttpClient
  ) {
    this.signUpForm = new FormGroup(
      {
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.maxLength(256),
          Validators.pattern(
            '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'
          ),
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
        ]),
        passwordConfirmation: new FormControl(''),
        captcha: new FormControl('', [
          Validators.required,
        ])
      },
      { validators: this.checkPasswords }
    );

    this.getUserIP();
  }

  // creates a new user with firebase email/password
  registerEmailPassword() {
    this.errorMessage = '';
    this.requesting = true;

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    let { email, password } = this.signUpForm.value;

    email = (email as string).toLowerCase();

    this.authService
      .registerEmailPassword(email, password)
      .then((user) => {
        user.user
          .sendEmailVerification()
          .then(() => {
            // user created for auth firebase
            this.sellerservice
              .getSellerByEmail(email)
              .then((data) => {
                if (data.docs.length >= 1) {
                  // document found
                  const sellerId = data.docs[0].id;
                  Promise.all([
                    this.sellerservice.updateSellerPreferencesById(
                      sellerId,
                      true,
                      'important'
                    ),
                    this.sellerservice.updateSellerPreferencesById(
                      sellerId,
                      true,
                      'info'
                    ),
                    this.sellerservice.updateSellerAuthType(
                      getAuthMethod(user.user.providerId),
                      sellerId
                    ),
                  ]);
                  this.sellerservice
                    .createUserReference(sellerId, user.user.uid)
                    .then(() => {
                      this.router.navigateByUrl('/auth/register-success');
                    })
                    .catch((error: any) => {
                      this.requesting = false;
                      this.errorMessage = error.message;
                      this.snackBar.open(error.message, null, {
                        duration: 5000,
                      });
                    });
                } else {
                  // no seller document found for this email
                  this.sellerservice
                    .createUserReference(user.user.uid, user.user.uid)
                    .then(() => {
                      // references made successfuly
                      this.router.navigateByUrl('/auctions');
                    })
                    .catch((error: any) => {
                      this.requesting = false;
                      this.errorMessage = error.message;
                      this.snackBar.open(error.message, null, {
                        duration: 5000,
                      });
                    });
                }
              })
              .catch((error: any) => {
                this.requesting = false;
                this.errorMessage = error.message;
                this.snackBar.open(error.message, null, { duration: 5000 });
              });
          })
          .catch((error) => {
            this.snackBar.open(error.message, null, {
              duration: 5000,
            });
          });
      })
      .catch((error: any) => {
        this.requesting = false;
        this.errorMessage = error.message;
        this.snackBar.open(error.message, null, { duration: 5000 });
      });
  }

  // checks if two given password are equal
  checkPasswords(group: FormGroup) {
    const password = group.get('password').value;
    const confirmPassword = group.get('passwordConfirmation').value;
    return password === confirmPassword ? null : { noEqual: true };
  }

  async getUserIP(){
    this.userAgent = navigator.userAgent;

   this.http.get('https://api.ipify.org/?format=json').subscribe(response => {
     this.userIP = response["ip"];
   })
 }
  
}

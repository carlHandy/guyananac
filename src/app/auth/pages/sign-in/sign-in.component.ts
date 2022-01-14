import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { load } from 'recaptcha-v3';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

// services
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  templateUrl: './sign-in.component.html',
  styles: [
    `
      @media (max-width: 600px) {
        .header-box {
          background-image: url('/assets/images/background_login.jpg');
        }
      }
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 750px;
        }
      }
    `,
  ],
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  requesting: boolean;
  errorMessage: string;
  rememberEmail: boolean;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {
    this.signInForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(256),
        Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.maxLength(256),
      ]),
    });
    this.requesting = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.checkRememberEmail();
    this.loadCaptcha();
  }

  // checks if remember email and value are stored in the localstorage
  checkRememberEmail() {
    const remember = localStorage.getItem('rememberEmail');
    if (remember && remember === 'true') {
      const email = localStorage.getItem('rememberEmailValue');
      if (email) {
        this.signInForm.get('email').patchValue(email);
        this.rememberEmail = true;
      } else {
        this.rememberEmail = false;
        localStorage.setItem('rememberEmail', 'false');
      }
    }
  }

  // sign in with email and passwod with firebase library
  signInEmailPassword() {
    this.errorMessage = '';
    this.requesting = true;

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    let { email, password } = this.signInForm.value;

    email = (email as string).toLowerCase();

    this.authService
      .signInEmailPassword(email, password)
      .then((res) => {
        if (
          res.user.providerData[0].providerId === 'password' &&
          !res.user.emailVerified
        ) {
          this.snackBar.open(
            'Please check your inbox, verification email has been sent.',
            null,
            { duration: 10000 }
          );
        }
        if (this.rememberEmail) {
          localStorage.setItem('rememberEmail', 'true');
          localStorage.setItem('rememberEmailValue', email);
        } else {
          localStorage.removeItem('rememberEmail');
          localStorage.removeItem('rememberEmailValue');
        }
        this.router.navigateByUrl('/auctions');
      })
      .catch((error) => {
        this.requesting = false;
        this.errorMessage = error.message;
        if (error.code === 'auth/wrong-password') {
          this.snackBar.open(
            'The password is invalid or the user is not registered.',
            null,
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(error.message, null, { duration: 5000 });
        }
      })
      .finally(() => {
        this.requesting = false;
      });
  }

  async loadCaptcha() {
    const recaptcha = await load(environment.recaptcha.siteKey, {
      useEnterprise: true
    });

    const token = await recaptcha.execute('login');


    this.http.post(`https://recaptchaenterprise.googleapis.com/v1beta1/projects/maxsold-seller-portal/assessments?key=AIzaSyAwWEWCBqBWNvy796Za9VUIsJfrGRYOAAo`, {
      "event": {
        "token": token,
        "siteKey": environment.recaptcha.siteKey,
        "expectedAction": "login"
      }
    }).subscribe(response => {
      const score = response["score"];
      const data = response;

      if (score == 0.9) {
        this.http.post('https://hooks.slack.com/services/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' , 
        {
          data
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        ).subscribe(response => {
          console.log('slack message sent', response);
        })
      }
    }) 

  }
}

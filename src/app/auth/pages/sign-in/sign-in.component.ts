import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
// import { load } from 'recaptcha-v3';
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
  captcha:boolean;
  showPassword = false;
  userIP: number;
  userAgent: string;

  public addTokenLog(message: string, token: string | null) {
    this.http.post(`https://recaptchaenterprise.googleapis.com/v1beta1/projects/maxsold-seller-portal/assessments?key=AIzaSyAwWEWCBqBWNvy796Za9VUIsJfrGRYOAAo`, {
      "event": {
        "token": token,
        "siteKey": environment.recaptcha.challengeKey,
        "expectedAction": "login",
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
      captcha: new FormControl('', [
        Validators.required,
      ])
    });
    this.requesting = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.getUserIP();
    this.checkRememberEmail();
    // this.loadCaptchaV3();
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

    let { email, password, captcha } = this.signInForm.value;

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



  // async loadCaptchaV3() {
  //   const recaptcha = await load(environment.recaptcha.challengeKey, {
  //     useEnterprise: true
  //   });

  //   const token = await recaptcha.execute('login');
  //   const userAgent = navigator.userAgent;


  //   this.http.post(`https://recaptchaenterprise.googleapis.com/v1beta1/projects/maxsold-seller-portal/assessments?key=AIzaSyAwWEWCBqBWNvy796Za9VUIsJfrGRYOAAo`, {
  //     "event": {
  //       "token": token,
  //       "siteKey": environment.recaptcha.challengeKey,
  //       "expectedAction": "login",
  //       "userIpAddress": this.userIP,
  //       "userAgent": userAgent
  //     }
  //   }).subscribe(response => {
  //     const score = response["score"];
  //     const payload = 
  //       {
  //         "Bad Actor IP Address": response["event"].userIpAddress,
  //         "Bad Actor Agent": response["event"].userAgent,
  //         "Expected Action": response["event"].expectedAction,
  //         "Score": response["score"],
  //         "Block Reason": response["tokenProperties"].invalidReason,
  //         "Action": response["tokenProperties"].action,
  //         "Time": response["tokenProperties"].createTime,
  //       };

  //     if (score <= 0.2) {
  //       this.http.post('https://fathomless-temple-12853.herokuapp.com/t94juqt9' , payload, {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded'
  //         }
  //       }
  //       ).subscribe(response => {
  //         console.log('slack message sent', response);
  //       })
  //     }
  //   }) 

  // }

  async getUserIP(){
     this.userAgent = navigator.userAgent;

    this.http.get('https://api.ipify.org/?format=json').subscribe(response => {
      this.userIP = response["ip"];
    })
  }
}

import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
// services
import { AuthService } from '../../../shared/services/auth.service';
import { AthleteService } from '../../../shared/services/athlete.service';
import firebase from 'firebase/app';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-auth-providers',
  templateUrl: './auth-providers.component.html',
  styleUrls: ['./auth-providers.component.scss'],
})
export class AuthProvidersComponent {
  requesting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private athleteService: AthleteService,
  ) {}

  // uses firebase library to sing in the user with popup
  singInGoogle() {
    this.requesting = true;
    this.authService
      .signInGoogle()
      .then((res) => {
        this.handleSubmitReference(res.user);
      })
      .catch((error) => {
        this.snackBar.open(error.message, null, { duration: 5000 });
      })
      .finally(() => {
        this.requesting = false;
      });
  }

  // handles firebase response after user have been authenticated
  handleSubmitReference(user: firebase.User) {
    // user created for auth firebase
    this.athleteService
      .getAthleteByEmail(user.email)
      .then((data) => {
        if (data.docs.length === 1) {
          // document found
          const altheleId = data.docs[0].id;
          Promise.all([
            this.athleteService.createUserReference(altheleId, user.uid),
          ])
            .then(() => {
              // references made successfully
              this.router.navigateByUrl('/dashboard');
            })
            .catch(this.handleError);
        } else {
          // no athlete document found for this email
          let athleteID = String(CryptoJS.SHA256('a' + user.email));
          this.athleteService
            .createUserReference(athleteID, user.uid)
            .then(() => {
              // references made successfuly
              this.router.navigateByUrl('/profile');
            })
            .catch(this.handleError);
        }
      })
      .catch(this.handleError);
  }

  // error handling for auth requests
  handleError(error: any) {
    this.requesting = false;
    this.snackBar.open(error.message, null, { duration: 5000 });
  }

  // sing in with facebook, doe to firebase failure with facebook login
  // facebook sign up is handle with redirect
  singInFacebook() {
    this.requesting = true;
    this.authService
      .signInFacebook()
      .then((res) => {
        this.handleSubmitReference(res.user);
      })
      .catch((error) => {
        this.snackBar.open(error.message, null, { duration: 5000 });
      })
      .finally(() => {
        this.requesting = false;
      });
  }
}

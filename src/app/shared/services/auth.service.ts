import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// firebase
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

// rxjs
import { combineLatest, Observable, of } from 'rxjs';

// firebase
import { AngularFirestore } from '@angular/fire/firestore';

// rxjs
import { map, switchMap, tap, filter } from 'rxjs/operators';

// models
import { Athlete } from '../models/athlete.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUser: firebase.User;
  user$: Observable<firebase.User>;
  baseAthlete: Athlete;
  athlete$: Observable<Athlete>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    // observable user updated with firebase auth module
    this.user$ = this.auth.authState.pipe(
      map((user) => {
        if (user) {
          // saving local obj for direct read
          this.baseUser = user;

          if (!environment.production) {
            console.log(user);
            console.log(user.providerId);
            user.getIdToken().then((t) => console.log(t));
          }

          return user;
        } else {
          return null;
        }
      })
    );

    // handles facebook redirect
    this.auth
      .getRedirectResult()
      .then((result) => {
        if (result.credential) {
          this.router.navigateByUrl('/profile');
        }
      })
      .catch((error) => {});

    // observable of athlete if user is present
    this.athlete$ = this.auth.authState.pipe(
      switchMap((user) => {
        if (user) {
          // user found
          this.baseUser = user;
          // attempt to build the athlete
          return this.generateAthlete(user);
        } else {
          // not user
          return of(null);
        }
      })
    );
  }

  // logs the user out of the app and redirects
  logout(): void {
    this.auth.signOut().then(() => {
      this.router.navigateByUrl('/auth/sign-in');
    });
  }

  // logs out the user without redirect
  logoutNoRedirect() {
    this.auth.signOut().then(() => {});
  }

  // sends email verification for a given user
  sendVerificationEmail() {
    return this.baseUser.sendEmailVerification();
  }

  // firebase sign up with pop up
  signInGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.signInWithProvider(provider);
  }

  // firebase facebook sing up with redirect
  signInFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.signInWithProvider(provider);
  }

  // firebase sign in with provider
  signInWithProvider(provider: firebase.auth.GoogleAuthProvider) {
    return this.auth.signInWithPopup(provider);
  }

  // firebase sign in with provider and redirect
  signInWithProviderRedirect(provider: firebase.auth.GoogleAuthProvider) {
    return this.auth.signInWithRedirect(provider);
  }

  signInWithRedirect(provider: firebase.auth.GoogleAuthProvider) {
    return this.auth.signInWithRedirect(provider);
  }

  // user getter
  get user(): Observable<firebase.User | null> {
    return this.user$;
  }

  // athlete getter
  get athlete(): Observable<Athlete | null> {
    return this.athlete$;
  }

  // tries to generate athlete with a given user uid
  // the user uid is used to link the logged user with his athlete obj
  generateAthlete(firebaseUser: firebase.User): Observable<Athlete | null> {
    // check if there is a reference with this user uid
    return this.checkUserReference(firebaseUser.uid).pipe(
      switchMap((ref) => {
        if (!ref) {
          // get athlete with its own id
          return this.getAthlete(firebaseUser.uid);
        }
        // if athlete existed before sign u[]
        return this.getAthlete(ref.athleteId);
      }),
      tap((athlete) => {
        // updating local obj
        this.baseAthlete = athlete;
      })
    );
  }

  // checks if exists a reference with the giver user uid
  checkUserReference(uid: string): Observable<{ athleteId: string } | null> {
    return this.firestore
      .collection('users')
      .doc<{ athleteId: string }>(uid)
      .valueChanges()
      .pipe((doc) => (doc ? doc : null));
  }

  // get athlete by id
  getAthlete(athleteId: string): Observable<Athlete> {
    return this.firestore
      .collection('athletes')
      .doc<Athlete>(athleteId)
      .valueChanges()
      .pipe(
        map((athlete) => (athlete ? athlete : null)),
        tap((athlete) => {
          if (athlete) {
            if (!environment.production) {
              console.log(athlete.athleteId);
            }
          }
        })
      );
  }

  // checks auth method for a given email
  checkAuthMethod(email: string) {
    return this.auth.fetchSignInMethodsForEmail(email);
  }
}

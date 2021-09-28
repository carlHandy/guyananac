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
import { Seller } from '../models/seller.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUser: firebase.User;
  user$: Observable<firebase.User>;
  baseSeller: Seller;
  seller$: Observable<Seller>;

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
          this.router.navigateByUrl('/auctions');
        }
      })
      .catch((error) => {});

    // observable of seller if user is present
    this.seller$ = this.auth.authState.pipe(
      switchMap((user) => {
        if (user) {
          // user found
          this.baseUser = user;
          // attempt to build the seller
          return this.generateSeller(user);
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

  // firebase sign in with email/password
  signInEmailPassword(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  // firebase sign up with email/password
  registerEmailPassword(email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password);
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

  // sends password reset email
  changeUserPassword(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  // updates logged user email
  changeUserEmail(email: string) {
    return this.baseUser.updateEmail(email);
  }

  // user getter
  get user(): Observable<firebase.User | null> {
    return this.user$;
  }

  // seller getter
  get seller(): Observable<Seller | null> {
    return this.seller$;
  }

  // tries to generate seller with a given user uid
  // the user uid is used to link the logged user with his seller obj
  generateSeller(firebaseUser: firebase.User): Observable<Seller | null> {
    // check if there is a reference with this user uid
    return this.checkUserReference(firebaseUser.uid).pipe(
      switchMap((ref) => {
        if (!ref) {
          // get seller with its own id
          return this.getSeller(firebaseUser.uid);
        }
        // if seller existed before sign u[]
        return this.getSeller(ref.sellerId);
      }),
      tap((seller) => {
        // updating local obj
        this.baseSeller = seller;
      })
    );
  }

  // checks if exists a reference with the giver user uid
  checkUserReference(uid: string): Observable<{ sellerId: string } | null> {
    return this.firestore
      .collection('users')
      .doc<{ sellerId: string }>(uid)
      .valueChanges()
      .pipe((doc) => (doc ? doc : null));
  }

  // get seller by id
  getSeller(sellerId: string): Observable<Seller> {
    return this.firestore
      .collection('sellers')
      .doc<Seller>(sellerId)
      .valueChanges()
      .pipe(
        map((seller) => (seller ? seller : null)),
        tap((seller) => {
          if (seller) {
            if (!environment.production) {
              console.log(seller.sellerId);
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

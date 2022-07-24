import { Injectable } from '@angular/core';

// firebase
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// utils

// Models
import { ProfileImage } from 'src/app/core/modules/profile/models/view-models/profile-image.view-model';
import { Address } from '../models/address.model';
import { Athlete } from '../models/athlete.model';

// services
import { AuthService } from './auth.service';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';

@Injectable({
  providedIn: 'root',
})
export class AthleteService {
  private collectionName = 'athletes';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // creates a new athlete
  createAthlete(athlete: Athlete): Promise<void> {
    return this.firestore
      .collection(this.collectionName)
      .doc(athlete.athleteId)
      .set({
        ...athlete,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // returns the url of the athlete image
  getImageURI(): Observable<ProfileImage> {
    return this.authService.athlete.pipe(
      map((athlete: Athlete) => {
        if (!athlete || !athlete.profilePicture) {
          return {
            profilePicture: '',
          };
        }
        return {
            profilePicture: athlete.profilePicture,
        };
      })
    );
  }

  // updates athlete image url
  updateImageURI(url: string) {
    const athlete = this.authService.baseAthlete;
    return this.firestore
      .collection(this.collectionName)
      .doc(athlete.athleteId)
      .update({
        profilePicture: url,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // update athlete information
  updatePersonalInfo(
    firstName: string,
    lastName: string,
    phone: string,
    address: Address
  ) {
    const baseAthlete = this.authService.baseAthlete;
    return this.firestore
      .collection(this.collectionName)
      .doc(baseAthlete.athleteId)
      .update({
        firstName,
        lastName,
        phone,
        mailingAddress: address,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // returns seller query by email
  getAthleteByEmail(
    email: string
  ): Promise<firebase.firestore.QuerySnapshot<Athlete>> {
    return this.firestore
      .collection<Athlete>('athletes')
      .ref.where('email', '==', email)
      .get();
  }

  // generates a new reference to link firebase auth to seller information
  createUserReference(athleteId: string, uid: string) {
    return this.firestore.collection('athletes').doc(uid).set({
        athleteId,
      modifiedDate: getCurrentTimeFixed(),
    });
  }

  // return seller by id
  getAthleteById(athleteId: string): Observable<Athlete> {
    return this.firestore
      .collection<Athlete>('sellers')
      .doc(athleteId)
      .valueChanges();
  }

  // get seller snapshot by id
  getAthleteByIdPromise(athleteId: string): Promise<Athlete> {
    return this.firestore
      .collection<Athlete>('athletes')
      .doc(athleteId)
      .valueChanges()
      .toPromise();
  }

  // get seller snapshot data by id
  getAthleteByIdDoc(athleteId: string) {
    return this.firestore
      .collection<Athlete>('athletes')
      .doc(athleteId)
      .get()
      .toPromise();
  }

}

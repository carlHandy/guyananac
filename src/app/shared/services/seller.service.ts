import { Injectable } from '@angular/core';

// firebase
import { AngularFirestore } from '@angular/fire/firestore';
import { ContactMethodEnum } from '@shared/enums/contact-method.enum';
import firebase from 'firebase/app';

// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// utils
import { getAuthMethod } from 'src/app/auth/utils/helpers';

// Models
import { ProfileChangeEmailViewModel } from 'src/app/core/modules/profile/models/view-models/profile-change-email.view-model';
import { ProfileImage } from 'src/app/core/modules/profile/models/view-models/profile-image.view-model';
import { Address } from '../models/address.model';
import { Seller } from '../models/seller.model';

// services
import { AuthService } from './auth.service';
import { Invitation } from '../models/invitation.model';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';
import { AuthenticationTypeEnum } from '../enums/authentication-type.enum';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private collectionName = 'sellers';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // creates a new seller
  createSeller(seller: Seller): Promise<void> {
    return this.firestore
      .collection(this.collectionName)
      .doc(seller.sellerId)
      .set({
        ...seller,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // updates a seller authentication type
  updateSellerAuthType(type: AuthenticationTypeEnum, sellerId: string) {
    return this.firestore.collection(this.collectionName).doc(sellerId).update({
      authenticationType: type,
      modifiedDate: getCurrentTimeFixed(),
    });
  }

  // returns the url of the seller image
  getImageURI(): Observable<ProfileImage> {
    return this.authService.seller.pipe(
      map((seller: Seller) => {
        if (!seller || !seller.profilePhotoURI) {
          return {
            profilePhotoURI: '',
          };
        }
        return {
          profilePhotoURI: seller.profilePhotoURI,
        };
      })
    );
  }

  // updates seller image url
  updateImageURI(url: string) {
    const seller = this.authService.baseSeller;
    return this.firestore
      .collection(this.collectionName)
      .doc(seller.sellerId)
      .update({
        profilePhotoURI: url,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // returns needed information for changing email
  getEmailSettings(): Observable<ProfileChangeEmailViewModel> {
    return this.authService.user.pipe(
      map((user) => {
        if (!user) {
          return null;
        }
        let type = getAuthMethod(user.providerData[0].providerId);
        const vm: ProfileChangeEmailViewModel = {
          email: user.email,
          type,
          guid: user.uid,
        };

        return vm;
      })
    );
  }

  // update the seller emails on the obj
  updateEmail(email: string): Promise<void> {
    const baseSeller = this.authService.baseSeller;
    return this.firestore
      .collection(this.collectionName)
      .doc(baseSeller.sellerId)
      .update({
        email,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // update seller information
  updatePersonalInfo(
    firstName: string,
    lastName: string,
    phone: string,
    preferredContactMethod: ContactMethodEnum,
    timezone: number,
    address: Address
  ) {
    const basSeller = this.authService.baseSeller;
    return this.firestore
      .collection(this.collectionName)
      .doc(basSeller.sellerId)
      .update({
        firstName,
        lastName,
        phone,
        preferredContactMethod,
        timezone,
        mailingAddress: address,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // add teamId to seller
  addSellerTeam(sellerId: string, teamId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(sellerId)
      .update({
        teamIds: firebase.firestore.FieldValue.arrayUnion(teamId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // remove teamId of seller
  removeSellerTeam(sellerId: string, teamId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(sellerId)
      .update({
        teamIds: firebase.firestore.FieldValue.arrayRemove(teamId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // returns seller query by email
  getSellerByEmail(
    email: string
  ): Promise<firebase.firestore.QuerySnapshot<Seller>> {
    return this.firestore
      .collection<Seller>('sellers')
      .ref.where('email', '==', email)
      .get();
  }

  // generates a new reference to link firebase auth to seller information
  createUserReference(sellerId: string, uid: string) {
    return this.firestore.collection('users').doc(uid).set({
      sellerId,
      modifiedDate: getCurrentTimeFixed(),
    });
  }

  // return seller by id
  getSellerById(sellerId: string): Observable<Seller> {
    return this.firestore
      .collection<Seller>('sellers')
      .doc(sellerId)
      .valueChanges();
  }

  // get seller snapshot by id
  getSellerByIdPromise(sellerId: string): Promise<Seller> {
    return this.firestore
      .collection<Seller>('sellers')
      .doc(sellerId)
      .valueChanges()
      .toPromise();
  }

  // get seller snapshot data by id
  getSellerByIdDoc(sellerId: string) {
    return this.firestore
      .collection<Seller>('sellers')
      .doc(sellerId)
      .get()
      .toPromise();
  }

  // update user references by id and type
  updateSellerPreferencesById(sellerId: string, value: boolean, type: string) {
    const updates = {
      modifiedDate: getCurrentTimeFixed(),
    };
    updates[`notificationPref.${type}`] = value;

    return this.firestore
      .collection(this.collectionName)
      .doc(sellerId)
      .update(updates);
  }

  // update seller preferences
  updateSellerPreferences(value: boolean, type: string) {
    const seller = this.authService.baseSeller;
    return this.updateSellerPreferencesById(seller.sellerId, value, type);
  }

  // adds auctions ids to seller auctionList
  addAuctionsToSeller(auctionIds: string[], sellerId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(sellerId)
      .update({
        auctionList: firebase.firestore.FieldValue.arrayUnion(...auctionIds),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // remove auctions ids from seller auction list
  removeAuctionsFromSeller(auctionIds: string[], sellerId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(sellerId)
      .update({
        auctionList: firebase.firestore.FieldValue.arrayRemove(...auctionIds),
        modifiedDate: getCurrentTimeFixed(),
      });
  }
}

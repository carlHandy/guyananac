import { Injectable } from '@angular/core';

// services
import firebase from 'firebase/app';

// rxjs
import { Auction } from '@shared/models/auction.interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuctionInvoice } from '../models/auction-invoice.model';
import { InvoiceItem } from '../models/invoice-item';
import { AuctionPhaseEnum } from '@shared/enums/auction-phase.enum';
import { TeamMemberRoleEnum } from '@shared/enums/team-member-role.enum';
import { SellerService } from './seller.service';
import { TeamsService } from './teams.service';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';

@Injectable({
  providedIn: 'root',
})
export class AuctionsService {
  private auctionsCollectionName = 'auctions';

  constructor(
    private firestore: AngularFirestore,
    private sellerService: SellerService,
    private teamsService: TeamsService
  ) {}

  // get auctions owned by seler Id
  getAuctionsBySellerId(sellerId: string): Observable<Auction[]> {
    return this.firestore
      .collection<Auction>(this.auctionsCollectionName, (ref) =>
        ref.where('auctionOwnerSeller', '==', sellerId)
      )
      .valueChanges();
  }

  // get all auctions that a team owns
  getAuctionsByTeamId(teamId: string): Observable<Auction[]> {
    return this.firestore
      .collection<Auction>(this.auctionsCollectionName, (ref) =>
        ref.where('auctionOwnerTeam', '==', teamId)
      )
      .valueChanges();
  }

  // get all firebase references to auctions that a team owns
  getAuctionsByTeamId2(teamId: string) {
    return this.firestore
      .collection<Auction>(this.auctionsCollectionName, (ref) =>
        ref.where('auctionOwnerTeam', '==', teamId)
      )
      .get();
  }

  // get an auction by its id
  getAuctionById(auctionId: string): Observable<Auction> {
    return this.firestore
      .collection<Auction>(this.auctionsCollectionName)
      .doc(auctionId)
      .valueChanges();
  }

  // removes a observer team references for a given auction
  removeAuctionTeamObserver(auctionId: string, teamId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionObserversTeam: firebase.firestore.FieldValue.arrayRemove(teamId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // removes a seller reference of the auction observer list
  removeAuctionSellerObserver(auctionId: string, sellerId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionObserversSeller:
          firebase.firestore.FieldValue.arrayRemove(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // get invocie information for a given auction id
  getAuctionInvoice(auctionId: string): Observable<AuctionInvoice> {
    return this.firestore
      .collection('auctions')
      .doc(auctionId)
      .collection<AuctionInvoice>('invoices')
      .doc(auctionId)
      .valueChanges();
  }

  // updates the picked up state of a given lot
  updateLotPickedUp(
    lotId: string,
    invoiceId: string,
    auctionId: string,
    lot: InvoiceItem,
    value: boolean
  ) {
    let lotUpdate = {};
    // updating nested map
    lotUpdate[`invoices.${invoiceId}.items.${lotId}`] = {
      ...lot,
      pickedUp: value,
      // fixes date length
      modifiedDate: getCurrentTimeFixed(),
    };
    return this.firestore
      .collection('auctions')
      .doc(auctionId)
      .collection<AuctionInvoice>('invoices')
      .doc(auctionId)
      .update(lotUpdate);
  }

  // get phase number for a given phase string
  getPhaseNumber(phase: string) {
    let current: AuctionPhaseEnum;
    if (phase == 'auctionCancelled') {
      current = AuctionPhaseEnum.auctionCancelled;
    } else if (phase == 'futureAuction') {
      current = AuctionPhaseEnum.futureAuction;
    } else if (phase == 'upcomingAuction') {
      current = AuctionPhaseEnum.upcomingAuction;
    } else if (phase == 'liveAuction') {
      current = AuctionPhaseEnum.liveAuction;
    } else if (phase == 'auctionClosed') {
      current = AuctionPhaseEnum.auctionClosed;
    } else if (phase == 'pickupComplete') {
      current = AuctionPhaseEnum.pickupComplete;
    } else if (phase == 'auctionComplete') {
      current = AuctionPhaseEnum.auctionComplete;
    } else if (phase == 'pastAuction') {
      current = AuctionPhaseEnum.pastAuction;
    } else {
      current = AuctionPhaseEnum.futureAuction;
    }
    return current;
  }

  // removes seller from team auction list
  async removeSellerFromTeamAuctionList(
    teamId: string,
    sellerId: string,
    role: TeamMemberRoleEnum
  ) {
    // getting obj snapshot
    const snapshot = await this.getAuctionsByTeamId2(teamId).toPromise();
    if (snapshot.docs.length <= 0) {
      return;
    }
    // getting auctions
    const auctions = snapshot.docs.map((doc) => doc.data());
    // remove seller from auction
    auctions.forEach(async (auction) => {
      await this.removeSellerFromAuctionPermissions(
        auction.auctionId,
        sellerId,
        role
      );
    });
    // remove auction from seller
    const auctionsIds = auctions.map((a) => a.auctionId);
    await this.sellerService.removeAuctionsFromSeller(auctionsIds, sellerId);
    return;
  }

  // removes the seller from auction permission list by role
  removeSellerFromAuctionPermissions(
    auctionId: string,
    sellerId: string,
    role: TeamMemberRoleEnum
  ) {
    switch (role) {
      case TeamMemberRoleEnum.Admin:
        return this.removeSellerFromReadWriteList(auctionId, sellerId);
      case TeamMemberRoleEnum.Viewer:
        return this.removeSellerFromReadOnlyList(auctionId, sellerId);
    }
  }

  // adds a seller to the read only list of the auction permission
  addSellersToReadOnlyList(auctionId: string, sellerIds: string[]) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadOnly: firebase.firestore.FieldValue.arrayUnion(
          ...sellerIds
        ),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // adds a seller to the read and write list of the auction permission
  addSellersToReadWriteList(auctionId: string, sellerIds: string[]) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadWrite: firebase.firestore.FieldValue.arrayUnion(
          ...sellerIds
        ),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // removes a seller to the read only list of the auction permission
  removeSellerFromReadOnlyList(auctionId: string, sellerId: string) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadOnly:
          firebase.firestore.FieldValue.arrayRemove(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // removes a seller to the read and write list of the auction permission
  removeSellerFromReadWriteList(auctionId: string, sellerId: string) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadWrite:
          firebase.firestore.FieldValue.arrayRemove(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // removes a group of seller for the read only permission list of a given
  // auction
  removeSellersFromReadOnlyList(auctionId: string, sellerIds: string[]) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadOnly: firebase.firestore.FieldValue.arrayRemove(
          ...sellerIds
        ),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // removes a group of seller for the read and write permission list of a given
  // auction
  removeSellersFromReadWriteList(auctionId: string, sellerIds: string[]) {
    this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        sellerPermissionsReadWrite: firebase.firestore.FieldValue.arrayRemove(
          ...sellerIds
        ),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // adds all members to a given auction with the corresponding permissions
  async addTeamMembersToAuction(auctionId: string, teamId: string) {
    // getting snapshot
    const snapshot = await this.teamsService.getTeam2(teamId);

    if (!snapshot.exists) {
      throw new Error('No team');
    }

    const team = snapshot.data();

    const admins = team.teamAdmins ?? [];

    const viewers = team.teamViewers ?? [];

    // adding sellers by role to permission list
    await this.addSellersToReadOnlyList(auctionId, viewers);
    await this.addSellersToReadWriteList(auctionId, admins);

    const members = [...admins, ...viewers];

    // for each member add auction
    members.forEach((m) => {
      this.sellerService.addAuctionsToSeller([auctionId], m);
    });

    return;
  }

  // remove all members of a team from an auction
  async removeTeamMembersFromAuction(
    auctionId: string,
    viewers: string[],
    admins: string[]
  ) {
    const members = [...admins, ...viewers];

    // remove auction for each seller
    members.forEach((m) => {
      this.sellerService.removeAuctionsFromSeller([auctionId], m);
    });

    // remove member from auctions by role
    await this.removeSellersFromReadOnlyList(auctionId, viewers);
    await this.removeSellersFromReadWriteList(auctionId, admins);

    return;
  }

  // changes the auction alias name
  changeAuctionName(auctionId: string, name: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionAlias: name,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // sets a given seller as owner of a given auction
  setSellerOwner(auctionId: string, sellerId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionOwnerSeller: sellerId,
        auctionOwnerTeam: null,
        sellerPermissionsReadWrite:
          firebase.firestore.FieldValue.arrayUnion(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // sets a team as owner of a given auction
  setTeamOwner(auctionId: string, teamId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionOwnerSeller: null,
        auctionOwnerTeam: teamId,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // deletes ownership of a team for a given auction
  removeOwnerTeam(auctionId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionOwnerTeam: null,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // remove owner seller from a given auction
  removeOwnerSeller(auctionId: string) {
    return this.firestore
      .collection(this.auctionsCollectionName)
      .doc(auctionId)
      .update({
        auctionOwnerSeller: null,
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // downloads a document by its url
  downloadDocumet(downloadUrL: string, title: string) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = title;
      a.dispatchEvent(new MouseEvent('click'));
    };
    xhr.open('GET', downloadUrL);
    xhr.send();
  }
}

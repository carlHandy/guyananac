import { Injectable } from '@angular/core';
import { AuctionSellerInvitation } from '../models/auction-seller-invitation';
import { AngularFirestore } from '@angular/fire/firestore';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { filter, switchMap } from 'rxjs/operators';
import { AuctionTeamInvitation } from '@shared/models/auctionTeamInvitation';
import { of } from 'rxjs';
import { SellerService } from './seller.service';
import { TeamsService } from './teams.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuctionObserversService {
  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private sellerService: SellerService,
    private teamsService: TeamsService,
    private http: HttpClient
  ) {}

  // get all invitations for being observer of an auction
  // that were sent the logged user
  getAuctionSellerInvitations() {
    const sellerEmail = this.authService.baseUser.email;
    return this.firestore
      .collection<AuctionSellerInvitation>('auctionSellerInvitations', (ref) =>
        ref.where('sellerEmail', '==', sellerEmail)
      )
      .valueChanges({ idField: 'invitationId' });
  }

  // adds a new invitation for observer of an auction
  addAuctionSellerInvitation(inv: AuctionSellerInvitation) {
    return this.firestore
      .collection('auctionSellerInvitations')
      .add({ ...inv, date: getCurrentTimeFixed() });
  }

  // sends the corresponding email to a seller how was invited to an auction
  sendAuctionSellerInvitationEmail(sellerEmail: string, auctionName: string) {
    const invitationEmailUrl = environment.invitationEmailUrl;
    return this.firestore.collection('mail').add({
      to: sellerEmail,
      message: {
        subject: 'Auction invitation',
        html: `
        <p>Hello,</p>
        <p>You have been invited to be an observer of ${auctionName}.</p>
        <p>Follow this link to enter the application.</p>
        <p><a href='${invitationEmailUrl}'>${invitationEmailUrl}</a></p>
        <p>Thanks,</p>
        <p>Your MaxSold Seller Portal team</p>`,
      },
    });
  }

  // deletes invitation upon rejection
  rejectAuctionSellerInvitation(invitationId: string) {
    return this.firestore
      .collection('auctionSellerInvitations')
      .doc(invitationId)
      .delete();
  }

  // handles and adds the new seller to an auction
  async acceptAuctionSellerInvitation(
    sellerId: string,
    auctionId: string,
    invitationId: string
  ) {
    const token = await this.authService.baseUser.getIdToken();
    // requestion cloud function wuth authorization header
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}acceptSellerObserverInvitation`,
      {
        sellerId,
        auctionId,
        invitationId,
      },
      {
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // get invitations for all logged user teams for being observers for an auctions
  getAuctionTeamInvitations() {
    const sellerId = this.authService.baseSeller.sellerId;
    return this.authService.seller$.pipe(
      filter((seller) => seller != null),
      switchMap((seller) => {
        const teamIds = seller.teamIds ?? [];

        if (teamIds.length > 0) {
          // get teams of users and map id if admin
          return this.teamsService.getTeamsByIds(teamIds).pipe(
            switchMap((teams) => {
              const ids = teams
                .filter((team) => {
                  return team.teamAdmins.includes(sellerId);
                })
                .map((team) => team.teamId);

              // seller is at least admin at one team
              if (ids.length > 0) {
                return this.firestore
                  .collection<AuctionTeamInvitation>(
                    'auctionTeamInvitations',
                    (ref) => ref.where('teamId', 'in', ids)
                  )
                  .valueChanges({ idField: 'invitationId' });
              }

              return of([]);
            })
          );
        } else {
          return of([]);
        }
      })
    );
  }

  // adds a new team invitation to an auction observers list
  addAuctionTeamInvitation(inv: AuctionTeamInvitation) {
    return this.firestore
      .collection('auctionTeamInvitations')
      .add({ ...inv, date: getCurrentTimeFixed() });
  }

  // sends the required emails to all admins on a team that was invited to an
  // auction
  async sendAuctionTeamInvitationEmails(
    auctionName: string,
    teamName: string,
    sellerIds: string[]
  ) {
    sellerIds.forEach(async (id) => {
      const snap = await this.sellerService.getSellerByIdDoc(id);
      if (snap.exists) {
        const seller = snap.data();
        await this.sendAuctionTeamInvitationEmail(
          seller.email,
          auctionName,
          teamName
        );
      }
    });
  }

  // sends individual team invite to a admin of a team that was invited
  sendAuctionTeamInvitationEmail(
    sellerEmail: string,
    auctionName: string,
    teamName: string
  ) {
    const invitationEmailUrl = environment.invitationEmailUrl;
    return this.firestore.collection('mail').add({
      to: sellerEmail,
      message: {
        subject: 'Auction invitation',
        html: `
        <p>Hello,</p>
        <p>Your team ${teamName} has been invited to be an observer of ${auctionName}.</p>
        <p>Follow this link to enter the application.</p>
        <p><a href='${invitationEmailUrl}'>${invitationEmailUrl}</a></p>
        <p>Thanks,</p>
        <p>Your MaxSold Seller Portal team</p>`,
      },
    });
  }

  // deleted team invitation of an auction
  rejectAuctionTeamInvitation(invitationId: string) {
    return this.firestore
      .collection('auctionTeamInvitations')
      .doc(invitationId)
      .delete();
  }

  // handles and adds teams to a auction observer list and all required permissiosn
  async acceptAuctionTeamInvitation(
    teamId: string,
    auctionId: string,
    invitationId: string
  ) {
    const token = await this.authService.baseUser.getIdToken();
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}acceptTeamObserverInvitation`,
      {
        teamId,
        auctionId,
        invitationId,
      },
      {
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

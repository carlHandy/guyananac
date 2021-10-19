import { Injectable } from '@angular/core';

// models
import { Invitation } from '../models/invitation.model';

// services
import { AuthService } from './auth.service';

// firebase
import { AngularFirestore } from '@angular/fire/firestore';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';
import { HttpClient } from '@angular/common/http';
import { TeamMemberRoleEnum } from '../enums/team-member-role.enum';
import { AuctionTeamInvitation } from '../models/auctionTeamInvitation';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InvitationsService {
  private collectionName = 'invitations';
  private teamInvitatioCollection = 'auctionTeamInvitations';
  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {}

  // gets invitations filtered by email and team id, those invitations are
  // used to check if a invitation was already sent for a seller for a given team
  getInvitationByEmailAndTeamId(email: string, teamId: string) {
    return this.firestore
      .collection<Invitation>('invitations', (ref) =>
        ref.where('sellerEmail', '==', email).where('team.teamId', '==', teamId)
      )
      .get();
  }

  getInvitationByEmailAndTeamIdVc(email: string, teamId: string) {
    // return this.firestore
    //   .collection<Invitation>('invitations', (ref) =>
    //     ref.where('sellerEmail', '==', email).where('team.teamId', '==', teamId)
    //   ).get()
    let query = this.firestore.collection<Invitation>('invitations').ref.where('sellerEmail', '==', email).where('team.teamId', '==', teamId);
    query.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
  }

  getAllInvitationByTeamId(teamId: string) {
    return this.firestore
      .collection<Invitation>('invitations', (ref) =>
        ref.where('team.teamId', '==', teamId)
      )
      .valueChanges();
  }

  // return all invitations that were sent to a seller to be part of a team
  getInvitations() {
    const sellerEmail = this.authService.baseUser.email;
    return this.firestore
      .collection<Invitation>('invitations', (ref) =>
        ref.where('sellerEmail', '==', sellerEmail)
      )
      .valueChanges({ idField: 'invitationId' });
  }

  // adds an invitation for a seller to be part of a team
  addInvitation(inv: Invitation) {
    return this.firestore
      .collection(this.collectionName)
      .add({ ...inv, date: getCurrentTimeFixed() });
  }

  // deletes a invitation by its id
  removeAuctionTeamInvitation(invitationId: string) {
    return this.firestore
      .collection(this.teamInvitatioCollection)
      .doc(invitationId)
      .delete();
  }

  // get all invitations for a given team, these invitations are used for
  // adding a team as observer for an auction
  getTeamInvitationsById(teamId: string) {
    return this.firestore
      .collection<AuctionTeamInvitation>(this.teamInvitatioCollection, (ref) =>
        ref.where('teamId', '==', teamId)
      )
      .valueChanges({ idField: 'invitationId' });
  }

  // deletes the team invitation for being part of an auction
  deleteTeamInvitation(invitation: Invitation) {
    return this.firestore
      .collection(this.collectionName)
      .doc(invitation.invitationId)
      .delete();
  }

  // sends a invitation email for a team to be part of an auction to a given seller
  sendTeamInvitationEmail(sellerEmail: string, teamName: string) {
    const invitationEmailUrl = environment.invitationEmailUrl;
    return this.firestore.collection('mail').add({
      to: sellerEmail,
      message: {
        subject: 'Team invitation',
        html: `
        <p>Hello,</p>
        <p>You have been invited to ${teamName}.</p>
        <p>Follow this link to enter the application.</p>
        <p><a href='${invitationEmailUrl}'>${invitationEmailUrl}</a></p>
        <p>Thanks,</p>
        <p>Your MaxSold Seller Portal team</p>`,
      },
    });
  }

  // accepts an invitation for a team to be part of an auction
  async acceptTeamInvitation(
    sellerId: string,
    teamId: string,
    role: TeamMemberRoleEnum,
    invitationId: string
  ) {
    const token = await this.authService.baseUser.getIdToken();

    // calls cloud function
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}acceptTeamInvitation`,
      {
        role,
        sellerId,
        teamId,
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

import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import firebase from 'firebase/app';

// models
import { Team } from '@shared/models/team.model';
import { Address } from '../models/address.model';
import { Observable } from 'rxjs';
import { TeamMemberRoleEnum } from '../enums/team-member-role.enum';
import { getCurrentTimeFixed } from '@shared/utils/timeStamp';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private collectionName = 'teams';

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // creates a new team
  createTeam(team: Team): Promise<DocumentReference<Team>> {
    return this.firestore.collection<Team>(this.collectionName).add({
      ...team,
      createdDate: getCurrentTimeFixed(),
      modifiedDate: getCurrentTimeFixed(),
    });
  }

  // deletes a team by id
  deleteTeam(teamId: string) {
    return this.firestore.collection(this.collectionName).doc(teamId).delete();
  }

  // update team Id
  updateTeamIdField(teamId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update({ teamId, modifiedDate: getCurrentTimeFixed() });
  }

  // get a team by id
  getTeam(teamId: string): Observable<Team> {
    return this.firestore
      .collection<Team>(this.collectionName)
      .doc(teamId)
      .valueChanges();
  }

  // get team snapshot by id
  getTeam2(teamId: string) {
    return this.firestore.collection<Team>('teams').doc(teamId).ref.get();
  }

  // get team by team number
  getTeamByNumber(
    teamNumber: number
  ): Promise<firebase.firestore.QuerySnapshot<Team>> {
    return this.firestore
      .collection<Team>('teams')
      .ref.where('teamNumber', '==', teamNumber)
      .get();
  }

  // adds a seller id to the admin list of the team
  addAdminMember(teamId: string, sellerId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update({
        teamAdmins: firebase.firestore.FieldValue.arrayUnion(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // adds a seller id to the viewers list of the team
  addViewerMember(teamId: string, sellerId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update({
        teamViewers: firebase.firestore.FieldValue.arrayUnion(sellerId),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // adss a member by id and role
  addMember(teamId: string, sellerId: string, role: TeamMemberRoleEnum) {
    switch (role) {
      case TeamMemberRoleEnum.Admin:
        return this.addAdminMember(teamId, sellerId);
      case TeamMemberRoleEnum.Viewer:
        return this.addViewerMember(teamId, sellerId);
    }
  }

  // remove a member id from the team
  removeMember(teamId: string, sellerId: string, role: TeamMemberRoleEnum) {
    switch (role) {
      case TeamMemberRoleEnum.Admin:
        return this.firestore
          .collection(this.collectionName)
          .doc(teamId)
          .update({
            teamAdmins: firebase.firestore.FieldValue.arrayRemove(sellerId),
            teamMemberCount: firebase.firestore.FieldValue.increment(-1),
            modifiedDate: getCurrentTimeFixed(),
          });

      case TeamMemberRoleEnum.Viewer:
        return this.firestore
          .collection(this.collectionName)
          .doc(teamId)
          .update({
            teamViewers: firebase.firestore.FieldValue.arrayRemove(sellerId),
            teamMemberCount: firebase.firestore.FieldValue.increment(-1),
            modifiedDate: getCurrentTimeFixed(),
          });
    }
  }

  // updates partner information of a team
  updatePartner(
    teamId: string,
    companyName: string,
    shopPageURL: string,
    companyDesc: string,
    companyURL: string,
    logoURL: string,
    mailingAddress: Address
  ) {
    let teamUpdate = {};
    teamUpdate['partnerProfile'] = {
      companyName,
      shopPageURL,
      companyDesc,
      companyURL,
      logoURL,
      mailingAddress,
    };

    teamUpdate['modifiedDate'] = getCurrentTimeFixed();

    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update(teamUpdate);
  }

  updateTeam(
    teamId: string,
    teamName: string,
  ) {
    let teamUpdate = {};
    teamUpdate = {
      teamName,
    };

    teamUpdate['modifiedDate'] = getCurrentTimeFixed();

    return this.firestore
      .collection('teams')
      .doc(teamId)
      .update(teamUpdate);
  }

  // updates partner image url of a team
  updatePartnerImage(teamId: string, logoURL: string) {
    let teamUpdate = {};
    teamUpdate['partnerProfile.logoURL'] = logoURL;
    teamUpdate['modifiedDate'] = getCurrentTimeFixed();

    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update(teamUpdate);
  }

  // updates index of maxTeamNum to use it for creating a team
  async updateIncrementValue(): Promise<number> {
    const increment = firebase.firestore.FieldValue.increment(1);
    const ref = this.firestore.collection('indexes').doc('index');
    await ref.update({ maxTeamNum: increment });
    const valueRef = await this.firestore
      .collection('indexes')
      .doc<{ maxTeamNum: number }>('index')
      .get()
      .toPromise();
    const data = valueRef.data();
    return data.maxTeamNum;
  }

  // increase member count
  increaseTeamMemberCount(teamId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update({
        teamMemberCount: firebase.firestore.FieldValue.increment(1),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // decrease member count
  descreaseTeamMemberCount(teamId: string) {
    return this.firestore
      .collection(this.collectionName)
      .doc(teamId)
      .update({
        teamMemberCount: firebase.firestore.FieldValue.increment(-1),
        modifiedDate: getCurrentTimeFixed(),
      });
  }

  // checks whenever a team can be deleted
  async canTeamBeDeleted(teamId: string) {
    const token = await this.authService.baseUser.getIdToken();
    // calls cloud function
    return this.http.post<{ result: boolean }>(
      `${environment.cloudFunctionsBaseUrl}canTeamBeDeleted`,
      {
        teamId,
      },
      {
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // get a group of teams by a given id list
  getTeamsByIds(ids: string[]) {
    return this.firestore
      .collection<Team>('teams', (ref) => ref.where('teamId', 'in', ids))
      .valueChanges()
      .pipe(
        map((teams) => {
          return teams.filter((t) => t != undefined);
        })
      );
  }

  // deletes a member from the team, calls the cloud function for doing that
  async deleteTeamMember(
    sellerId: string,
    teamId: string,
    role: TeamMemberRoleEnum
  ) {
    const token = await this.authService.baseUser.getIdToken();

    // calls cloud function
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}deleteTeamMember`,
      {
        role,
        sellerId,
        teamId,
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

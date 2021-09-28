import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuctionOwnerService {
  constructor(private authService: AuthService, private http: HttpClient) {}

  // handles the ownership change to a given seller
  async changeAuctionOwnerSeller(newOwnerId: string, auctionId: string) {
    const token = await this.authService.baseUser.getIdToken();
    // requesting cloud function with authorization token
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}changeOwnerSeller`,
      {
        newOwnerId,
        auctionId,
      },
      {
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // handle the ownership change to a given team
  async changeAuctionOwnerTeam(newOwnerTeamId: string, auctionId: string) {
    const token = await this.authService.baseUser.getIdToken();
    // requestion cloud function with auhorization token
    return this.http.post(
      `${environment.cloudFunctionsBaseUrl}changeOwnerTeam`,
      {
        newOwnerTeamId,
        auctionId,
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService
  ) {}

  // downloads a pdf for the auction by a sorting order and invoice id
  getInfoicePdf(
    invoiceId: string,
    sortOrder: string = '',
    auctionNumber: number
  ) {
    let nameRes = '';

    switch (sortOrder) {
      case 'invoiceId':
        nameRes = 'lots';
        break;
      case 'lastName':
        nameRes = 'name';

        break;
      case 'pickupStarttime':
        nameRes = 'pickup';
        break;

      default:
        break;
    }

    // calling cloud function for generating pdf
    this.authService.baseUser.getIdToken().then((key: string) => {
      const url = `${environment.cloudFunctionsBaseUrl}getPdf?document=${invoiceId}&sortorder=${sortOrder}`;
      var xhr = new XMLHttpRequest();

      // maling xhr request
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var blob = xhr.response;
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `invoice-${auctionNumber}-${nameRes}`;
        a.dispatchEvent(new MouseEvent('click'));
      };
      xhr.open('GET', url);
      xhr.setRequestHeader('authorization', key);
      xhr.send();
      // showing global loader to lock app since the function can take +3 seconds
      this.spinner.show();
      xhr.onreadystatechange = (oEvent) => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this.snackBar.open('Report downloaded successfully', null, {
              duration: 5000,
            });
            this.spinner.hide();
          } else {
            this.snackBar.open(xhr.statusText, null, { duration: 5000 });
            this.spinner.hide();
          }
        }
      };
    });
  }
}

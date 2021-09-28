import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor(
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar
  ) {}

  // downloads a contract by its id
  downloadContract(contractId: string, contractNumber: string) {
    const url = `https://maxsold.blob.core.windows.net/contract/${contractId}.pdf?sp=r&st=2021-07-18T18:30:34Z&se=2025-07-19T18:30:00Z&sv=2020-08-04&sr=c&sig=ar1NvUZuTnYG8BWfMCL8wSdPxMRRdLgkwRZ%2BTvE2oLg%3D`;
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `MaxSoldContract ${contractNumber}`;
      a.dispatchEvent(new MouseEvent('click'));
    };
    xhr.open('GET', url);
    xhr.send();
  }

  // downloads a statement by its id from firebase storage
  downloadStatement(statementId: string) {
    const ref = this.storage.ref(`statements/${statementId}.pdf`);
    ref.getDownloadURL().subscribe(
      (url) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
          var blob = xhr.response;
          var a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.download = statementId;
          a.dispatchEvent(new MouseEvent('click'));
        };
        xhr.open('GET', url);
        xhr.send();
      },
      (error) => {
        this.snackBar.open('Statement report not found.', null, {
          duration: 5000,
        });
      }
    );
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-success',
  templateUrl: './register-success.component.html',
  styles: [
    `
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 750px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterSuccessComponent implements OnInit {
  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // notifies the user that email has been sent
    this.snackBar.open(
      'Please check your inbox, verification email has been sent.',
      null,
      { duration: 10000 }
    );
  }
}

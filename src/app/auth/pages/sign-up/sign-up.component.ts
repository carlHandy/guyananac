import { Component } from '@angular/core';

@Component({
  templateUrl: './sign-up.component.html',
  styles: [
    `
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 750px;
        }
      }
    `,
  ],
})
export class SignUpComponent {

  constructor(
  ) {}  
}

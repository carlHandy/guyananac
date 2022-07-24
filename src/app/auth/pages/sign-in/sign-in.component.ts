import { Component, OnInit } from '@angular/core';


@Component({
  templateUrl: './sign-in.component.html',
  styles: [
    `
      @media (max-width: 600px) {
        .header-box {
          background-image: url('/assets/images/login-bg.jpg');
        }
      }
      @media (min-width: 600px) {
        .sign-up-box {
          max-height: 750px;
        }
      }
    `,
  ],
})
export class SignInComponent implements OnInit {


  constructor() {}

  ngOnInit(): void {}

}

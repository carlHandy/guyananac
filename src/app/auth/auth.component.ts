import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  currentApplicationVersion = environment.appVersion;
  constructor() {}

  ngOnInit(): void {}
}

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: require('../../package.json').version + '-dev',
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 firebase: {
  apiKey: "AIzaSyAolvTe3JAhs-p_TMWRkhSd42HwRtOS7To",
  authDomain: "guyananac-prod.firebaseapp.com",
  projectId: "guyananac-prod",
  storageBucket: "guyananac-prod.appspot.com",
  messagingSenderId: "397036527601",
  appId: "1:397036527601:web:d116217a89ada55a8e6e50",
  measurementId: "G-XK38SWBP81",
  cloudFunctionsBaseUrl:
  'https://us-central1-guyananac-prod.cloudfunctions.net/',
allowEmailChange: true,
}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

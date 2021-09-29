// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: require('../../package.json').version + '-dev',
  firebase: {
    apiKey: 'AIzaSyD_hfDc7NWCsTWBkhtQk4jkDc9ch2BNYKU',
    authDomain: 'seller.maxsold.dev',
    projectId: 'mx-seller-portal',
    storageBucket: 'mx-seller-portal.appspot.com',
    messagingSenderId: '969854014217',
    appId: '1:969854014217:web:eda1a2f77affed9cbf79d8',
  },
  zendeskUrl:
    'https://static.zdassets.com/ekr/snippet.js?key=8bc5d1cc-52af-4029-80b4-68570862597c',
  invitationEmailUrl: 'https://seller.maxsold.dev/',
  cloudFunctionsBaseUrl:
    'https://us-central1-mx-seller-portal.cloudfunctions.net/',
  allowEmailChange: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
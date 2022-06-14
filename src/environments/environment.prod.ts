export const environment = {
  production: true,
  maintenance: true,
  appVersion: require('../../package.json').version,
  recaptcha: {
    siteKey: '6LcGLfodAAAAANxDaTurnGy7eA6hBxqk-JWNey4w',
    challengeKey: '6Le9YxEeAAAAACOEpDHOdVoCuZ529kmA0DoIrI2F'
  },
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
  allowEmailChange: false,
};

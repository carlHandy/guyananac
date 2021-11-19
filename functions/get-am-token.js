const admin = require("firebase-admin");
const functions = require("firebase-functions");
var e = require('request');
const cors = require("cors")({
  origin: true,
});

// Check if firebase is authorized
async function validateToken(token) {
    try {
      let response = await admin.auth().verifyIdToken(token);
      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

exports.get360Token = functions.https.onRequest( (request, response) => {
    // enable cors 
    cors(request, response, () => {
           // request to auction method api   
        return validateToken(request.headers.authorization)
        .then(() => {
            e.post(
                'https://maxsold.maxsold.com/mapi/auth/token',
                { json: { username: 'jon.lenton@maxsold.com' },
                headers:{ 'x-api-key': 'aa7f20e2d7a6204d30d7eadd3cb6841d9d0f97bd'} },
                function (error, res, body) {
                    if (!error && res.statusCode == 200) {
                        response.status(200).send({body});
                    }
                }
                );
          })
        })
    })
  
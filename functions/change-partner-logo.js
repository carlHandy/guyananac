const admin = require("firebase-admin");
const functions = require("firebase-functions");
const axios = require('axios');
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
        return validateToken(request.headers.authorization)
        .then(() => {
            // request to auction method api
            let url = 'https://maxsold.maxsold.com';
            axios.post(`${url}/mapi/auctions/updatepartnerlogo`, 
            { 
                username: "jon.lenton@maxsold.com"
            }, 
            {headers:{ 'x-api-key': 'aa7f20e2d7a6204d30d7eadd3cb6841d9d0f97bd'}
        })
            .then(r => { 
              console.log("AM response", r);
              response.send(r.data);
            })
            .catch( e => {
              console.log( "AM error: ", e);
              response.sendStatus(500);
            })
        }).catch((err) => {
            return response.status(401).send(err);
        });
    })
  
  })
const functions = require("firebase-functions");
const axios = require('axios');
const cors = require("cors")({
  origin: true,
});

// handles the generation of access token
exports.get360Token = functions.https.onRequest(async (req, res) => {
    // allow cors request
    return cors(req, res, () => {
            let user = 'jon.lenton@maxsold.com';
            return axios.post('https://maxsold.maxsold.com/mapi/auctions/updatepartnerlogo', {username: user}, {
                headers: {
                    'x-api-key': 'aa7f20e2d7a6204d30d7eadd3cb6841d9d0f97bd'
                }
            })
            .then(response => {
                return res.status(200).json({
                    message: response.data
                })
            }).catch(err => {
                return res.status(500).json({
                    error: err
                })
            })
        }) 
    });
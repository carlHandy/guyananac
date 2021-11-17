const functions = require("firebase-functions");
const axios = require('axios');
const cors = require("cors")({
  origin: true,
});

// handles the generation of access token
exports.get360Token = functions.https.onRequest(async (req, res) => {
    // allow cors request
    return cors(req, res, () => {
            let user = 'sushee@maxsold.com';
            return axios.post('https://maxsold-test.maxsold.com/mapi/auth/token', {username: user}, {
                headers: {
                    'x-api-key': 'aa7f20e2d7a6204d30d7eadd3cb6841d9d0f97bd'
                }
            })
            .then(response => {
                if (res.status == 200) {
                    return response.data;
                }
            }).catch(err => {
                return res.status(500).json({
                    error: err
                })
            })
        }) 
    });
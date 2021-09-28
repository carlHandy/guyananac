const admin = require("firebase-admin");
const functions = require("firebase-functions");
const utils = require("./utils");
const cors = require("cors")({
  origin: true,
});

const db = admin.firestore();

// Check if firebase is authorized
async function validateToken(token) {
  try {
    let response = await admin.auth().verifyIdToken(token);
    return response;
  } catch (err) {
    throw new Error(err);
  }
}

// adds a seller as observer to a invitation
exports.acceptSellerObserverInvitation = functions.https.onRequest(
  async (req, res) => {
    // allowing cors
    return cors(req, res, () => {
      // validating request header with firebase
      return validateToken(req.headers.authorization)
        .then(() => {
          let sellerId = req.body.sellerId || null;
          let auctionId = req.body.auctionId || null;
          let invitationId = req.body.invitationId || null;

          if (!sellerId || !auctionId || !invitationId) {
            throw new Error("Incomplete body");
          }

          // firestore references
          const sellerRef = db.collection("sellers").doc(sellerId);
          const auctionRef = db.collection("auctions").doc(auctionId);
          const invitationRef = db
            .collection("auctionSellerInvitations")
            .doc(invitationId);

          return db
            .runTransaction(async (transaction) => {
              try {
                // getting objs
                const sellerSnap = await transaction.get(sellerRef);
                const auctionSnap = await transaction.get(auctionRef);

                // resources don't exist
                if (!sellerSnap.exists || !auctionSnap.exists) {
                  throw new Error("Entities not found");
                }

                // set seller id in auctions observer list
                // set seller id in auctions read permission list
                await transaction.update(auctionRef, {
                  auctionObserversSeller:
                    admin.firestore.FieldValue.arrayUnion(sellerId),
                  sellerPermissionsReadOnly:
                    admin.firestore.FieldValue.arrayUnion(sellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // set auction id in seller.auctionList
                await transaction.update(sellerRef, {
                  auctionList: admin.firestore.FieldValue.arrayUnion(auctionId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // remove the invitation
                await transaction.delete(invitationRef);
                return;
              } catch (error) {
                throw new Error(error);
              }
            })
            .then(() => {
              return res.status(200).send({ message: "Seller observer added" });
            })
            .catch((err) => {
              return res.status(500).send({
                message: "Something went wrong",
                err: err,
              });
            });
        })
        .catch((err) => {
          return res.status(401).send(err);
        });
    });
  }
);

// adds a team as observer for an auction
exports.acceptTeamObserverInvitation = functions.https.onRequest(
  async (req, res) => {
    // allowing cor request
    return cors(req, res, () => {
      // validating authorization header with firebase
      return validateToken(req.headers.authorization)
        .then(() => {
          let teamId = req.body.teamId || null;
          let auctionId = req.body.auctionId || null;
          let invitationId = req.body.invitationId || null;

          // invalid request
          if (!teamId || !auctionId || !invitationId) {
            throw new Error("Incomplete body");
          }

          // firestore references
          const teamRef = db.collection("teams").doc(teamId);
          const auctionRef = db.collection("auctions").doc(auctionId);
          const invitationRef = db
            .collection("auctionTeamInvitations")
            .doc(invitationId);

          return db
            .runTransaction(async (transaction) => {
              try {
                // getting objs
                const teamSnap = await transaction.get(teamRef);
                const auctionSnap = await transaction.get(auctionRef);

                if (!teamSnap.exists || !auctionSnap.exists) {
                  throw new Error("Entities not found");
                }

                const teamData = teamSnap.data();
                const admins = teamData.teamAdmins || [];
                const viewers = teamData.teamViewers || [];

                const allMembers = [...admins, ...viewers];

                // add auctionId to all members
                allMembers.forEach(async (id) => {
                  const ref = db.collection("sellers").doc(id);
                  await transaction.update(ref, {
                    auctionList:
                      admin.firestore.FieldValue.arrayUnion(auctionId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                });

                // add admins to readWrite
                if (admins.length > 0) {
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadWrite:
                      admin.firestore.FieldValue.arrayUnion(...admins),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                }

                // add viewers to readOnly
                if (viewers.length > 0) {
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadOnly:
                      admin.firestore.FieldValue.arrayUnion(...viewers),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                }

                // add teamId to observerArray
                await transaction.update(auctionRef, {
                  auctionObserversTeam:
                    admin.firestore.FieldValue.arrayUnion(teamId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // remove the invitation
                await transaction.delete(invitationRef);
                return;
              } catch (error) {
                throw new Error(error);
              }
            })
            .then(() => {
              return res.status(200).send({ message: "Team observer added" });
            })
            .catch((err) => {
              return res.status(500).send({
                message: "Something went wrong",
                err: err,
              });
            });
        })
        .catch((err) => {
          return res.status(401).send(err);
        });
    });
  }
);

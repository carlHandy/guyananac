const admin = require("firebase-admin");
const functions = require("firebase-functions");
const utils = require("./utils");
const cors = require("cors")({
  origin: true,
});

const db = admin.firestore();

const roleMap = {
  viewer: "viewer",
  admin: "admin",
};

// Check if firebase is authorized
async function validateToken(token) {
  try {
    let response = await admin.auth().verifyIdToken(token);
    return response;
  } catch (err) {
    throw err.errorInfo.message;
  }
}

// adds a member to a team
exports.acceptTeamInvitation = functions.https.onRequest(async (req, res) => {
  return cors(req, res, () => {
    return validateToken(req.headers.authorization)
      .then(async () => {
        try {
          // getting info from body
          let sellerId = req.body.sellerId || null;
          let teamId = req.body.teamId || null;
          let role = req.body.role || null;
          let invitationId = req.body.invitationId || null;

          // invalid request
          if (!sellerId || !teamId || !role || !invitationId) {
            throw new Error("Incomplete body");
          }

          // invalid request
          if (role !== roleMap.admin && role !== roleMap.viewer) {
            throw new Error("Invalid role");
          }

          // references
          const sellerRef = db.collection("sellers").doc(sellerId);
          const teamRef = db.collection("teams").doc(teamId);

          // snapshots
          const sellerSnap = await db.collection("sellers").doc(sellerId).get();
          const teamSnap = await db.collection("teams").doc(teamId).get();

          // invalid request
          if (!sellerSnap.exists || !teamSnap.exists) {
            throw new Error("Entities not found");
          }

          const ownedAuctions = await db
            .collection("auctions")
            .where("auctionOwnerTeam", "==", teamId)
            .get();

          const observedAuctions = await db
            .collection("auctions")
            .where("auctionObserversTeam", "array-contains", teamId)
            .get();

          // gettings ids
          const ownedAuctionsIds =
            ownedAuctions.docs.map((doc) => doc.id) || [];
          const observedAuctionsIds =
            observedAuctions.docs.map((doc) => doc.id) || [];

          const batches = [];

          const baseBatch = db.batch();

          // add team id to seller
          baseBatch.update(sellerRef, {
            teamIds: admin.firestore.FieldValue.arrayUnion(teamId),
            modifiedDate: utils.getCurrentTimeFixed(),
          });

          // add sellerId to the team incremente team memberCount by +1
          if (role === roleMap.admin) {
            baseBatch.update(teamRef, {
              teamAdmins: admin.firestore.FieldValue.arrayUnion(sellerId),
              teamMemberCount: admin.firestore.FieldValue.increment(1),
              modifiedDate: utils.getCurrentTimeFixed(),
            });
          } else {
            baseBatch.update(teamRef, {
              teamViewers: admin.firestore.FieldValue.arrayUnion(sellerId),
              teamMemberCount: admin.firestore.FieldValue.increment(1),
              modifiedDate: utils.getCurrentTimeFixed(),
            });
          }

          const invitationRef = db.collection("invitations").doc(invitationId);

          // delete invitation
          baseBatch.delete(invitationRef);

          batches.push(baseBatch.commit());

          // for all owned auctions
          let sliceSize = 200;

          for (
            let index = 0;
            index < ownedAuctionsIds.length;
            index += sliceSize
          ) {
            const ownedBatch = db.batch();
            // getting chuck to update
            const idsChunk = ownedAuctionsIds.slice(index, index + sliceSize);
            // setting batch for each id in the chunk
            for (
              let innerIndex = 0;
              innerIndex < idsChunk.length;
              innerIndex++
            ) {
              const id = idsChunk[innerIndex];
              let ref = db.collection("auctions").doc(id);
              if (role === roleMap.admin) {
                // - add write permission
                ownedBatch.update(ref, {
                  sellerPermissionsReadWrite:
                    admin.firestore.FieldValue.arrayUnion(sellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              } else {
                // - add read permission
                ownedBatch.update(ref, {
                  sellerPermissionsReadOnly:
                    admin.firestore.FieldValue.arrayUnion(sellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              }
              // - add the auctionId to the seller
              ownedBatch.update(sellerRef, {
                auctionList: admin.firestore.FieldValue.arrayUnion(id),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
            }

            batches.push(ownedBatch.commit());
          }

          // for observed
          for (
            let index = 0;
            index < observedAuctionsIds.length;
            index += sliceSize
          ) {
            const observedBatch = db.batch();
            // getting chuck to update
            const idsChunk = observedAuctionsIds.slice(
              index,
              index + sliceSize
            );
            for (
              let innerIndex = 0;
              innerIndex < idsChunk.length;
              innerIndex++
            ) {
              let ref = db.collection("auctions").doc(id);
              // - add read permission
              observedBatch.update(ref, {
                sellerPermissionsReadOnly:
                  admin.firestore.FieldValue.arrayUnion(sellerId),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
              // - add the auctionId to the seller
              observedBatch.update(sellerRef, {
                auctionList: admin.firestore.FieldValue.arrayUnion(id),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
            }

            batches.push(observedBatch.commit());
          }

          return Promise.all([...batches])
            .then(() => {
              return res.status(200).send({ message: "member added" });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                message: "Something went wrong",
                err: err,
              });
            });
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).send(err);
      });
  });
});

// checks if a team can be deleted
exports.canTeamBeDeleted = functions.https.onRequest(async (req, res) => {
  return cors(req, res, () => {
    return validateToken(req.headers.authorization)
      .then(async () => {
        try {
          let teamId = req.body.teamId || null;

          if (!teamId) {
            throw new Error("Incomplete body");
          }

          // getting firestore references
          let ownedAuctionsRef = db
            .collection("auctions")
            .where("auctionOwnerTeam", "==", teamId);
          let observerdAuctionsRef = db
            .collection("auctions")
            .where("auctionObserversTeam", "array-contains", teamId);

          // getting data
          const ownedAuctionsSnap = await ownedAuctionsRef.get();
          const observerdAuctionsSnap = await observerdAuctionsRef.get();

          let total = 0;
          // adds owned auctions amount if exists
          if (!ownedAuctionsSnap.empty && ownedAuctionsSnap.docs) {
            total += ownedAuctionsSnap.docs.length;
          }

          // adding observer auctions amount if exists
          if (!observerdAuctionsSnap.empty && observerdAuctionsSnap.docs) {
            total += observerdAuctionsSnap.docs.length;
          }

          // if there is at least one auction deny deletion
          return res.status(200).json({
            result: total <= 0,
          });
        } catch (error) {
          throw new Error(error);
        }
      })
      .catch((err) => {
        return res.status(401).send(err);
      });
  });
});

// deletes a team member from a team
exports.deleteTeamMember = functions.https.onRequest(async (req, res) => {
  return cors(req, res, () => {
    return validateToken(req.headers.authorization)
      .then(async () => {
        try {
          // getting info from body
          let sellerId = req.body.sellerId || null;
          let teamId = req.body.teamId || null;
          let role = req.body.role || null;

          // invalid request
          if (!sellerId || !teamId || !role) {
            throw new Error("Incomplete body");
          }

          // invalid request
          if (role !== roleMap.admin && role !== roleMap.viewer) {
            throw new Error("Invalid role");
          }

          // references
          const sellerRef = db.collection("sellers").doc(sellerId);
          const teamRef = db.collection("teams").doc(teamId);

          // snapshots
          const sellerSnap = await db.collection("sellers").doc(sellerId).get();
          const teamSnap = await db.collection("teams").doc(teamId).get();

          // invalid request
          if (!sellerSnap.exists || !teamSnap.exists) {
            throw new Error("Entities not found");
          }

          const ownedAuctions = await db
            .collection("auctions")
            .where("auctionOwnerTeam", "==", teamId)
            .get();

          const observedAuctions = await db
            .collection("auctions")
            .where("auctionObserversTeam", "array-contains", teamId)
            .get();

          // gettings ids
          const ownedAuctionsIds =
            ownedAuctions.docs.map((doc) => doc.id) || [];
          const observedAuctionsIds =
            observedAuctions.docs.map((doc) => doc.id) || [];

          const batches = [];

          const baseBatch = db.batch();

          // remove team id from seller
          baseBatch.update(sellerRef, {
            teamIds: admin.firestore.FieldValue.arrayRemove(teamId),
            modifiedDate: utils.getCurrentTimeFixed(),
          });

          // remove sellerId to the team incremente team memberCount by -1
          if (role === roleMap.admin) {
            baseBatch.update(teamRef, {
              teamAdmins: admin.firestore.FieldValue.arrayRemove(sellerId),
              teamMemberCount: admin.firestore.FieldValue.increment(-1),
              modifiedDate: utils.getCurrentTimeFixed(),
            });
          } else {
            baseBatch.update(teamRef, {
              teamViewers: admin.firestore.FieldValue.arrayRemove(sellerId),
              teamMemberCount: admin.firestore.FieldValue.increment(-1),
              modifiedDate: utils.getCurrentTimeFixed(),
            });
          }

          batches.push(baseBatch.commit());

          // for all owned auctions
          let sliceSize = 200;

          for (
            let index = 0;
            index < ownedAuctionsIds.length;
            index += sliceSize
          ) {
            const ownedBatch = db.batch();
            // getting chuck to update
            const idsChunk = ownedAuctionsIds.slice(index, index + sliceSize);
            // setting batch for each id in the chunk
            for (
              let innerIndex = 0;
              innerIndex < idsChunk.length;
              innerIndex++
            ) {
              const id = idsChunk[innerIndex];
              let ref = db.collection("auctions").doc(id);
              if (role === roleMap.admin) {
                // - remove write permission
                ownedBatch.update(ref, {
                  sellerPermissionsReadWrite:
                    admin.firestore.FieldValue.arrayRemove(sellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              } else {
                // - remove read permission
                ownedBatch.update(ref, {
                  sellerPermissionsReadOnly:
                    admin.firestore.FieldValue.arrayRemove(sellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              }
              // - remove the auctionId from the seller
              ownedBatch.update(sellerRef, {
                auctionList: admin.firestore.FieldValue.arrayRemove(id),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
            }

            batches.push(ownedBatch.commit());
          }

          // for observed
          for (
            let index = 0;
            index < observedAuctionsIds.length;
            index += sliceSize
          ) {
            const observedBatch = db.batch();
            // getting chuck to update
            const idsChunk = observedAuctionsIds.slice(
              index,
              index + sliceSize
            );
            for (
              let innerIndex = 0;
              innerIndex < idsChunk.length;
              innerIndex++
            ) {
              let ref = db.collection("auctions").doc(id);
              // - remove read permission
              observedBatch.update(ref, {
                sellerPermissionsReadOnly:
                  admin.firestore.FieldValue.arrayRemove(sellerId),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
              // - remove the auctionId to the seller
              observedBatch.update(sellerRef, {
                auctionList: admin.firestore.FieldValue.arrayRemove(id),
                modifiedDate: utils.getCurrentTimeFixed(),
              });
            }

            batches.push(observedBatch.commit());
          }

          return Promise.all([...batches])
            .then(() => {
              return res.status(200).send({ message: "member deleted" });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                message: "Something went wrong",
                err: err,
              });
            });
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).send(err);
      });
  });
});

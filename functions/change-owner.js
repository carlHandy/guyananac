const admin = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require("cors")({
  origin: true,
});

const utils = require("./utils");

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

// handles the change of an auction owner to a new seller owner
exports.changeOwnerSeller = functions.https.onRequest(async (req, res) => {
  // allwoing cors request
  return cors(req, res, () => {
    // validating authorization headers with girebase
    return validateToken(req.headers.authorization)
      .then(() => {
        let newOwnerId = req.body.newOwnerId || null;
        let auctionId = req.body.auctionId || null;

        if (!newOwnerId || !auctionId) {
          throw new Error("Incomplete body");
        }

        let auctionRef = db.collection("auctions").doc(auctionId);

        return db
          .runTransaction(async (transaction) => {
            try {
              const auctionSnap = await transaction.get(auctionRef);

              if (!auctionSnap.exists) {
                throw new Error("Entities not found");
              }

              const auctionData = auctionSnap.data();
              const auctionObservers = auctionData.auctionObserversSeller || [];

              // if old owner is a team
              if (auctionData.auctionOwnerTeam != null) {
                const teamRef = db
                  .collection("teams")
                  .doc(auctionData.auctionOwnerTeam);
                const teamSnap = await transaction.get(teamRef);
                if (!teamSnap.exists) {
                  throw new Error("Entities not found");
                }
                const teamData = teamSnap.data();
                const admins = teamData.teamAdmins || [];
                const viewers = teamData.teamViewers || [];

                // for all admins
                admins.forEach(async (adminId) => {
                  // remove id from read/write
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadWrite:
                      admin.firestore.FieldValue.arrayRemove(adminId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });

                  // check if admin is a observer
                  if (auctionObservers.includes(adminId)) {
                    // add id to read/Only
                    await transaction.update(auctionRef, {
                      sellerPermissionsReadOnly:
                        admin.firestore.FieldValue.arrayUnion(adminId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  } else {
                    const adminRef = db.collection("sellers").doc(adminId);
                    // remove auction from viewer
                    await transaction.update(adminRef, {
                      auctionList:
                        admin.firestore.FieldValue.arrayRemove(auctionId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  }
                });

                //for all viewers
                viewers.forEach(async (viewerId) => {
                  //check if viewer is NOT a observer
                  if (!auctionObservers.includes(viewerId)) {
                    const viewerRef = db.collection("sellers").doc(viewerId);
                    // remove id from read/Only
                    await transaction.update(auctionRef, {
                      sellerPermissionsReadOnly:
                        admin.firestore.FieldValue.arrayRemove(viewerId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                    // remove auction id from viewer
                    await transaction.update(viewerRef, {
                      auctionList:
                        admin.firestore.FieldValue.arrayRemove(auctionId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  }
                });

                //set ownerTeamId = null
                await transaction.update(auctionRef, {
                  auctionOwnerTeam: null,
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // if old owner is a seller
              } else if (auctionData.auctionOwnerSeller != null) {
                const oldOwnerSellerId = auctionData.auctionOwnerSeller;
                // remove id from read/write
                await transaction.update(auctionRef, {
                  sellerPermissionsReadWrite:
                    admin.firestore.FieldValue.arrayRemove(oldOwnerSellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // owner is not an observer
                if (!auctionObservers.includes(oldOwnerSellerId)) {
                  const oldOwnerRef = db
                    .collection("sellers")
                    .doc(oldOwnerSellerId);
                  // remove auction id from old owner
                  await transaction.update(oldOwnerRef, {
                    auctionList:
                      admin.firestore.FieldValue.arrayRemove(auctionId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                } else {
                  // add id to read/only
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadOnly:
                      admin.firestore.FieldValue.arrayUnion(oldOwnerSellerId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                }

                //set auctionOwnerSeller = null
                await transaction.update(auctionRef, {
                  auctionOwnerSeller: null,
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              }

              // add ownerSellerId to read/Write
              await transaction.update(auctionRef, {
                sellerPermissionsReadWrite:
                  admin.firestore.FieldValue.arrayUnion(newOwnerId),
                modifiedDate: utils.getCurrentTimeFixed(),
              });

              // add auction to list
              const newOwnerRef = db.collection("sellers").doc(newOwnerId);

              await transaction.update(newOwnerRef, {
                auctionList: admin.firestore.FieldValue.arrayUnion(auctionId),
                modifiedDate: utils.getCurrentTimeFixed(),
              });

              // set ownerSellerId to new owner
              await transaction.update(auctionRef, {
                auctionOwnerSeller: newOwnerId,
                modifiedDate: utils.getCurrentTimeFixed(),
              });

              return;
            } catch (error) {
              throw new Error(error);
            }
          })
          .then(() => {
            return res.status(200).send({ message: "Owner changed" });
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
});

// handles the change of an auction owner to a new team owner
exports.changeOwnerTeam = functions.https.onRequest(async (req, res) => {
  // allowing cor requests
  return cors(req, res, () => {
    // validating authorization header with firebase
    return validateToken(req.headers.authorization)
      .then(() => {
        let newOwnerTeamId = req.body.newOwnerTeamId || null;
        let auctionId = req.body.auctionId || null;

        if (!newOwnerTeamId || !auctionId) {
          throw new Error("Incomplete body");
        }

        let auctionRef = db.collection("auctions").doc(auctionId);
        let newOwnerTeamRef = db.collection("teams").doc(newOwnerTeamId);

        return db
          .runTransaction(async (transaction) => {
            try {
              //
              const auctionSnap = await transaction.get(auctionRef);
              const teamSnap = await transaction.get(newOwnerTeamRef);

              if (!auctionSnap.exists || !teamSnap.exists) {
                throw new Error("Entities not found");
              }

              const auctionData = auctionSnap.data();
              const auctionObservers = auctionData.auctionObserversSeller || [];
              // if old owner is a team
              if (auctionData.auctionOwnerTeam != null) {
                const teamRef = db
                  .collection("teams")
                  .doc(auctionData.auctionOwnerTeam);
                const teamSnap = await transaction.get(teamRef);
                if (!teamSnap.exists) {
                  throw new Error("Entities not found");
                }
                const teamData = teamSnap.data();
                const admins = teamData.teamAdmins || [];
                const viewers = teamData.teamViewers || [];

                // for all admins
                admins.forEach(async (adminId) => {
                  // remove id from read/write
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadWrite:
                      admin.firestore.FieldValue.arrayRemove(adminId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });

                  // check if admin is a observer
                  if (auctionObservers.includes(adminId)) {
                    // add id to read/Only
                    await transaction.update(auctionRef, {
                      sellerPermissionsReadOnly:
                        admin.firestore.FieldValue.arrayUnion(adminId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  } else {
                    const adminRef = db.collection("sellers").doc(adminId);
                    // remove auction from viewer
                    await transaction.update(adminRef, {
                      auctionList:
                        admin.firestore.FieldValue.arrayRemove(auctionId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  }
                });

                //for all viewers
                viewers.forEach(async (viewerId) => {
                  //check if viewer is NOT a observer
                  if (!auctionObservers.includes(viewerId)) {
                    const viewerRef = db.collection("sellers").doc(viewerId);
                    // remove id from read/Only
                    await transaction.update(auctionRef, {
                      sellerPermissionsReadOnly:
                        admin.firestore.FieldValue.arrayRemove(viewerId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                    // remove auction id from viewer
                    await transaction.update(viewerRef, {
                      auctionList:
                        admin.firestore.FieldValue.arrayRemove(auctionId),
                      modifiedDate: utils.getCurrentTimeFixed(),
                    });
                  }
                });

                //set ownerTeamId = null
                await transaction.update(auctionRef, {
                  auctionOwnerTeam: null,
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // if old owner is a seller
              } else if (auctionData.auctionOwnerSeller != null) {
                const oldOwnerSellerId = auctionData.auctionOwnerSeller;
                // remove id from read/write
                await transaction.update(auctionRef, {
                  sellerPermissionsReadWrite:
                    admin.firestore.FieldValue.arrayRemove(oldOwnerSellerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });

                // owner is not an observer
                if (!auctionObservers.includes(oldOwnerSellerId)) {
                  const oldOwnerRef = db
                    .collection("sellers")
                    .doc(oldOwnerSellerId);
                  // remove auction id from old owner
                  await transaction.update(oldOwnerRef, {
                    auctionList:
                      admin.firestore.FieldValue.arrayRemove(auctionId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                } else {
                  // add id to read/only
                  await transaction.update(auctionRef, {
                    sellerPermissionsReadOnly:
                      admin.firestore.FieldValue.arrayUnion(oldOwnerSellerId),
                    modifiedDate: utils.getCurrentTimeFixed(),
                  });
                }

                //set auctionOwnerSeller = null
                await transaction.update(auctionRef, {
                  auctionOwnerSeller: null,
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              }

              // getting objs
              const teamData = teamSnap.data();
              const adminsIds = teamData.teamAdmins || [];
              const viewersIds = teamData.teamViewers || [];

              // for all admins
              adminsIds.forEach(async (adminId) => {
                const adminRef = db.collection("sellers").doc(adminId);
                // add auction id to admin
                await transaction.update(adminRef, {
                  auctionList: admin.firestore.FieldValue.arrayUnion(auctionId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
                // add adminId to read/write auction
                await transaction.update(auctionRef, {
                  sellerPermissionsReadWrite:
                    admin.firestore.FieldValue.arrayUnion(adminId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              });

              viewersIds.forEach(async (viewerId) => {
                const viewerRef = db.collection("sellers").doc(viewerId);
                // add auction id to viewer
                await transaction.update(viewerRef, {
                  auctionList: admin.firestore.FieldValue.arrayUnion(auctionId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
                // add viewerId to read/only auction
                await transaction.update(auctionRef, {
                  sellerPermissionsReadOnly:
                    admin.firestore.FieldValue.arrayUnion(viewerId),
                  modifiedDate: utils.getCurrentTimeFixed(),
                });
              });

              // set teamId as auctionOwnerId
              await transaction.update(auctionRef, {
                auctionOwnerTeam: newOwnerTeamId,
                modifiedDate: utils.getCurrentTimeFixed(),
              });
              return;
            } catch (error) {
              throw new Error(error);
            }
          })
          .then(() => {
            return res.status(200).send({ message: "Owner changed" });
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
});

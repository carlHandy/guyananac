const admin = require("firebase-admin");

admin.initializeApp();

const invoices = require("./invoices");
const teams = require("./teams");
const auctions = require("./auctions");
const changeOwner = require("./change-owner");

// pdf
exports.getPdf = invoices.getPdf;
// teams
exports.acceptTeamInvitation = teams.acceptTeamInvitation;
exports.canTeamBeDeleted = teams.canTeamBeDeleted;
exports.deleteTeamMember = teams.deleteTeamMember;
// observers
exports.acceptSellerObserverInvitation =
  auctions.acceptSellerObserverInvitation;
exports.acceptTeamObserverInvitation = auctions.acceptTeamObserverInvitation;
// owners
exports.changeOwnerSeller = changeOwner.changeOwnerSeller;
exports.changeOwnerTeam = changeOwner.changeOwnerTeam;
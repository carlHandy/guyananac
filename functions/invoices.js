const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const admin = require("firebase-admin");
const pdf = require("html-pdf");
const functions = require("firebase-functions");
const utils = require("./utils");
const cors = require("cors")({
  origin: true,
});

const db = admin.firestore();

// Template load
const templateSource = fs.readFileSync(
  path.join(process.cwd(), "functions/front/template.html"),
  "utf8"
);
const footerSource = fs.readFileSync(
  path.join(process.cwd(), "functions/front/footer.html"),
  "utf8"
);

// Assets load
const logo = fs.readFileSync(
  path.join(process.cwd(), "functions/front/logo.svg"),
  "utf8"
);
const icons = {
  unpaidCount: fs.readFileSync(
    path.join(process.cwd(), "functions/front/icons/comment-dollar-solid.svg"),
    "utf8"
  ),
  unpaidAmount: fs.readFileSync(
    path.join(process.cwd(), "functions/front/icons/file-invoice-dollar-solid.svg"),
    "utf8"
  ),
  important: fs.readFileSync(
    path.join(process.cwd(), "functions/front/icons/exclamation-triangle-solid.svg"),
    "utf8"
  ),
  checkbox: fs.readFileSync(
    path.join(process.cwd(), "functions/front/icons/checkbox.svg"),
    "utf8"
  ),
  checkboxEmpty: fs.readFileSync(
    path.join(process.cwd(), "functions/front/icons/checkbox-empty.svg"),
    "utf8"
  ),
};

// Sort items by, options
const sortMap = {
  lot: "invoiceId",
  lastname: "lastName",
  pickuptime: "pickupStarttime",
};

// Default values
const defaultSortKey = "invoiceId";
const defaultCollection = "documents";
const timeZone = "America/Toronto";

// Add left zero to minutes, hours, months or days
leftZero = (n) => (n > 9 ? n : `0${n}`);

// Get date converted to the specified timezone
zoneDate = (t) =>
  new Date(new Date(t * 1000).toLocaleString("en-US", { timeZone }));

// Register currency helpers
handlebars.registerHelper("Currency", function (val) {
  val = parseFloat(val);
  return (
    "$" +
    Number(val).toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
});

// Check if firebase is authorized
async function validateToken(token) {
  try {
    let response = await admin.auth().verifyIdToken(token);
    return response;
  } catch (err) {
    throw err.errorInfo.message;
  }
}

function getAMPM(D) {
  let H = D.getHours();
  let M = leftZero(D.getMinutes());
  return H > 12 ? `${leftZero(H - 12)}:${M} PM` : `${leftZero(H)}:${M} AM`;
}
// Parse pickup time
function pickupParser(start, end) {
  if (isNaN(start) || start == null || start == undefined || start < 1)
    return "";
  let response = "";
  let startDate = zoneDate(start);
  let dateParts = [
    leftZero(startDate.getMonth() + 1),
    leftZero(startDate.getDate()),
    startDate.getFullYear(),
  ];
  response = dateParts.join("/") + ` ${getAMPM(startDate)}`;
  if (isNaN(end) || end == null || end == undefined || end < 1) return response;
  let endDate = zoneDate(end);
  response += ` - ${getAMPM(endDate)}`;
  return response;
}

// Parse document to sort items and be able to iterate on handlebars
function parseDocument(input, sortorder) {
  let invoices = Object.values(input.invoices);
  invoices.forEach((singleInvoice) => {
    let items = Object.values(singleInvoice.items);
    singleInvoice.items = items;
    singleInvoice.pickupDate = pickupParser(
      singleInvoice.pickupStarttime,
      singleInvoice.pickupEndtime
    );
  });

  if (sortorder === sortMap.lot) {
    // First by Invoice.invoiceId
    invoices.sort(sortInvoiceByLots);
    // then by item.itemLotNum
    invoices.forEach((singleInvoice) => {
      singleInvoice.items.sort((a, b) => {
        return parseInt(a.itemLotNum) < parseInt(b.itemLotNum) ? -1 : 1;
      });
    });
  } else if (sortorder === sortMap.lastname) {
    // Only by mapped key
    invoices.sort(sortInvoiceByLastName);
  } else {
    invoices.sort(sortInvoiceByPickupDate);
  }

  // Balance > 0 always at top
  invoices.sort((a, b) => {
    if (parseFloat(a.invoiceBalance) > 0) return -1;
    return 1;
  });

  input.invoices = invoices;
  return input;
}

function sortInvoiceByLots(a, b) {
  if (a.invoiceId < b.invoiceId) {
    return -1;
  }
  if (a.invoiceId > b.invoiceId) {
    return 1;
  }

  return 0;
}

function sortInvoiceByLastName(a, b) {
  if (a.lastName < b.lastName) {
    return -1;
  }
  if (a.lastName > b.lastName) {
    return 1;
  }

  return 0;
}

function sortInvoiceByPickupDate(a, b) {
  if (a.pickupStarttime < b.pickupStarttime) {
    return 1;
  }
  if (a.pickupStarttime > b.pickupStarttime) {
    return -1;
  }

  return 0;
}

// Get document from firestore
async function getDocumentData(collection, document_id) {
  if (!collection.length) throw "Invalid collection name";
  if (!document_id.length) throw "Invalid document ID";
  let ref = db
    .collection("auctions")
    .doc(document_id)
    .collection("invoices")
    .doc(document_id);
  let doc = await ref.get();
  if (!doc.exists) throw "Invalid document ID";
  return doc.data();
}

// Main function to generate html
async function invoice(collection, document_id, sortorder) {
  console.time("GET Document from Firebase");
  let data = await getDocumentData(collection, document_id);
  console.timeEnd("GET Document from Firebase");
  console.time("PUT Data into Template");
  let invoiceData = parseDocument(data, sortorder);
  var template = handlebars.compile(templateSource);
  var finalHtml = template({
    logo,
    icons,
    invoiceData,
  });

  var footerTemplate = handlebars.compile(footerSource)({
    date: invoiceData.issueDate,
    page: "{{page}}",
    pages: "{{pages}}",
  });

  console.timeEnd("PUT Data into Template");

  var options = {
    width: `${900 * 0.75}px`,
    height: `${1100 * 0.75}px`,
    renderDelay: undefined,
    zoomFactor: "2",
    footer: {
      height: "40px",
      contents: footerTemplate,
    },
    header: {
      height: "40px",
    },
  };
  console.time("GENERATE PDF");
  return new Promise((resolve) => {
    pdf.create(finalHtml, options).toBuffer((err, buffer) => {
      console.timeEnd("GENERATE PDF");
      if (err) throw "PDF creation error";
      resolve(buffer);
    });
  });
}

// Exportable function, returns pdf for a given invoice report
exports.getPdf = functions.https.onRequest(async (req, res) => {
  return cors(req, res, () => {
    let collection =
      req.query.collection || req.body.collection || defaultCollection;
    let document_id = req.query.document || req.body.document || "";
    let sortorder = req.query.sortorder || req.body.sortorder || false;
    return validateToken(req.headers.authorization)
      .then(() => {
        return invoice(collection, document_id, sortorder)
          .then((documentBody) => {
            // For debugging purposes on local, this creates the file "output.pdf"
            //fs.writeFileSync('output.pdf', documentBody, 'utf8')
            res.setHeader("content-type", "application/pdf");
            res.status(200).send(documentBody);
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      })
      .catch((err) => {
        res.status(401).send(err);
      });
  });
});

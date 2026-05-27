const SPREADSHEET_ID = "1pxBtLB9m2oh1Y3fNqoSbPFpv6oC7Ykwm30mX1uS-n1s";
const SHEET_NAME = "Presencas";

function doPost(e) {
  const sheet = getSheet();
  const data = parsePayload(e);

  sheet.appendRow([
    new Date(),
    data.nome || "",
    data.acompanhantes || "0",
    data.presenca || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Webhook ativo" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Data/Hora", "Nome", "Acompanhantes", "Presenca"]);
  }

  return sheet;
}

function parsePayload(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return e.parameter || {};
    }
  }

  return e && e.parameter ? e.parameter : {};
}

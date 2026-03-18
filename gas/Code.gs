// ============================================================
// Tournament Manager — Google Apps Script Backend
// ============================================================
// SETUP INSTRUCTIONS:
//   1. Open your Google Sheet (with headers on row 1):
//      Name | Faction | Role | Payment_Status | Alive_Status | Kills | Faction_Approved | Death_Time
//   2. Open Extensions > Apps Script, paste this file.
//   3. Deploy > New Deployment > Web App
//      Execute as: Me | Who has access: Anyone
//   4. Copy the Web App URL into your .env.local as NEXT_PUBLIC_GAS_URL
// ============================================================

const SHEET_NAME = "Players"; // Change to your sheet tab name

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function sheetToObjects(sheet) {
  const headers = getHeaders(sheet);
  const rows = sheet.getDataRange().getValues().slice(1); // skip header row
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function colIndexOf(sheet, colName) {
  const headers = getHeaders(sheet);
  return headers.indexOf(colName) + 1; // 1-indexed
}

// ---- CORS helper ----
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- doGet ----
function doGet(e) {
  const sheet = getSheet();
  const params = e.parameter;

  // GET single player: ?name=PlayerName
  if (params.name) {
    const players = sheetToObjects(sheet);
    const player = players.find(p => p.Name.toString().toLowerCase() === params.name.toLowerCase());
    if (!player) {
      return buildResponse({ success: false, error: "Player not found" });
    }
    return buildResponse({ success: true, data: player });
  }

  // GET all players: ?action=get_all
  if (params.action === "get_all") {
    const players = sheetToObjects(sheet);
    return buildResponse({ success: true, data: players });
  }

  return buildResponse({ success: false, error: "Unknown GET action" });
}

// ---- doPost ----
function doPost(e) {
  const sheet = getSheet();
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return buildResponse({ success: false, error: "Invalid JSON payload" });
  }

  const { action } = payload;

  // ---- register ----
  if (action === "register") {
    const { name, faction, role } = payload;
    if (!name || !faction || !role) {
      return buildResponse({ success: false, error: "Missing fields: name, faction, role" });
    }

    // Check for duplicate
    const players = sheetToObjects(sheet);
    if (players.find(p => p.Name.toString().toLowerCase() === name.toLowerCase())) {
      return buildResponse({ success: false, error: "Player already registered" });
    }

    // Auto-approve built-in factions, require approval for others
    const isApproved = (faction.toLowerCase() === "solo") ? true : false;
    // Row: Name, Faction, Role, Payment, Alive, Kills, Faction_Approved, Death_Time
    sheet.appendRow([name, faction, role, false, true, 0, isApproved, ""]);

    return buildResponse({ success: true, message: "Registered successfully" });
  }

  // ---- update_status ----
  if (action === "update_status") {
    const { name, colName, value } = payload;
    if (!name || !colName || value === undefined) {
      return buildResponse({ success: false, error: "Missing fields: name, colName, value" });
    }

    const players = sheetToObjects(sheet);
    const rowIndex = players.findIndex(p => p.Name.toString().toLowerCase() === name.toLowerCase());
    if (rowIndex === -1) {
      return buildResponse({ success: false, error: "Player not found" });
    }

    const colIdx = colIndexOf(sheet, colName);
    if (colIdx === 0) {
      return buildResponse({ success: false, error: "Unknown column: " + colName });
    }

    // rowIndex is 0-based in slice, +2 for header and 1-indexing
    sheet.getRange(rowIndex + 2, colIdx).setValue(value);

    // If setting Alive_Status to false (killed), timestamp the Death_Time
    if (colName === "Alive_Status" && value === false) {
      const deathColIdx = colIndexOf(sheet, "Death_Time");
      if (deathColIdx > 0) {
        sheet.getRange(rowIndex + 2, deathColIdx).setValue(new Date().toISOString());
      }
    }
    // If resurrecting (Alive = true), clear the Death_Time
    if (colName === "Alive_Status" && value === true) {
      const deathColIdx = colIndexOf(sheet, "Death_Time");
      if (deathColIdx > 0) {
        sheet.getRange(rowIndex + 2, deathColIdx).setValue("");
      }
    }

    return buildResponse({ success: true, message: "Updated successfully" });
  }

  return buildResponse({ success: false, error: "Unknown action: " + action });
}

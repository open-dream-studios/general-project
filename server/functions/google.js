import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export const SHEET_ID = "1OWM3yehCwn_E8xDc9o0g9oAtWDm-vf3AkXCE-IYkvew"; 
export const SHEET_NAME = "Inventory"; 

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

export const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ],
});

const drive = google.drive({ version: "v3", auth });

export async function getSheetSharedEmails() {
  const res = await drive.permissions.list({
    fileId: SHEET_ID,
    fields: "permissions(emailAddress)",
  });

  const emails = res.data.permissions
    .map((perm) => perm.emailAddress)
    .filter(Boolean); // remove undefined entries

  return emails;
}

export async function getSheetData() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}`,
  });
  return res.data.values;
}

export async function updateRow(rowIndex, rowData) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [rowData],
    },
  });
}

function columnIndexToLetter(index) {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

export async function updateCell(row, column, value) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const range = `${SHEET_NAME}!${columnIndexToLetter(column)}${row + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: range,
    valueInputOption: "RAW",
    requestBody: {
      values: [[value]],
    },
  });
}

const TubImagesColumn = 15

export async function getNotes(row) {
  const sheets = google.sheets({ version: "v4", auth });
  
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: [`${SHEET_NAME}!${columnIndexToLetter(TubImagesColumn)}${row+1}`],
    includeGridData: true,  
    fields: "sheets.data.rowData.values.note",
  });

  const notes = res.data.sheets?.[0]?.data?.[0]?.rowData?.map(row =>
    row.values?.[0]?.note || null
  ) ?? [];

  return notes.length > 0 ? notes[0] : "";
}

export async function setNotes(row, value) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const sheetId = 0;  

  const rowIndex = row; 
  const colIndex = 15; 

  const request = {
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          updateCells: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rows: [
              {
                values: [
                  {
                    note: value,
                  },
                ],
              },
            ],
            fields: "note",
          },
        },
      ],
    },
  };

  try {
    await sheets.spreadsheets.batchUpdate(request);
    console.log("✅ Updated Row " + row);
  } catch (err) {
    console.error("❌ Error adding note to cell " + row + ": ", err.message);
  }
}
import { BACKEND_URL } from "../config";

export async function fetchInventory() {
  const res = await fetch(`${BACKEND_URL}/google/inventory`);
  return res.json();
}

export async function updateRow(rowIndex: any, rowData: any) {
  const res = await fetch(`${BACKEND_URL}/google/update-row`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rowIndex, rowData }),
  });
  return res.json();
}

export async function updateCell(row: number, column: number, value: any) {
  const res = await fetch(`${BACKEND_URL}/google/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row, column, value }),
  });
  return res.json();
}

export async function setNotes(row: number, value: any) {
  const res = await fetch(`${BACKEND_URL}/google/set-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row, value }),
  });
  return res.json();
}

export async function getNotes(row: number) {
  const res = await fetch(`${BACKEND_URL}/google/get-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  });
  return res.json();
}

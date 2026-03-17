const path = require("path");
const XLSX = require("xlsx");

const ALLOWED_EXTENSIONS = new Set([".csv", ".xlsx"]);

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeRow(rawRow) {
  const row = {};

  Object.keys(rawRow || {}).forEach((key) => {
    row[normalizeHeader(key)] = normalizeValue(rawRow[key]);
  });

  return row;
}

function parseTabularFile(file) {
  if (!file || !file.buffer) {
    throw new Error("Upload file is required");
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error("Invalid file format. Only .csv and .xlsx are supported");
  }

  let workbook;
  try {
    workbook = XLSX.read(file.buffer, { type: "buffer", raw: false, cellDates: true });
  } catch (_error) {
    throw new Error("Unable to read the uploaded file");
  }

  const [firstSheetName] = workbook.SheetNames || [];
  if (!firstSheetName) {
    throw new Error("Uploaded file is empty");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

  return rawRows
    .map((rawRow, index) => ({
      rowNumber: index + 2,
      values: normalizeRow(rawRow),
    }))
    .filter(({ values }) => Object.values(values).some((value) => value !== ""));
}

module.exports = {
  parseTabularFile,
};

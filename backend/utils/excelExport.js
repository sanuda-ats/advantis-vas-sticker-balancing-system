import ExcelJS from "exceljs";

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E6F5" } };

const buildProductivityWorkbook = (rows, { date, location, stickerLabel }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productivity");

  const titleRow = sheet.addRow(["VAS Productivity Report"]);
  titleRow.font = { bold: true, size: 14 };
  sheet.mergeCells(`A${titleRow.number}:C${titleRow.number}`);

  const locationRow = sheet.addRow([`Location: ${location || "All Locations"}`]);
  locationRow.font = { bold: true };
  sheet.mergeCells(`A${locationRow.number}:C${locationRow.number}`);

  const dateRow = sheet.addRow([`Date: ${date || "All Dates"}`]);
  dateRow.font = { bold: true };
  sheet.mergeCells(`A${dateRow.number}:C${dateRow.number}`);

  const stickerRow = sheet.addRow([`Sticker Type: ${stickerLabel || "All Stickers"}`]);
  stickerRow.font = { bold: true };
  sheet.mergeCells(`A${stickerRow.number}:C${stickerRow.number}`);

  sheet.addRow([]); // spacer

  const headerRow = sheet.addRow(["Table No", "Sticker Type", "Quantity"]);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
  });

  rows.forEach((r) => sheet.addRow([r.tableNo, r.stickerName, r.quantity]));

  const total = rows.reduce((sum, r) => sum + r.quantity, 0);
  const totalRow = sheet.addRow(["", "Grand Total", total]);
  totalRow.font = { bold: true };

  sheet.columns = [{ width: 16 }, { width: 32 }, { width: 14 }];

  return workbook;
};

/**
 * Streams the productivity report as an .xlsx attachment directly to the
 * response — used by GET /api/productivity/export (Section 7.6).
 * `rows` are the Table No / Sticker Type / Quantity breakdown rows.
 */
export const streamProductivityExcel = async (res, rows, { date, location, stickerLabel } = {}) => {
  const workbook = buildProductivityWorkbook(rows, { date, location, stickerLabel });

  const filenameParts = ["productivity", date, location, stickerLabel].filter(Boolean);
  const filename = `${filenameParts.join("-").replace(/\s+/g, "_")}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
};
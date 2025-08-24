import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { db } from "../connection/connect.js";
import { google } from "googleapis";
import axios from "axios";
import {
  formatDateToMySQL,
  formatSQLDate,
  generateSerial,
} from "../functions/data.js";
dotenv.config();

export const getProducts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.json(null);

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json("Token is invalid!");
    const q = "SELECT * FROM products";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json({ products: data });
    });
  });
};

export const updateProducts = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Access token missing");

  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) return res.status(403).json("Token is invalid!");

    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json("Expected 'products' to be an array");
    }

    if (products.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No products to update" });
    }

    try {
      await updateProductsDB(products);
      return res.status(200).json({
        success: true,
        message: "Products inserted or updated successfully",
      });
    } catch (error) {
      console.error("Error updating products:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating products",
      });
    }
  });
};

export const updateProductsDB = (products) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT serial_number, ordinal FROM products`, (err, rows) => {
      if (err) {
        console.error("Error fetching existing products:", err);
        return reject(err);
      }
      const nextOrdinal =
        rows.length > 0 ? Math.max(...rows.map((r) => r.ordinal ?? 0)) + 1 : 0;

      const q = `
        INSERT INTO products (
          serial_number, name, highlight, description, note, make, model, price, type, date_sold,
          repair_status, sale_status, length, width, images, ordinal
        )
        VALUES ${products
          .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .join(", ")}
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          highlight = VALUES(highlight),
          description = VALUES(description),
          note = VALUES(note),
          make = VALUES(make),
          model = VALUES(model),
          price = VALUES(price),
          type = VALUES(type),
          date_sold = VALUES(date_sold),
          repair_status = VALUES(repair_status),
          sale_status = VALUES(sale_status),
          length = VALUES(length),
          width = VALUES(width),
          images = VALUES(images),
          ordinal = VALUES(ordinal)
      `;

      const values = products.flatMap((p) => [
        p.serial_number === null ||
        p.serial_number === undefined ||
        p.serial_number.length < 14
          ? generateSerial(p.length, p.width, p.make, rows.length)
          : p.serial_number,
        p.name,
        p.highlight ?? null,
        p.description,
        p.note ?? "",
        p.make,
        p.model,
        p.price,
        p.type ?? "TSA",
        p.date_sold ? formatDateToMySQL(p.date_sold) : null,
        p.repair_status,
        p.sale_status,
        p.length,
        p.width,
        JSON.stringify(Array.isArray(p.images) ? p.images : []),
        typeof p.ordinal === "number" ? p.ordinal : nextOrdinal,
      ]);

      db.query(q, values, (err, result) => {
        if (err) {
          console.error("DB error inserting/updating products:", err);
          return reject(err);
        }
        resolve(result);
      });
    });
  });
};

export const deleteProducts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Access token missing");

  const { serial_numbers } = req.body;

  if (!serial_numbers || serial_numbers.length === 0) {
    return res.status(400).json("Missing serial numbers");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json("Token is invalid!");

    db.getConnection((err, connection) => {
      if (err) {
        console.error("Connection error:", err);
        return res.status(500).json("Connection failed");
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return res.status(500).json("Failed to start transaction");
        }

        const deleteQuery = `DELETE FROM products WHERE serial_number IN (${serial_numbers
          .map(() => "?")
          .join(",")})`;
        connection.query(deleteQuery, serial_numbers, (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              res.status(500).json("Delete failed");
            });
          }
          if (result.affectedRows === 0) {
            return connection.rollback(() => {
              connection.release();
              res.status(200).json("No products were deleted");
            });
          }

          connection.query(`SET @rownum := -1`, (err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                res.status(500).json("Failed to reset rownum");
              });
            }

            const reindexQuery = `
              UPDATE products
              JOIN (
                SELECT serial_number, (@rownum := @rownum + 1) AS new_ordinal
                FROM products
                ORDER BY ordinal
              ) AS ordered ON products.serial_number = ordered.serial_number
              SET products.ordinal = ordered.new_ordinal
            `;

            connection.query(reindexQuery, (err, result2) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json("Reindex failed");
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json("Commit failed");
                  });
                }

                connection.release();
                return res.status(200).json({
                  success: true,
                  deleted: serial_numbers.length,
                  reindexed: result2.affectedRows,
                });
              });
            });
          });
        });
      });
    });
  });
};

export const syncToGoogleSheets = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("No token.");

  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) return res.status(403).json("Invalid token");

    db.query("SELECT * FROM products", async (err, data) => {
      if (err) return res.status(500).json(err);

      const spreadsheetId = "1eqbNGSklj9kRzh7jcRG9PtNKURURjy_V8sc3Kz5WJSo";
      const sheetName = "Inventory";

      try {
        const sortedData = data.sort(
          (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0)
        );

        const rows = sortedData.map((row, index) => {
          return [
            index + 1,
            row.serial_number,
            row.name,
            row.description || "",
            row.note || "",
            row.make || "",
            row.model || "",
            row.price || "",
            row.type || "",
            formatSQLDate(row.date_entered),
            formatSQLDate(row.date_sold),
            row.repair_status,
            row.sale_status,
            row.length || "",
            row.width || "",
            Array.isArray(row.images)
              ? row.images.join(" ")
              : typeof row.images === "string"
              ? JSON.parse(row.images || "[]").join(" ")
              : "",
          ];
        });

        const header = [
          "ID",
          "Serial Number",
          "Name",
          "Description",
          "Note",
          "Make",
          "Model",
          "Price ($)",
          "Type",
          "Date Entered",
          "Date Sold",
          "Repair Status",
          "Sale Status",
          "Length (in)",
          "Width (in)",
          "Images",
        ];

        const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        const parsed = JSON.parse(raw);
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

        const auth = new google.auth.GoogleAuth({
          credentials: parsed,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `${sheetName}!A1:Z`,
        });

        // Overwrite with new data
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:Z`,
          valueInputOption: "RAW",
          requestBody: {
            values: [header, ...rows],
          },
        });

        // Format header and data rows
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      horizontalAlignment: "CENTER",
                      wrapStrategy: "CLIP",
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9,
                      },
                      padding: {
                        top: 10,
                        bottom: 10,
                      },
                    },
                  },
                  fields:
                    "userEnteredFormat(textFormat,horizontalAlignment,wrapStrategy,backgroundColor,padding)",
                },
              },
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: { bold: false },
                      horizontalAlignment: "LEFT",
                      wrapStrategy: "CLIP",
                    },
                  },
                  fields:
                    "userEnteredFormat(textFormat,horizontalAlignment,wrapStrategy)",
                },
              },
              {
                updateDimensionProperties: {
                  range: {
                    sheetId: 0,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 1,
                  },
                  properties: {
                    pixelSize: 50,
                  },
                  fields: "pixelSize",
                },
              },
              {
                updateDimensionProperties: {
                  range: {
                    sheetId: 0,
                    dimension: "COLUMNS",
                    startIndex: 1,
                    endIndex: 5,
                  },
                  properties: {
                    pixelSize: 130,
                  },
                  fields: "pixelSize",
                },
              },
            ],
          },
        });

        return res.json({ success: true });
      } catch (e) {
        console.error(e);
        return res.status(500).json("Google Sheets sync failed.");
      }
    });
  });
};

export const syncToWix = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Unauthorized");
  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) return res.status(403).json("Token is invalid!");
    const q = "SELECT * FROM products";
    db.query(q, async (err, data) => {
      if (err) return res.status(500).json(err);
      const sortedData = data
        .sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0))
        .reverse();
      const corrected_data = sortedData.map((item) => ({
        serialNumber: item.serial_number,
        sold: !!item.date_sold,
        name: item.name,
        description_fld: item.description || "",
        make: item.make || "",
        model: item.model || "",
        price: parseFloat(item.price) || 0,
        length: parseFloat(item.length) || 0,
        width: parseFloat(item.width) || 0,
        images:
          item.images?.filter((url) => !/\.(mp4|mov)$/i.test(url)).join(" ") ||
          "",
      }));

      try {
        await axios.post(
          "https://tannyspaacquisitions.com/_functions/addHotTub",
          corrected_data,
          {
            headers: {
              Authorization: `Bearer ${process.env.WIX_GENERATED_SECRET}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
            validateStatus: (status) => status < 500,
          }
        );
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error(
          "Failed to sync with Wix:",
          err.response?.data || err.message
        );
        return res.status(500).json("Wix sync failed.");
      }
    });
  });
};

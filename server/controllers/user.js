import jwt from "jsonwebtoken";
import { db } from "../connection/connect.js";
import dotenv from "dotenv";
dotenv.config();

export const getCurrentUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.json(null);

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is invalid!");

    const q = "SELECT * FROM users WHERE user_id = ?";

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.json(null);
      const {
        password,
        password_reset,
        password_reset_timestamp,
        ...user
      } = data[0];
      return res.json(user);
    });
  });
};

export const updateCurrentUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json("No updates provided");
    }
    const updates = Object.entries(req.body)
      .map(([key, _]) => `\`${key}\` = ?`)
      .join(", ");

    const values = [...Object.values(req.body), userInfo.id];

    const q = `UPDATE users SET ${updates} WHERE user_id = ?`;

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) {
        return res.json({
          message: "User updated successfully",
          updates: req.body,
        });
      }
      return res.status(400).json("No changes made.");
    });
  });
};
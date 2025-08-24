import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { db } from "../connection/connect.js";
import { generateId } from "../functions/data.js";
import dotenv from "dotenv";
import { getSheetSharedEmails } from "../functions/google.js";
import admin from "../connection/firebaseAdmin.js";
dotenv.config();

const checkUserIdUnique = (userId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, data) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve(data.length === 0);
    });
  });
};

const createUniqueUserId = async () => {
  let userId;
  let isUnique = false;
  try {
    while (!isUnique) {
      userId = generateId(15);
      isUnique = await checkUserIdUnique(userId);
    }
    return userId;
  } catch (error) {
    console.error("Error creating unique user ID:", error);
    return res.status(500).json("Error creating unique user ID");
  }
};

const getValidEmails = async () => {
  return new Promise((resolve) => {
    const q = "SELECT email FROM authorized_users";
    db.query(q, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return resolve([]);
      }
      const emails = results.map((row) => row.email);
      resolve(emails);
    });
  });
};

// Google sign in
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error("Invalid Google ID token:", error);
    return res.status(403).json({ message: "Invalid or expired Google token" });
  }

  const { email, name = "", picture = "", uid } = decodedToken;

  const validEmails = await getValidEmails();
  if (!validEmails.includes(email)) {
    return res.status(403).json({
      message: "Unauthorized gmail, please ask host for permission",
    });
  }

  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [email], (err, data) => {
    if (err) {
      console.error("Google auth error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    let [first_name, ...rest] = name.split(" ");
    let last_name = rest.join(" ") || null;

    if (data.length) {
      // If user exists, generate token and log them in
      const token = jwt.sign({ id: data[0].user_id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      // return res.status(200).json({ accessToken: token });
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return res.status(200).json({ message: "Google login successful" });
    }

    createUniqueUserId()
      .then((newUserId) => {
        const insertQuery =
          "INSERT INTO users (`user_id`,`email`,`first_name`,`last_name`,`profile_img_src`,`auth_provider`) VALUE (?)";
        const values = [
          newUserId,
          email,
          first_name,
          last_name,
          picture,
          "google",
        ];

        db.query(insertQuery, [values], (err, result) => {
          if (err) {
            console.error("Google auth error:", err);
            return res
              .status(500)
              .json({ message: "Error inserting new user", error: err });
          }
          const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          return res
            .status(200)
            .json({ message: "Google registration successful" });
        });
      })
      .catch((error) => {
        console.error("Google auth error:", error);
        return res.status(500).json(error);
      });
  });
};

export const register = async (req, res) => {
  const validEmails = await getValidEmails();
  if (!validEmails.includes(req.body.email)) {
    return res.status(403).json({
      message: "Unauthorized gmail, please ask host for permission",
    });
  }

  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) {
      console.error("Registration error:", err);
      return res.status(500).json(err);
    }
    if (data.length)
      return res.status(409).json({ error: "User already exists!" });

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    createUniqueUserId()
      .then((newUserId) => {
        const q1 =
          "INSERT INTO users (`user_id`,`email`,`password`,`first_name`,`last_name`,`profile_img_src`) VALUE (?)";
        const values1 = [
          newUserId,
          req.body.email,
          hashedPassword,
          req.body.first_name,
          req.body.last_name,
          req.body.profile_img_src,
        ];

        db.query(q1, [values1], (err, data) => {
          if (err) {
            console.error("Registration error:", err);
            return res.status(500).json(err);
          }
          const token = jwt.sign({ id: newUserId }, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          res.cookie("accessToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
          return res.status(200).json({ message: "Registration successful" });
        });
      })
      .catch((error) => {
        console.error("Google auth error:", error);
        return res.status(500).json(error);
      });
  });
};

// Login Function
export const login = async (req, res) => {
  const { email } = req.body;
  const validEmails = await getValidEmails();
  if (!validEmails.includes(email)) {
    return res.status(403).json({
      message: "Unauthorized gmail, please ask host for permission",
    });
  }

  // const permission = 

  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [email], (err, data) => {
    // If there is an error
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json(err);
    }

    // If the data array returned was empty, nothing was found
    if (data.length === 0) {
      return res.status(404).json("User not found!");
    }

    // Otherwise, assume user was found and array with one item was returned
    // Ensure non google user (password would be null)
    if (data[0].auth_provider === "google") {
      return res.status(403).json({ message: "Please log in using Google" });
    }
    if (data[0].auth_provider === "facebook") {
      return res.status(403).json({ message: "Please log in using Facebook" });
    }
    if (data[0].auth_provider === "discord") {
      return res.status(403).json({ message: "Please log in using Discord" });
    }

    // Decrypt password
    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    // If user entered the wrong password for given username
    if (!checkPassword) {
      return res.status(400).json("Wrong password or username!");
    }

    // Otherwise, login was successful
    // Establish a secret key for the user
    const token = jwt.sign({ id: data[0].user_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.status(200).json({ message: "Login successful" });
  });
};

export const logout = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  return res.status(200).json({ message: "Logout successful" });
};

export const sendCode = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_ORIGIN,
      pass: process.env.NODE_MAILER_PASSKEY,
    },
  });
  const { email } = req.body;
  const resetCode = Math.floor(100000 + Math.random() * 900000);

  // Ensure email is in database already
  try {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [req.body.email], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length === 0) {
        return res.status(404).json("User not found!");
      }
      if (data[0].auth_provider !== "local") {
        return res
          .status(403)
          .json({ success: false, message: data[0].auth_provider });
      }

      const currentTime = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const q2 =
        "UPDATE users SET `password_reset`=?,`password_reset_timestamp`=? WHERE user_id=?";
      db.query(
        q2,
        [resetCode, currentTime, data[0].user_id],
        async (err, data) => {
          if (err) return res.status(500).json(err);
          if (data.affectedRows > 0) {
            try {
              await transporter.sendMail({
                from: process.env.NODE_MAILER_ORIGIN,
                to: email,
                subject: "Password Reset Code",
                text: `Your password reset code is: ${resetCode}`,
              });
              return res
                .status(200)
                .json({ success: true, message: "Email sent successfully." });
            } catch (err) {
              return res
                .status(500)
                .json({ success: false, message: "Error sending email." });
            }
          } else {
            return res
              .status(500)
              .json({ success: false, message: "Error updating database" });
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error searching for user" });
  }
};

export const checkCode = async (req, res) => {
  const { code, email } = req.body;
  try {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length === 0) {
        return res.status(404).json("User not found!");
      }
      if (data[0].auth_provider !== "local") {
        return res
          .status(403)
          .json({ success: false, message: data[0].auth_provider });
      }

      function isWithinOneHour(currentTime, oldTime) {
        const currentDate = new Date(currentTime);
        const oldDate = new Date(oldTime);
        const timeDifference = (currentDate - oldDate) / (1000 * 60);
        return timeDifference > 0 && timeDifference < 60;
      }

      const currentTime = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      if (data[0].password_reset === code) {
        if (
          data[0].password_reset_timestamp !== null &&
          isWithinOneHour(currentTime, data[0].password_reset_timestamp)
        ) {
          // Establish a secret key for the user
          const token = jwt.sign(
            { id: data[0].user_id },
            process.env.JWT_SECRET,
            {
              expiresIn: "7d",
            }
          );
          return res.status(200).json({
            success: true,
            accessToken: token,
            message: "Reset code matched and is not expired",
          });
        } else {
          return res.status(403).json({
            success: false,
            message:
              "Reset code is more than 1 hour old and has expired, please try again",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Invalid reset code, please try again",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error searching for user" });
  }
};

export const passwordReset = async (req, res) => {
  const { email, password, accessToken } = req.body;
  if (!accessToken) return res.status(401).json("Not authenticated!");

  try {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (data.length === 0) {
        return res.status(404).json("User not found!");
      }
      if (data[0].auth_provider !== "local") {
        return res
          .status(403)
          .json({ success: false, message: data[0].auth_provider });
      }

      jwt.verify(accessToken, process.env.JWT_SECRET, (err) => {
        if (err) return res.status(403).json("Token is not valid!");
        const q = "UPDATE users SET `password`=? WHERE user_id=?";

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        db.query(q, [hashedPassword, data[0].user_id], (err, data) => {
          if (err) return res.status(500).json(err);
          if (data.affectedRows > 0) {
            return res.json({
              success: true,
              message: "User password updated",
            });
          } else {
            return res.status(500).json({
              success: false,
              message: "Error updating user password",
            });
          }
        });
      });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error updating user password" });
  }
};

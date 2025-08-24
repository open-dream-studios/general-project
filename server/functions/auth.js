import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// GENERATE A JWT_SECRET
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
export const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

import express from "express";
import {
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/user.js";

const router = express.Router();

router.get("/current", getCurrentUser);
router.put("/update-current", updateCurrentUser);

export default router;

import express from "express";
import {
  getProducts,
  updateProducts,
  deleteProducts,
  syncToGoogleSheets,
  syncToWix
} from "../controllers/products.js";

const router = express.Router();

router.get("/get", getProducts);
router.post("/update", updateProducts);
router.delete("/delete", deleteProducts);
router.post("/google-sync", syncToGoogleSheets);
router.post("/wix-sync", syncToWix);

export default router;

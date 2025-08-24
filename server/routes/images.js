import express from "express";
import upload from "../services/middleware.js";
import { compressImages } from "../controllers/images.js";

const router = express.Router();

router.post("/compress", upload.array("files"), compressImages);

export default router;
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import cloudinary from "../services/cloudinary.js";

export const compressImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }
  const filePaths = req.files.map((file) => file.path);
  const uploadedUrls = await compressAndUploadFiles(filePaths);
  if (uploadedUrls) {
    return res.status(200).json({ urls: uploadedUrls });
  } else {
    return res.status(500).json({ urls: [] });
  }
};

export const compressAndUploadFiles = async (filePaths) => {
  try {
    const uploadUrls = [];
    for (const originalPath of filePaths) {
      const ext = path.extname(originalPath).toLowerCase();
      let fileToUpload = originalPath;
      let resourceType = "image";
      if (ext === ".webp") {
        resourceType = "image";
      } else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
        const baseName = path.basename(originalPath, ext);
        const compressedPath = path.join(
          path.dirname(originalPath),
          `${baseName}-compressed.webp`
        );
        await sharp(originalPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 90 })
          .toFile(compressedPath);

        await fs.unlink(originalPath);
        fileToUpload = compressedPath;
      } else if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) {
        resourceType = "video";
      } else {
        console.warn(`Skipping unsupported file type: ${originalPath}`);
        continue;
      }

      function uploadLargeAsync(filePath, options) {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(
            filePath,
            options,
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });
      }

      if (resourceType === "video") {
        const result = await uploadLargeAsync(fileToUpload, {
          folder: "tsa",
          resource_type: "video",
          chunk_size: 6000000, // 6 MB chunks
        });
        uploadUrls.push(result.secure_url);
      } else {
        const result = await cloudinary.uploader.upload(fileToUpload, {
          folder: "tsa",
          resource_type: resourceType,
        });
        uploadUrls.push(result.secure_url);
      }
      if (fileToUpload !== originalPath) {
        await fs.unlink(fileToUpload);
      }
    }
    return uploadUrls;
  } catch (error) {
    console.error("File upload error:", error);
    return false;
  }
};

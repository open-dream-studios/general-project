import admin from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export default admin;
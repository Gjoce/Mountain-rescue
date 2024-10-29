const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const { verifyFirebaseToken } = require("./login");

const verifyAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

router.post("/register", verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const { email, password, name, isAdmin } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required." });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set(
        {
          name,
          email,
          uid: userRecord.uid,
          role: isAdmin ? "admin" : "rescuer",
        },
        { merge: true }
      );

    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: isAdmin });

    res
      .status(201)
      .json({
        message: "Rescuer registered successfully",
        uid: userRecord.uid,
      });
  } catch (error) {
    console.error("Error registering rescuer:", error);
    res
      .status(500)
      .json({ message: "Error registering rescuer", error: error.message });
  }
});

module.exports = router;

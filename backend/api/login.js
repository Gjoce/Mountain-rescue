const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    req.user.isAdmin = decodedToken.admin || false;

    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

router.post("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;

    const customToken = await admin.auth().createCustomToken(user.uid);

    res.json({
      token: customToken,
      isAdmin: user.isAdmin,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in login endpoint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  router,
  verifyFirebaseToken,
};

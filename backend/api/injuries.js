const express = require("express");
const router = express.Router();
const injuriesController = require("../controllers/injuriesController");
const { verifyFirebaseToken } = require("./login");

router.use(verifyFirebaseToken);

const verifyAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

router.get("/admin", verifyAdmin, injuriesController.getAllInjuries);

router.post("/", injuriesController.insertInjury);

router.get("/:uid", injuriesController.getInjuriesByRescuer);

router.post("/:id/approve", verifyAdmin, injuriesController.approveInjury);

router.post("/:id/reject", verifyAdmin, injuriesController.rejectInjury);

module.exports = router;

const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");
const {
  updateStatus,
  assignIssue,
} = require("../controllers/admin.controller");

router.put(
  "/issues/:id/status",
  protect,
  checkRole("admin"),
  updateStatus
);

router.put(
  "/issues/:id/assign",
  protect,
  checkRole("admin"),
  assignIssue
);

module.exports = router;

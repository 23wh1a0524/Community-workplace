const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const {
  createIssue,
  getIssues,
  voteIssue,
} = require("../controllers/issue.controller");

router.post("/", protect, createIssue);
router.get("/", protect, getIssues);
router.post("/:id/vote", protect, voteIssue);

module.exports = router;

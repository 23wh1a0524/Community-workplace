const Issue = require("../models/Issue");

exports.updateStatus = async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue)
    return res.status(404).json({
      success: false,
      message: "Issue not found",
      code: "NOT_FOUND",
    });

  issue.status = req.body.status;

  if (req.body.status === "resolved") {
    issue.resolvedAt = new Date();
  }

  await issue.save();

  res.json({ success: true, message: "Status updated" });
};

exports.assignIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  issue.assignedTo = req.user._id;
  await issue.save();

  res.json({ success: true, message: "Assigned to admin" });
};

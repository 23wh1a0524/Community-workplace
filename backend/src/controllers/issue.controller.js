const Issue = require("../models/Issue");

exports.createIssue = async (req, res) => {
  const issue = await Issue.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, issue });
};

exports.getIssues = async (req, res) => {
  const issues = await Issue.find().populate("createdBy", "name");

  res.json({ success: true, issues });
};

exports.voteIssue = async (req, res) => {
  const issue = await Issue.findById(req.params.id);

  if (!issue)
    return res.status(404).json({
      success: false,
      message: "Issue not found",
      code: "NOT_FOUND",
    });

  if (issue.voters.includes(req.user._id))
    return res.status(400).json({
      success: false,
      message: "Already voted",
      code: "ALREADY_VOTED",
    });

  issue.votes += 1;
  issue.voters.push(req.user._id);

  await issue.save();

  res.json({ success: true, message: "Vote added" });
};

const Issue = require('../models/issue.model');

// @desc  Create new issue
// @route POST /api/v1/issues
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description and category are required', code: 'MISSING_FIELDS' });
    }

    // Handle file attachments
    const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const issue = await Issue.create({
      title,
      description,
      category,
      createdBy: req.user._id,
      attachments,
    });

    await issue.populate('createdBy', 'name email role block unit');

    res.status(201).json({ success: true, message: 'Issue created successfully', data: { issue } });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all issues (with filters)
// @route GET /api/v1/issues
const getIssues = async (req, res, next) => {
  try {
    const { status, category, sort = '-votes', page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name role block')
        .populate('assignedTo', 'name role'),
      Issue.countDocuments(query),
    ]);

    // Mark which issues the current user has voted on
    const issuesWithVoted = issues.map(issue => ({
      ...issue.toObject(),
      hasVoted: issue.voters.includes(req.user._id.toString()),
    }));

    res.json({
      success: true,
      data: {
        issues: issuesWithVoted,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single issue
// @route GET /api/v1/issues/:id
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email role block unit')
      .populate('assignedTo', 'name email role');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });
    }

    res.json({
      success: true,
      data: {
        issue: { ...issue.toObject(), hasVoted: issue.voters.includes(req.user._id.toString()) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Update issue (admin only - status changes)
// @route PUT /api/v1/issues/:id
const updateIssue = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });
    }

    // Residents can only update their own issues (title/desc/category) when still open
    if (req.user.role === 'resident') {
      if (issue.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this issue', code: 'FORBIDDEN' });
      }
      if (issue.status !== 'open') {
        return res.status(400).json({ success: false, message: 'Cannot edit issue once it is in progress', code: 'ISSUE_LOCKED' });
      }
      const { title, description, category } = req.body;
      if (title) issue.title = title;
      if (description) issue.description = description;
      if (category) issue.category = category;
    }

    // Admins can update status and assignment
    if (req.user.role === 'admin') {
      if (status) {
        issue.status = status;
        if (status === 'resolved') issue.resolvedAt = new Date();
        else issue.resolvedAt = null;
      }
      if (assignedTo !== undefined) issue.assignedTo = assignedTo || null;
    }

    await issue.save();
    await issue.populate('createdBy', 'name email role block');
    await issue.populate('assignedTo', 'name role');

    res.json({ success: true, message: 'Issue updated', data: { issue } });
  } catch (error) {
    next(error);
  }
};

// @desc  Vote on issue (resident only, once per issue)
// @route POST /api/v1/issues/:id/vote
const voteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });
    }

    const userId = req.user._id.toString();
    const alreadyVoted = issue.voters.some(v => v.toString() === userId);

    if (alreadyVoted) {
      // Toggle: remove vote
      issue.voters = issue.voters.filter(v => v.toString() !== userId);
      issue.votes = Math.max(0, issue.votes - 1);
    } else {
      // Add vote
      issue.voters.push(req.user._id);
      issue.votes += 1;
    }

    await issue.save();

    res.json({
      success: true,
      message: alreadyVoted ? 'Vote removed' : 'Vote added',
      data: { votes: issue.votes, hasVoted: !alreadyVoted },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete issue (admin or creator)
// @route DELETE /api/v1/issues/:id
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found', code: 'NOT_FOUND' });
    }

    if (req.user.role !== 'admin' && issue.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Get issues created by logged-in user
// @route GET /api/v1/issues/my
const getMyIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ createdBy: req.user._id })
      .sort('-createdAt')
      .populate('assignedTo', 'name role');

    const issuesWithVoted = issues.map(issue => ({
      ...issue.toObject(),
      hasVoted: issue.voters.includes(req.user._id.toString()),
    }));

    res.json({ success: true, data: { issues: issuesWithVoted } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createIssue, getIssues, getIssue, updateIssue, voteIssue, deleteIssue, getMyIssues };
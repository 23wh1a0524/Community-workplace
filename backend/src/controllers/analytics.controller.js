const Issue = require('../models/issue.model');
const User = require('../models/user.model');

// @desc  Get analytics summary (admin only)
// @route GET /api/v1/analytics
const getAnalytics = async (req, res, next) => {
  try {
    // Status counts
    const [open, inProgress, resolved, total] = await Promise.all([
      Issue.countDocuments({ status: 'open' }),
      Issue.countDocuments({ status: 'in_progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments(),
    ]);

    // Category breakdown
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Average resolution time (in days) for resolved issues
    const resolvedIssues = await Issue.find({ status: 'resolved', resolvedAt: { $ne: null } });
    let avgResolutionDays = 0;
    if (resolvedIssues.length > 0) {
      const totalMs = resolvedIssues.reduce((sum, i) => sum + (i.resolvedAt - i.createdAt), 0);
      avgResolutionDays = +(totalMs / resolvedIssues.length / (1000 * 60 * 60 * 24)).toFixed(1);
    }

    // Monthly issues (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyIssues = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recurring issues (same title appearing multiple times - simplified: by category)
    const recurringByTitle = await Issue.aggregate([
      {
        $group: {
          _id: '$title',
          count: { $sum: 1 },
          category: { $first: '$category' },
          lastCreated: { $max: '$createdAt' },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Top voter (user who voted on most issues)
    const topVoter = await Issue.aggregate([
      { $unwind: '$voters' },
      { $group: { _id: '$voters', voteCount: { $sum: 1 } } },
      { $sort: { voteCount: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ]);

    res.json({
      success: true,
      data: {
        summary: { total, open, inProgress, resolved, resolutionRate: total ? +((resolved / total) * 100).toFixed(1) : 0, avgResolutionDays },
        categoryBreakdown,
        monthlyIssues,
        recurringIssues: recurringByTitle,
        topVoter: topVoter[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
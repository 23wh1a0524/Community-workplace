const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  voteIssue,
  deleteIssue,
  getMyIssues,
} = require('../controllers/issue.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/my', protect, getMyIssues);
router.post('/', protect, upload.array('attachments', 5), createIssue);
router.get('/', protect, getIssues);
router.get('/:id', protect, getIssue);
router.put('/:id', protect, updateIssue);
router.post('/:id/vote', protect, voteIssue);
router.delete('/:id', protect, deleteIssue);

module.exports = router;
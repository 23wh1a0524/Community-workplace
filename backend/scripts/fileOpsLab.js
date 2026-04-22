// backend/scripts/fileOpsLab.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'community_log.txt');
const renamedPath = path.join(__dirname, 'community_log_renamed.txt');

// Write
fs.writeFileSync(filePath, 'CommunityInsight File Operations\n', 'utf8');

// Append
fs.appendFileSync(filePath, '1. Issue logged by Pradeepthi\n', 'utf8');
fs.appendFileSync(filePath, '2. Issue voted by Ravi\n', 'utf8');

// Read
const content = fs.readFileSync(filePath, 'utf8');
console.log('FILE_CONTENT_START');
console.log(content.trim());
console.log('FILE_CONTENT_END');

// Rename
fs.renameSync(filePath, renamedPath);
console.log('RENAMED_OK');

// Delete
fs.unlinkSync(renamedPath);
console.log('DELETE_OK');
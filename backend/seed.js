// Run: node seed.js
// Seeds the database with demo users and issues

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/community-insight';

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: { type: String, default: 'resident' },
  block: String, unit: String, communityId: { type: String, default: 'sunrise-heights' },
}, { timestamps: true });

const issueSchema = new mongoose.Schema({
  title: String, description: String, category: String,
  status: { type: String, default: 'open' },
  attachments: [String], createdBy: mongoose.Schema.Types.ObjectId,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, default: null },
  votes: { type: Number, default: 0 }, voters: [mongoose.Schema.Types.ObjectId],
  resolvedAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);

const USERS = [
  { name: 'Kavya Sharma', email: 'kavya@sunriseheights.in', password: 'admin123', role: 'admin', block: 'Management', unit: 'Office' },
  { name: 'Pradeepthi Reddy', email: 'pradeepthi@sunriseheights.in', password: 'resident123', role: 'resident', block: 'Block B', unit: 'B-204' },
  { name: 'Ravi Kumar', email: 'ravi@sunriseheights.in', password: 'resident123', role: 'resident', block: 'Block C', unit: 'C-101' },
  { name: 'Sanjana Mehta', email: 'sanjana@sunriseheights.in', password: 'resident123', role: 'resident', block: 'Block A', unit: 'A-302' },
  { name: 'Ajay Tiwari', email: 'ajay@sunriseheights.in', password: 'resident123', role: 'resident', block: 'Block B', unit: 'B-105' },
  { name: 'Meena Sharma', email: 'meena@sunriseheights.in', password: 'resident123', role: 'resident', block: 'Block C', unit: 'C-210' },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Issue.deleteMany({});
  console.log('🧹 Cleared existing data');

  // Create users
  const salt = await bcrypt.genSalt(10);
  const createdUsers = await User.insertMany(
    await Promise.all(USERS.map(async u => ({ ...u, password: await bcrypt.hash(u.password, salt) })))
  );
  console.log(`👥 Created ${createdUsers.length} users`);

  const admin = createdUsers.find(u => u.role === 'admin');
  const residents = createdUsers.filter(u => u.role === 'resident');
  const [pradeepthi, ravi, sanjana, ajay, meena] = residents;

  // Create issues
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 86400000);

  const ISSUES = [
    { title: 'Parking area lights not working — Block B', description: '3 of 5 light poles in Block B parking have been non-functional for over a week. Creates safety concerns at night. Residents with small children are especially worried.', category: 'maintenance', status: 'open', votes: 22, voters: residents.map(r => r._id), createdBy: pradeepthi._id, createdAt: daysAgo(2) },
    { title: 'Main gate CCTV camera angle off', description: 'The CCTV near the main entrance has shifted and no longer covers the gate effectively. Needs recalibration by the security team.', category: 'security', status: 'open', votes: 18, voters: [pradeepthi._id, sanjana._id, ajay._id, meena._id], createdBy: ravi._id, createdAt: daysAgo(3) },
    { title: 'Gym air conditioning not working', description: 'AC unit in the gym has been malfunctioning since Monday. Temperature becomes uncomfortable after 15 minutes of use. Multiple residents have complained.', category: 'amenities', status: 'in_progress', votes: 15, voters: [pradeepthi._id, ravi._id, ajay._id], createdBy: sanjana._id, assignedTo: admin._id, createdAt: daysAgo(4) },
    { title: "Children's play area swing broken", description: "The main swing in the children's play area has a broken chain. It's a safety hazard for kids. Needs immediate repair or temporary cordoning off.", category: 'amenities', status: 'open', votes: 12, voters: [pradeepthi._id, ravi._id, sanjana._id], createdBy: pradeepthi._id, createdAt: daysAgo(5) },
    { title: 'Stairwell light replacement — Tower 2', description: 'Lights on floors 4 and 5 of Tower 2 stairwell are out. Residents using stairs at night are at risk of accidents.', category: 'maintenance', status: 'open', votes: 10, voters: [ravi._id, ajay._id], createdBy: ajay._id, createdAt: daysAgo(6) },
    { title: 'Garbage collection delay — Block C', description: 'Block C garbage has not been collected in 3 days. Serious odor and hygiene concern near Block C entrance.', category: 'sanitation', status: 'in_progress', votes: 8, voters: [pradeepthi._id, sanjana._id], createdBy: meena._id, assignedTo: admin._id, createdAt: daysAgo(7) },
    { title: 'Water pump pressure drop', description: 'Water pressure on upper floors (4+) has dropped significantly. Showers and taps are affected. Residents on floors 4-6 are most impacted.', category: 'maintenance', status: 'open', votes: 7, voters: [ravi._id, sanjana._id], createdBy: pradeepthi._id, createdAt: daysAgo(7) },
    { title: 'Pool chemicals imbalance', description: 'Pool pH was reported off by 2 residents. Eyes and skin irritation reported after swimming. Has been corrected as of yesterday.', category: 'amenities', status: 'resolved', votes: 5, voters: [pradeepthi._id], createdBy: admin._id, assignedTo: admin._id, resolvedAt: daysAgo(1), createdAt: daysAgo(14) },
    { title: 'Broken Gate Latch — Block C', description: 'The side gate latch near Block C has been broken for 5 days. Anyone can enter without authentication. Security risk.', category: 'security', status: 'resolved', votes: 14, voters: residents.map(r => r._id), createdBy: ravi._id, assignedTo: admin._id, resolvedAt: daysAgo(2), createdAt: daysAgo(9) },
    { title: 'Water Pump Failure', description: 'Water pump on the east side stopped working completely. No water supply in Tower 1 for 6 hours.', category: 'maintenance', status: 'resolved', votes: 20, voters: residents.map(r => r._id), createdBy: sanjana._id, assignedTo: admin._id, resolvedAt: daysAgo(14), createdAt: daysAgo(18) },
    { title: 'Water Pump Failure', description: 'Water pump issue recurring. Tower 2 affected this time. Pump needs full replacement rather than repair.', category: 'maintenance', status: 'resolved', votes: 16, voters: [pradeepthi._id, ravi._id, ajay._id], createdBy: ajay._id, assignedTo: admin._id, resolvedAt: daysAgo(30), createdAt: daysAgo(35) },
  ];

  await Issue.insertMany(ISSUES);
  console.log(`📋 Created ${ISSUES.length} issues`);

  console.log('\n✅ Seed complete!\n');
  console.log('📧 Demo Accounts:');
  console.log('   Admin  → kavya@sunriseheights.in     / admin123');
  console.log('   Resident → pradeepthi@sunriseheights.in / resident123\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
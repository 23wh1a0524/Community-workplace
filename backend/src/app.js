require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const issueRoutes = require("./routes/issue.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Community Insight API Running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

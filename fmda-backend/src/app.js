const express = require("express");
const cors = require("cors");

const assetRoutes = require("./routes/assets.routes");
const projectRoutes = require("./routes/projects.routes");
const financeRoutes = require("./routes/finance.routes");
const progressRoutes = require("./routes/progress.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/assets", assetRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/files", require("./routes/files.routes"));

app.get("/", (req, res) => {
  res.send("FMDA GIS Backend Running");
});

module.exports = app;

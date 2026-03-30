require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reports", require("./routes/report.routes"));

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Reports Service running on ${PORT}`);
});
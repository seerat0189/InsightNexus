const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/cost", require("./routes/cost.routes"));

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Cost Intelligence Service running on ${PORT}`);
});

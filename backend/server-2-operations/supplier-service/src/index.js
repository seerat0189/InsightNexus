const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/supplier", require("./routes/supplier.routes"));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Supplier Service running on ${PORT}`);
});

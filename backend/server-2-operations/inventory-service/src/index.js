const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.use("/api/inventory", require("./routes/inventory.routes"));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Inventory Service running on ${PORT}`);
});
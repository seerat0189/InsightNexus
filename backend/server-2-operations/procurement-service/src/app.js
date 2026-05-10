const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require('dotenv').config();

const procurementRoutes = require("./routes/procurement.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/procurement", procurementRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Procurement DB connected");
});
const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`Procurement Service running on ${PORT}`);
});
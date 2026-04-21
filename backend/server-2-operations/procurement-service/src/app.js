const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const procurementRoutes = require("./src/routes/procurement.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/procurement", procurementRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Procurement DB connected");
});

app.listen(5008, () => {
  console.log("Procurement Service running on 5008");
});
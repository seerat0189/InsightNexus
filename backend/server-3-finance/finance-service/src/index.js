require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/finance", require("./routes/finance.routes"));

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Finance Service running on ${PORT}`);
});
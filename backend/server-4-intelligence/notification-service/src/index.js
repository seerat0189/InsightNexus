const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/notifications", require("./routes/notification.routes"));

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Notification Service running on ${PORT}`);
});

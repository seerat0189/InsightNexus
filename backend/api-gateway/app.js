const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const AUTH = "http://localhost:5000";
const USER = "http://localhost:5001";
const INVENTORY = "http://localhost:5002";
const FINANCE = "http://localhost:5005";
const REPORTS = "http://localhost:5006";

// AUTH SERVICE
app.use("/auth", async (req, res) => {
  try {
    console.log("Gateway hit:", req.method, req.originalUrl);

    const response = await axios({
      method: req.method,
      url: `${AUTH}/api${req.originalUrl}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      timeout: 5000,
    });

    console.log("Gateway received response from auth");

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.log("Gateway error:", err.message);

    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

// USER SERVICE
app.use("/user", async (req, res) => {
  try {
    const path = req.originalUrl.replace("/user", "");

    console.log("User Gateway hit:", req.method, path);

    const response = await axios({
      method: req.method,
      url: `${USER}/api/user${path}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      timeout: 5000,
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.log("User Gateway error:", err.message);

    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

// INVENTORY SERVICE
app.use("/inventory", async (req, res) => {
  try {
    const path = req.originalUrl.replace("/inventory", "");

    console.log("Inventory Gateway hit:", req.method, path);

    const response = await axios({
      method: req.method,
      url: `${INVENTORY}/api/inventory${path}`, // ✅ correct mapping
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      timeout: 5000,
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.log("Inventory Gateway error:", err.message);

    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

// FINANCE SERVICE
app.use("/finance", async (req, res) => {
  try {
    const path = req.originalUrl.replace("/finance", "");

    console.log("Finance Gateway hit:", req.method, path);

    const response = await axios({
      method: req.method,
      url: `${FINANCE}/api/finance${path}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      timeout: 5000,
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.log("Finance Gateway error:", err.message);

    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

// REPORTS SERVICE
app.use("/reports", async (req, res) => {
  try {
    const path = req.originalUrl.replace("/reports", "");

    console.log("Reports Gateway hit:", req.method, path);

    const response = await axios({
      method: req.method,
      url: `${REPORTS}/api/reports${path}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      timeout: 5000,
    });

    return res.status(response.status).json(response.data);

  } catch (err) {
    console.log("Reports Gateway error:", err.message);

    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data || err.message,
    });
  }
});

app.listen(4000, () => {
  console.log("API Gateway running on port 4000");
});
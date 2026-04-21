const reportService = require("../services/report.service");

exports.getDashboard = async (req, res) => {
  try {
    const token = req.headers.authorization;

    const data = await reportService.getDashboard(token);

    return res.status(200).json({
      success: true,
      ...data,
    });

  } catch (err) {
    console.log("Dashboard error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message || "Dashboard failed",
    });
  }
};
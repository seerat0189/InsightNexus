const financeService = require("../services/finance.service");

exports.addTransaction = async (req, res) => {
  try {
    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const transaction = await financeService.addTransaction(data);

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await financeService.getTransactions(
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBurnRate = async (req, res) => {
  try {
    const result = await financeService.getBurnRate(
      req.user.companyId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getRunway = async (req, res) => {
  try {
    const { currentBalance } = req.body;

    const result = await financeService.getRunway(
      req.user.companyId,
      currentBalance
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
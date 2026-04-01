const costService = require("../services/cost.service");

// ──────────────────────────────────────────────
// COST ENTRY CRUD
// ──────────────────────────────────────────────

exports.createCostEntry = async (req, res) => {
  try {
    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const entry = await costService.createCostEntry(data);

    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCostEntries = async (req, res) => {
  try {
    const { product, type } = req.query;

    const entries = await costService.getCostEntries(req.user.companyId, {
      product,
      type,
    });

    res.status(200).json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCostEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    await costService.deleteCostEntry(entryId, req.user.companyId);

    res.status(200).json({ success: true, message: "Cost entry deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ──────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────

exports.getCostDistribution = async (req, res) => {
  try {
    const { product } = req.query;

    const result = await costService.getCostDistribution(req.user.companyId, product);

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductSummary = async (req, res) => {
  try {
    const summary = await costService.getProductSummary(req.user.companyId);

    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

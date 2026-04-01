const CostEntry = require("../models/CostEntry");

// ──────────────────────────────────────────────
// COST ENTRY CRUD
// ──────────────────────────────────────────────

exports.createCostEntry = async (data) => {
  const entry = await CostEntry.create(data);
  return entry;
};

exports.getCostEntries = async (companyId, filters = {}) => {
  const query = { companyId };

  if (filters.product) query.product = filters.product;
  if (filters.type) query.type = filters.type;

  return await CostEntry.find(query).sort({ date: -1 });
};

exports.deleteCostEntry = async (entryId, companyId) => {
  const entry = await CostEntry.findOneAndDelete({ _id: entryId, companyId });
  if (!entry) throw new Error("Cost entry not found");
  return entry;
};

// ──────────────────────────────────────────────
// COST ANALYTICS
// ──────────────────────────────────────────────

/**
 * Returns cost breakdown grouped by type with:
 *   - total amount per category
 *   - percentage contribution of each category
 * Optionally filtered by product name.
 */
exports.getCostDistribution = async (companyId, product = null) => {
  const match = { companyId };
  if (product) match.product = product;

  const groups = await CostEntry.aggregate([
    { $match: { companyId: require("mongoose").Types.ObjectId.createFromHexString(companyId.toString()) } },
    ...(product ? [{ $match: { product } }] : []),
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

  if (grandTotal === 0) {
    return { grandTotal: 0, distribution: [] };
  }

  const distribution = groups.map((g) => ({
    type: g._id,
    total: Math.round(g.total * 100) / 100,
    count: g.count,
    percentage: Math.round((g.total / grandTotal) * 10000) / 100, // 2dp percentage
  }));

  return { grandTotal: Math.round(grandTotal * 100) / 100, distribution };
};

/**
 * Returns total cost per product — useful for comparing production costs
 * across different product lines.
 */
exports.getProductSummary = async (companyId) => {
  const mongoose = require("mongoose");

  const summary = await CostEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId.createFromHexString(companyId.toString()),
      },
    },
    {
      $group: {
        _id: "$product",
        totalCost: { $sum: "$amount" },
        entryCount: { $sum: 1 },
        breakdown: {
          $push: { type: "$type", amount: "$amount" },
        },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);

  return summary.map((s) => ({
    product: s._id,
    totalCost: Math.round(s.totalCost * 100) / 100,
    entryCount: s.entryCount,
  }));
};

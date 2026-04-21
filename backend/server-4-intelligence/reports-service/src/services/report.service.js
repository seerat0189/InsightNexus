const axios = require("axios");

const {
  INVENTORY_SERVICE,
  FINANCE_SERVICE,
} = require("../../../../shared/constants/serviceUrls");

exports.getInventorySummary = async (token) => {
  const res = await axios.get(`${INVENTORY_SERVICE}/api/inventory`, {
    headers: { Authorization: token },
  });

  const items = res.data.items;

  const totalItems = items.length;
  const lowStockItems = items.filter(
    (item) => item.quantity < item.reorderLevel
  ).length;

  return {
    totalItems,
    lowStockItems,
  };
};

exports.getFinanceSummary = async (token) => {
  const res = await axios.get(`${FINANCE_SERVICE}/api/finance`, {
    headers: { Authorization: token },
  });

  const transactions = res.data.transactions;

  let totalExpense = 0;
  let totalRevenue = 0;

  transactions.forEach((t) => {
    if (t.type === "expense") totalExpense += t.amount;
    if (t.type === "revenue") totalRevenue += t.amount;
  });

  return {
    totalExpense,
    totalRevenue,
    profit: totalRevenue - totalExpense,
  };
};

exports.getDashboard = async (token) => {
  try {
    const [inventory, finance] = await Promise.all([
      exports.getInventorySummary(token).catch(() => null),
      exports.getFinanceSummary(token).catch(() => null),
    ]);

    return {
      inventory: inventory || {},
      finance: finance || {},
    };
  } catch (err) {
    throw new Error("Failed to load dashboard");
  }
};
const axios = require("axios");

const INVENTORY = process.env.INVENTORY_SERVICE_URL;
const FINANCE = process.env.FINANCE_SERVICE_URL;

exports.getInventorySummary = async (token) => {
  const res = await axios.get(`${INVENTORY}/api/inventory`, {
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
  const res = await axios.get(`${FINANCE}/api/finance`, {
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
  const [inventory, finance] = await Promise.all([
    exports.getInventorySummary(token),
    exports.getFinanceSummary(token),
  ]);

  return {
    inventory,
    finance,
  };
};
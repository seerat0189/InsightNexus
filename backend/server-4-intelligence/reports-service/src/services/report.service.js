const axios = require("axios");

const {
  INVENTORY_SERVICE,
  FINANCE_SERVICE,
  PROCUREMENT_SERVICE,
  SUPPLIER_SERVICE,
} = require("../../../../shared/constants/serviceUrls");

exports.getInventorySummary = async (token) => {
  const res = await axios.get(`${INVENTORY_SERVICE}/api/inventory`, {
    headers: { Authorization: token },
  });

  const items = res.data.items;

  const totalItems = items.length;
  const lowStockItems = items.filter(
    (item) => item.quantity <= item.reorderLevel
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
    if (t.type === "income" || t.type === "revenue") totalRevenue += t.amount;
  });

  return {
    totalExpense,
    totalRevenue,
    profit: totalRevenue - totalExpense,
    transactions: transactions.slice(0, 100), // For comprehensive trends
  };
};

exports.getProcurementSummary = async (token) => {
  const res = await axios.get(`${PROCUREMENT_SERVICE}/api/procurement`, {
    headers: { Authorization: token },
  });
  const orders = res.data.orders;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== "delivered").length;
  const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return { totalOrders, pendingOrders, totalSpend };
};

exports.getSupplierSummary = async (token) => {
  const res = await axios.get(`${SUPPLIER_SERVICE}/api/supplier`, {
    headers: { Authorization: token },
  });
  const suppliers = res.data.suppliers;
  return { totalSuppliers: suppliers.length };
};

exports.getDashboard = async (token) => {
  try {
    const [inventory, finance, procurement, supplier] = await Promise.all([
      exports.getInventorySummary(token).catch(() => null),
      exports.getFinanceSummary(token).catch(() => null),
      exports.getProcurementSummary(token).catch(() => null),
      exports.getSupplierSummary(token).catch(() => null),
    ]);

    return {
      inventory: inventory || {},
      finance: finance || {},
      procurement: procurement || {},
      supplier: supplier || {},
    };
  } catch (err) {
    throw new Error("Failed to load dashboard");
  }
};
const prisma = require("../config/prisma");

exports.addTransaction = async (data) => {
  return await prisma.transaction.create({
    data,
  });
};

exports.getTransactions = async (companyId) => {
  return await prisma.transaction.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

exports.getBurnRate = async (companyId, days = 30) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const expenses = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      companyId,
      type: "expense",
      createdAt: { gte: fromDate },
    },
  });

  const totalExpense = expenses._sum.amount || 0;
  const burnRate = totalExpense / days;

  return { burnRate, totalExpense, days };
};

exports.getRunway = async (companyId, currentBalance) => {
  const { burnRate } = await exports.getBurnRate(companyId);

  if (burnRate === 0) {
    return { runway: null };
  }

  const runway = currentBalance / burnRate;

  return { runway, burnRate };
};
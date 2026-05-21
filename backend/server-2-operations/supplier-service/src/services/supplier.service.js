const Supplier = require("../models/Supplier");
const SupplierPerformance = require("../models/SupplierPerformance");
const SupplierDelivery = require("../models/SupplierDelivery");

exports.createSupplier = async (data) => {
  const supplier = await Supplier.create(data);
  return supplier;
};

exports.getSuppliers = async (companyId) => {
  return await Supplier.find({ companyId }).sort({ createdAt: -1 });
};

exports.updateSupplier = async (supplierId, companyId, data) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: supplierId, companyId },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!supplier) throw new Error("Supplier not found");
  return supplier;
};

exports.deleteSupplier = async (supplierId, companyId) => {
  const supplier = await Supplier.findOneAndDelete({ _id: supplierId, companyId });
  if (!supplier) throw new Error("Supplier not found");

  await SupplierPerformance.deleteMany({ supplierId, companyId });

  return supplier;
};

const calculateScore = (onTimeDeliveryRate, defectRate, avgDeliveryTime) => {
  const deliveryPoints = onTimeDeliveryRate * 0.5;
  const qualityPoints = (100 - defectRate) * 0.3;
  const speedBonus = Math.max(0, 10 - avgDeliveryTime) * 2;
  const score = deliveryPoints + qualityPoints + speedBonus;
  return Math.min(100, Math.round(score * 10) / 10);
};

exports.upsertPerformance = async (supplierId, companyId, data) => {
  const supplier = await Supplier.findOne({ _id: supplierId, companyId });
  if (!supplier) throw new Error("Supplier not found");

  const { onTimeDeliveryRate, defectRate, avgDeliveryTime } = data;

  const score = calculateScore(onTimeDeliveryRate, defectRate, avgDeliveryTime);

  const performance = await SupplierPerformance.findOneAndUpdate(
    { supplierId, companyId },
    {
      $set: {
        onTimeDeliveryRate,
        defectRate,
        avgDeliveryTime,
        lastUpdated: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return { performance, score };
};

exports.getPerformance = async (supplierId, companyId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, companyId });
  if (!supplier) throw new Error("Supplier not found");

  const performance = await SupplierPerformance.findOne({ supplierId, companyId });
  if (!performance) throw new Error("No performance data found for this supplier");

  const score = calculateScore(
    performance.onTimeDeliveryRate,
    performance.defectRate,
    performance.avgDeliveryTime
  );

  return { supplier, performance, score };
};

exports.getAllPerformance = async (companyId) => {
  const performances = await SupplierPerformance.find({ companyId }).lean();

  const enriched = await Promise.all(
    performances.map(async (perf) => {
      const supplier = await Supplier.findById(perf.supplierId).lean();
      const score = calculateScore(
        perf.onTimeDeliveryRate,
        perf.defectRate,
        perf.avgDeliveryTime
      );
      return {
        ...perf,
        supplierName: supplier ? supplier.name : "Unknown",
        supplierContact: supplier ? supplier.contact : null,
        score,
      };
    })
  );

  return enriched.sort((a, b) => b.score - a.score);
};

exports.getBestSupplier = async (companyId) => {
  const performances = await SupplierPerformance.find({ companyId }).lean();

  if (!performances.length) {
    const fallbackSupplier = await Supplier.findOne({ companyId }).lean();
    if (!fallbackSupplier) {
      throw new Error("No supplier performance data or suppliers found");
    }
    return fallbackSupplier;
  }

  const enriched = await Promise.all(
    performances.map(async (perf) => {
      const supplier = await Supplier.findById(perf.supplierId).lean();

      const score = calculateScore(
        perf.onTimeDeliveryRate,
        perf.defectRate,
        perf.avgDeliveryTime
      );

      return {
        supplier,
        score,
      };
    })
  );

  enriched.sort((a, b) => b.score - a.score);

  return enriched[0].supplier;
};

exports.addDeliveryRecord = async (supplierId, companyId, data) => {
  const supplier = await Supplier.findOne({ _id: supplierId, companyId });
  if (!supplier) throw new Error("Supplier not found");

  const delivery = await SupplierDelivery.create({
    ...data,
    supplierId,
    companyId,
  });

  // 🔥 After adding → recalculate performance
  await exports.recalculatePerformance(supplierId, companyId);

  return delivery;
};

exports.recalculatePerformance = async (supplierId, companyId) => {
  const deliveries = await SupplierDelivery.find({ supplierId, companyId });

  if (!deliveries.length) return;

  let onTimeCount = 0;
  let totalDefects = 0;
  let totalItems = 0;
  let totalDays = 0;

  deliveries.forEach((d) => {
    if (d.actualDeliveryDate <= d.expectedDeliveryDate) {
      onTimeCount++;
    }

    totalDefects += d.defectiveItems;
    totalItems += d.totalItems;

    const days =
      (new Date(d.actualDeliveryDate) - new Date(d.orderDate)) /
      (1000 * 60 * 60 * 24);

    totalDays += days;
  });

  const onTimeDeliveryRate = (onTimeCount / deliveries.length) * 100;
  const defectRate = (totalDefects / totalItems) * 100;
  const avgDeliveryTime = totalDays / deliveries.length;

  await SupplierPerformance.findOneAndUpdate(
    { supplierId, companyId },
    {
      $set: {
        onTimeDeliveryRate,
        defectRate,
        avgDeliveryTime,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
};
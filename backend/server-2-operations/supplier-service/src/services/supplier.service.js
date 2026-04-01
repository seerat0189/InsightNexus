const Supplier = require("../models/Supplier");
const SupplierPerformance = require("../models/SupplierPerformance");

// ──────────────────────────────────────────────
// SUPPLIER CRUD
// ──────────────────────────────────────────────

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

  // Clean up associated performance record if it exists
  await SupplierPerformance.deleteMany({ supplierId, companyId });

  return supplier;
};

// ──────────────────────────────────────────────
// PERFORMANCE TRACKING
// ──────────────────────────────────────────────

/**
 * Performance Score Formula:
 *   score = (onTimeDeliveryRate × 0.5)
 *         + ((100 - defectRate) × 0.3)
 *         + (clamp(10 - avgDeliveryTime, 0, 10) × 2)
 *
 * Max possible score ≈ 100
 *   - On-time delivery contributes up to 50 pts
 *   - Defect quality contributes up to 30 pts
 *   - Speed contributes up to 20 pts (≤10 days ideal)
 */
const calculateScore = (onTimeDeliveryRate, defectRate, avgDeliveryTime) => {
  const deliveryPoints = onTimeDeliveryRate * 0.5;
  const qualityPoints = (100 - defectRate) * 0.3;
  const speedBonus = Math.max(0, 10 - avgDeliveryTime) * 2;
  const score = deliveryPoints + qualityPoints + speedBonus;
  return Math.min(100, Math.round(score * 10) / 10); // cap at 100, round to 1dp
};

exports.upsertPerformance = async (supplierId, companyId, data) => {
  // Verify supplier belongs to this company
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

  // Enrich each record with supplier name and computed score
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

  // Sort by score descending so best suppliers appear first
  return enriched.sort((a, b) => b.score - a.score);
};

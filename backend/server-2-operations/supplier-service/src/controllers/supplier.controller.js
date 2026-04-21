const supplierService = require("../services/supplier.service");

exports.createSupplier = async (req, res) => {
  try {
    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const supplier = await supplierService.createSupplier(data);

    res.status(201).json({ success: true, supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getSuppliers(req.user.companyId);

    res.status(200).json({ success: true, suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const supplier = await supplierService.updateSupplier(
      supplierId,
      req.user.companyId,
      req.body
    );

    res.status(200).json({ success: true, supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    await supplierService.deleteSupplier(supplierId, req.user.companyId);

    res.status(200).json({ success: true, message: "Supplier deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.upsertPerformance = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { onTimeDeliveryRate, defectRate, avgDeliveryTime } = req.body;

    if (
      onTimeDeliveryRate === undefined ||
      defectRate === undefined ||
      avgDeliveryTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "onTimeDeliveryRate, defectRate, and avgDeliveryTime are required",
      });
    }

    const result = await supplierService.upsertPerformance(
      supplierId,
      req.user.companyId,
      { onTimeDeliveryRate, defectRate, avgDeliveryTime }
    );

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const result = await supplierService.getPerformance(supplierId, req.user.companyId);

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.getAllPerformance = async (req, res) => {
  try {
    const performances = await supplierService.getAllPerformance(req.user.companyId);

    res.status(200).json({ success: true, performances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBestSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.getBestSupplier(req.user.companyId);

    res.status(200).json({
      success: true,
      supplier,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.addDeliveryRecord = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const delivery = await supplierService.addDeliveryRecord(
      supplierId,
      req.user.companyId,
      req.body
    );

    res.status(201).json({
      success: true,
      delivery,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};